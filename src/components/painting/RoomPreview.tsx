import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

interface Vec2 {
  x: number;
  y: number;
}

interface RoomPreviewProps {
  /** Hosted URL of the server-composited framed painting (or the bare painting). */
  framedSrc: string;
  /** Download file name without extension, e.g. the painting's slug. */
  fileName?: string;
}

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Remote URLs get a marker query param for the CORS load: a copy the browser cached earlier
 * *without* CORS headers (e.g. from the gallery <img>) would otherwise be reused and fail.
 */
function withCorsBust(src: string) {
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}cors=1`;
}

// Internal canvas resolution and pseudo-3D projection constants — matches the
// proof-of-concept's hand-rolled perspective approximation (no true homography).
const CW = 1280;
const CH = 720;
const CAM = 900;
const STRIPS = 80;

function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Compute 4 canvas-space corners [tl, tr, br, bl] after:
 *   rotateZ → rotateY (perspX / H lean) → rotateX (perspY / V lean)
 *   → perspective projection.
 */
function computeCorners(
  cx: number,
  cy: number,
  iw: number,
  ih: number,
  scale: number,
  rotZ: number,
  perspX: number,
  perspY: number,
): [Vec2, Vec2, Vec2, Vec2] {
  const hw = (iw * scale) / 2;
  const hh = (ih * scale) / 2;
  const local: [number, number][] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];

  const rz = (rotZ * Math.PI) / 180;
  const ry = (perspX * Math.PI) / 180;
  const rx = (perspY * Math.PI) / 180;

  return local.map(([x0, y0]) => {
    let x = x0 * Math.cos(rz) - y0 * Math.sin(rz);
    let y = x0 * Math.sin(rz) + y0 * Math.cos(rz);
    let z = 0;
    const x2 = x * Math.cos(ry) + z * Math.sin(ry);
    const z2 = -x * Math.sin(ry) + z * Math.cos(ry);
    x = x2;
    z = z2;
    const y3 = y * Math.cos(rx) - z * Math.sin(rx);
    const z3 = y * Math.sin(rx) + z * Math.cos(rx);
    y = y3;
    z = z3;
    const d = CAM / (CAM + z);
    return { x: cx + x * d, y: cy + y * d };
  }) as [Vec2, Vec2, Vec2, Vec2];
}

/** Draw img into a quadrilateral using strip-based affine texture mapping. */
function drawPerspQuad(ctx: CanvasRenderingContext2D, img: HTMLImageElement, corners: [Vec2, Vec2, Vec2, Vec2]) {
  const [tl, tr, br, bl] = corners;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const sh = ih / STRIPS;

  for (let i = 0; i < STRIPS; i++) {
    const t0 = i / STRIPS;
    const t1 = (i + 1) / STRIPS;
    const sl = lerp2(tl, bl, t0);
    const sr = lerp2(tr, br, t0);
    const slN = lerp2(tl, bl, t1);
    const a = (sr.x - sl.x) / iw;
    const b = (sr.y - sl.y) / iw;
    const c = (slN.x - sl.x) / sh;
    const d = (slN.y - sl.y) / sh;
    ctx.save();
    ctx.setTransform(a, b, c, d, sl.x, sl.y);
    ctx.drawImage(img, 0, i * sh, iw, sh + 0.5, 0, 0, iw, sh + 0.5);
    ctx.restore();
  }
}

export function RoomPreview({ framedSrc, fileName }: RoomPreviewProps) {
  const { t } = useTranslation("gallery");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const roomImg = useRef<HTMLImageElement | null>(null);
  const framedImg = useRef<HTMLImageElement | null>(null);
  const roomObjectUrl = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasRoom, setHasRoom] = useState(false);
  const [exportBlocked, setExportBlocked] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [pos, setPos] = useState({ x: 0.5, y: 0.38 });
  const [scale, setScale] = useState(0.35);
  const [rotation, setRotation] = useState(0);
  const [perspX, setPerspX] = useState(0);
  const [perspY, setPerspY] = useState(0);

  const posRef = useRef(pos);
  const scaleRef = useRef(scale);
  const rotRef = useRef(rotation);
  const perspXRef = useRef(perspX);
  const perspYRef = useRef(perspY);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    rotRef.current = rotation;
  }, [rotation]);
  useEffect(() => {
    perspXRef.current = perspX;
  }, [perspX]);
  useEffect(() => {
    perspYRef.current = perspY;
  }, [perspY]);

  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = posRef.current;
    const sc = scaleRef.current;
    const rz = rotRef.current;
    const rX = perspXRef.current;
    const rY = perspYRef.current;

    if (roomImg.current) {
      ctx.drawImage(roomImg.current, 0, 0, CW, CH);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, CH);
      grad.addColorStop(0, "#cfc0a8");
      grad.addColorStop(0.64, "#c5b598");
      grad.addColorStop(0.645, "#8b6e52");
      grad.addColorStop(1, "#6b4f38");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CW, CH);
    }

    if (!framedImg.current) return;
    const img = framedImg.current;

    const corners = computeCorners(p.x * CW, p.y * CH, img.naturalWidth, img.naturalHeight, sc, rz, rX, rY);

    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
      offscreenRef.current.width = CW;
      offscreenRef.current.height = CH;
    }
    const off = offscreenRef.current;
    const offCtx = off.getContext("2d")!;
    offCtx.clearRect(0, 0, CW, CH);
    drawPerspQuad(offCtx, img, corners);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 38;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 14;
    ctx.drawImage(off, 0, 0);
    ctx.restore();

    ctx.drawImage(off, 0, 0);
  }, []);

  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    let cancelled = false;
    // The painting/frame image is served by the API (another origin). Request it with CORS so the
    // canvas stays untainted and "Download image" can export it. If CORS isn't available, fall back
    // to a plain load so the preview still works — only the download is disabled then.
    loadImage(withCorsBust(framedSrc), true)
      .then((img) => ({ img, exportable: true }))
      .catch(() => loadImage(framedSrc, false).then((img) => ({ img, exportable: false })))
      .then(({ img, exportable }) => {
        if (cancelled) return;
        framedImg.current = img;
        setExportBlocked(!exportable);
        drawRef.current();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [framedSrc]);

  useEffect(() => {
    draw();
  }, [pos, scale, rotation, perspX, perspY, draw]);

  useEffect(
    () => () => {
      if (roomObjectUrl.current) URL.revokeObjectURL(roomObjectUrl.current);
    },
    [],
  );

  const handleRoomChange = (file: File | undefined) => {
    if (!file) return;
    if (roomObjectUrl.current) URL.revokeObjectURL(roomObjectUrl.current);
    const url = URL.createObjectURL(file);
    roomObjectUrl.current = url;
    const img = new Image();
    img.onload = () => {
      roomImg.current = img;
      setHasRoom(true);
      drawRef.current();
    };
    img.src = url;
  };

  const normPos = (clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const p = normPos(e.clientX, e.clientY);
    dragStart.current = { mx: p.x, my: p.y, px: posRef.current.x, py: posRef.current.y };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const p = normPos(e.clientX, e.clientY);
    setPos({
      x: Math.max(0, Math.min(1, dragStart.current.px + (p.x - dragStart.current.mx))),
      y: Math.max(0, Math.min(1, dragStart.current.py + (p.y - dragStart.current.my))),
    });
  }, []);

  const stopDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  /** Saves exactly what is on the canvas (room photo + positioned painting) as a JPEG. */
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloadError(false);
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setDownloadError(true);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName || "canvasarts-room-preview"}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          // Give the browser a moment to start the download before releasing the blob.
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        "image/jpeg",
        0.95,
      );
    } catch {
      // SecurityError: the canvas is tainted by a cross-origin image without CORS headers.
      setDownloadError(true);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      <Box
        sx={{
          position: "relative",
          lineHeight: 0,
          borderRadius: 1.5,
          overflow: "hidden",
          boxShadow: 4,
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          width={CW}
          height={CH}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          sx={{ width: "100%", display: "block", cursor: "crosshair" }}
        />
        {hasRoom && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
              pointerEvents: "none",
            }}
          >
            {t("details.roomPreview.dragHint")}
          </Typography>
        )}
      </Box>

      <Button
        variant="outlined"
        startIcon={<CloudUploadOutlinedIcon />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("details.roomPreview.uploadRoom")}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleRoomChange(e.target.files?.[0])}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            {t("details.roomPreview.scale")}
          </Typography>
          <Slider value={scale} min={0.05} max={1.5} step={0.01} onChange={(_, v) => setScale(v as number)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            {t("details.roomPreview.rotation")}
          </Typography>
          <Slider value={rotation} min={-45} max={45} step={0.5} onChange={(_, v) => setRotation(v as number)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            {t("details.roomPreview.perspectiveH")}
          </Typography>
          <Slider value={perspX} min={-65} max={65} step={1} onChange={(_, v) => setPerspX(v as number)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            {t("details.roomPreview.perspectiveV")}
          </Typography>
          <Slider value={perspY} min={-50} max={50} step={1} onChange={(_, v) => setPerspY(v as number)} />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        startIcon={<DownloadOutlinedIcon />}
        onClick={exportImage}
        disabled={exportBlocked}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("details.roomPreview.download")}
      </Button>
      {(exportBlocked || downloadError) && (
        <Typography variant="caption" color="error">
          {t("details.roomPreview.downloadFailed")}
        </Typography>
      )}
    </Stack>
  );
}
