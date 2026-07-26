import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { PriceTag } from "../common/PriceTag";
import { resolveMediaUrl } from "../../utils/media";
import type { FrameListItem } from "../../types";

interface FrameCardProps {
  frame: FrameListItem;
  index?: number;
}

export function FrameCard({ frame, index = 0 }: FrameCardProps) {
  const onSale = frame.finalPrice < frame.basePrice;
  const thumbnailUrl = resolveMediaUrl(frame.thumbnailPath);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: "4 / 5",
          bgcolor: "#EFE9DF",
        }}
      >
        {thumbnailUrl && (
          <Box
            component="img"
            src={thumbnailUrl}
            alt={frame.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 600ms ease",
              "&:hover": { transform: "scale(1.045)" },
            }}
          />
        )}
      </Box>

      <Box sx={{ pt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {frame.material}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, mb: 1, textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
          {frame.name}
        </Typography>
        <PriceTag price={frame.finalPrice} originalPrice={onSale ? frame.basePrice : null} size="small" />
      </Box>
    </Box>
  );
}
