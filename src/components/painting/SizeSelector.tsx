import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatPrice } from "../../utils/format";
import type { PaintingSize } from "../../types";

interface SizeSelectorProps {
  sizes: PaintingSize[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function SizeSelector({ sizes, selectedId, onSelect }: SizeSelectorProps) {
  const { t, i18n } = useTranslation("gallery");

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
        {t("details.size")}
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
        {sizes.map((size) => {
          const selected = size.id === selectedId;
          return (
            <Box
              key={size.id}
              onClick={() => onSelect(size.id)}
              sx={{
                px: 2.5,
                py: 1.5,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "primary.main" : "transparent",
                color: selected ? "primary.contrastText" : "text.primary",
                cursor: size.stock > 0 ? "pointer" : "not-allowed",
                opacity: size.stock > 0 ? 1 : 0.4,
                minWidth: 92,
                textAlign: "center",
                transition: "all 200ms ease",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {size.label}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatPrice(size.finalPrice, i18n.language)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
