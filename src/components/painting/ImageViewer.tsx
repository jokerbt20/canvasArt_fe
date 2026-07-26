import { useState, type MouseEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { motion, AnimatePresence } from "framer-motion";
import { resolveMediaUrl } from "../../utils/media";
import { useFramePreview } from "../../hooks/useFramePreview";
import type { PaintingImage } from "../../types";

interface ImageViewerProps {
  images: PaintingImage[];
  alt: string;
  paintingId: number;
  frameId: number | null;
}

export function ImageViewer({ images, alt, paintingId, frameId }: ImageViewerProps) {
  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const activeImage = sorted[active];
  const activeUrl = resolveMediaUrl(activeImage?.watermarkPath);

  const {
    data: framePreview,
    isLoading: framePreviewLoading,
    isError: framePreviewErrored,
  } = useFramePreview({
    paintingId,
    frameId: frameId ?? undefined,
    paintingImageId: activeImage?.id,
  });

  const framedUrl = frameId !== null && !framePreviewErrored ? resolveMediaUrl(framePreview?.previewUrl) : undefined;
  const displayUrl = framedUrl ?? activeUrl;
  const showLoadingOverlay = frameId !== null && framePreviewLoading;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <Stack spacing={1.5}>
      <Box
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: { md: 480 },
          mx: { md: "auto" },
          overflow: "hidden",
          bgcolor: "#EFE9DF",
          cursor: "zoom-in",
        }}
      >
        <AnimatePresence mode="wait">
          {displayUrl && (
            <motion.img
              key={`${activeImage.id}-${framedUrl ?? "plain"}`}
              src={displayUrl}
              alt={alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                transformOrigin: origin,
                transform: zoomed ? "scale(1.8)" : "scale(1)",
                transition: "transform 200ms ease",
              }}
            />
          )}
        </AnimatePresence>

        {showLoadingOverlay && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(239,233,223,0.55)",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>

      {sorted.length > 1 && (
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: { md: "center" } }}>
          {sorted.map((image, i) => {
            const thumbUrl = resolveMediaUrl(image.thumbnailPath);
            return (
              <Box
                key={image.id}
                onClick={() => setActive(i)}
                component="img"
                src={thumbUrl}
                alt={alt}
                sx={{
                  width: 76,
                  height: 76,
                  objectFit: "cover",
                  cursor: "pointer",
                  opacity: i === active ? 1 : 0.55,
                  border: i === active ? "2px solid" : "2px solid transparent",
                  borderColor: i === active ? "primary.main" : "transparent",
                  transition: "opacity 200ms ease, border-color 200ms ease",
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
