import { useState } from "react";
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { SxProps, Theme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WallpaperOutlinedIcon from "@mui/icons-material/WallpaperOutlined";
import { useFramePreview } from "../../hooks/useFramePreview";
import { resolveMediaUrl } from "../../utils/media";
import { RoomPreview } from "./RoomPreview";
import type { PaintingImage } from "../../types";

interface RoomPreviewDialogProps {
  paintingId: number;
  images: PaintingImage[];
  /** Selected frame; null mounts the bare painting on the wall. */
  frameId: number | null;
  /** Used for the downloaded file name (e.g. the painting slug). */
  fileName?: string;
  sx?: SxProps<Theme>;
}

/** "See it in your room" button plus the dialog hosting {@link RoomPreview}, framed or not. */
export function RoomPreviewDialog({ paintingId, images, frameId, fileName, sx }: RoomPreviewDialogProps) {
  const { t } = useTranslation("gallery");
  const [open, setOpen] = useState(false);
  const fullScreen = useMediaQuery("(max-width:600px)");

  const primaryImage = images.find((i) => i.isPrimary) ?? images[0];

  const {
    data: framePreview,
    isLoading: loadingPreview,
    isError: previewErrored,
  } = useFramePreview({
    paintingId,
    frameId: open ? (frameId ?? undefined) : undefined,
    paintingImageId: primaryImage?.id,
  });

  // Unframed: the public watermarked image is placed directly; framed: the server composite.
  const src = frameId === null ? resolveMediaUrl(primaryImage?.watermarkPath) : framePreview?.previewUrl;

  if (!primaryImage) return null;

  return (
    <>
      <Button
        fullWidth
        size="large"
        variant="outlined"
        startIcon={<WallpaperOutlinedIcon />}
        onClick={() => setOpen(true)}
        sx={sx}
      >
        {t("details.roomPreview.trigger")}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {t("details.roomPreview.title")}
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {frameId !== null && loadingPreview && (
            <Stack sx={{ alignItems: "center", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Stack>
          )}
          {frameId !== null && previewErrored && (
            <Alert severity="info" sx={{ mt: 1 }}>
              {t("details.roomPreview.unavailable")}
            </Alert>
          )}
          {src && <RoomPreview framedSrc={src} fileName={fileName ? `${fileName}-room-preview` : undefined} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
