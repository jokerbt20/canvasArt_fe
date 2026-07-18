import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { motion } from "framer-motion";
import { PriceTag } from "../common/PriceTag";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { resolveMediaUrl } from "../../utils/media";
import type { PaintingListItem } from "../../types";

interface PaintingCardProps {
  painting: PaintingListItem;
  index?: number;
}

const NEW_WITHIN_DAYS = 21;

export function PaintingCard({ painting, index = 0 }: PaintingCardProps) {
  const { locale } = useLocale();
  const [loaded, setLoaded] = useState(false);

  const onSale = painting.fromFinalPrice < painting.fromPrice;
  const isNew = Date.now() - new Date(painting.createdAt).getTime() < NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000;
  const thumbnailUrl = resolveMediaUrl(painting.thumbnailPath);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Box
        component={RouterLink}
        to={localizedPath(locale, `/gallery/${painting.slug}`)}
        sx={{ display: "block", textDecoration: "none", color: "inherit" }}
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
              alt={painting.name}
              onLoad={() => setLoaded(true)}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: loaded ? 1 : 0,
                transition: "opacity 500ms ease, transform 600ms ease",
                "&:hover": { transform: "scale(1.045)" },
              }}
            />
          )}

          <Box sx={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 1 }}>
            {isNew && (
              <Chip size="small" label="New" sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }} />
            )}
            {onSale && <Chip size="small" label="Sale" color="error" />}
          </Box>
        </Box>

        <Box sx={{ pt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {painting.categoryName}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5, mb: 1, textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
            {painting.name}
          </Typography>
          <PriceTag price={painting.fromFinalPrice} originalPrice={onSale ? painting.fromPrice : null} size="small" />
        </Box>
      </Box>
    </Box>
  );
}
