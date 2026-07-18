import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../utils/format";

interface PriceTagProps {
  price: number;
  originalPrice?: number | null;
  size?: "small" | "medium" | "large";
}

export function PriceTag({ price, originalPrice, size = "medium" }: PriceTagProps) {
  const { i18n } = useTranslation();
  const onSale = Boolean(originalPrice && originalPrice > price);
  const variant = size === "large" ? "h5" : size === "small" ? "body2" : "subtitle1";

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "baseline" }}>
      <Typography variant={variant} sx={{ fontWeight: 600, color: onSale ? "error.main" : "text.primary" }}>
        {formatPrice(price, i18n.language)}
      </Typography>
      {onSale && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: "line-through" }}
        >
          {formatPrice(originalPrice as number, i18n.language)}
        </Typography>
      )}
    </Stack>
  );
}
