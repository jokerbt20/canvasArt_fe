import { useState, type MouseEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { motion, AnimatePresence } from "framer-motion";
import { resolveMediaUrl } from "../../utils/media";
import type { PaintingImage } from "../../types";

interface ImageViewerProps {
  images: PaintingImage[];
  alt: string;
}

export function ImageViewer({ images, alt }: ImageViewerProps) {
  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const activeImage = sorted[active];
  const activeUrl = resolveMediaUrl(activeImage?.watermarkPath);

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
          aspectRatio: "4 / 5",
          overflow: "hidden",
          bgcolor: "#EFE9DF",
          cursor: "zoom-in",
        }}
      >
        <AnimatePresence mode="wait">
          {activeUrl && (
            <motion.img
              key={activeImage.id}
              src={activeUrl}
              alt={alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transformOrigin: origin,
                transform: zoomed ? "scale(1.8)" : "scale(1)",
                transition: "transform 200ms ease",
              }}
            />
          )}
        </AnimatePresence>
      </Box>

      {sorted.length > 1 && (
        <Stack direction="row" spacing={1.5}>
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
