import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { motion } from "framer-motion";
import { PriceTag } from "../common/PriceTag";
import { useCart } from "../../contexts/CartContext";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { resolveMediaUrl } from "../../utils/media";
import type { CartLineResponse } from "../../types/cart";
import type { LocalCartLine } from "../../types/cart";

interface CartItemRowProps {
  item: LocalCartLine;
  calculatedLine?: CartLineResponse;
}

export function CartItemRow({ item, calculatedLine }: CartItemRowProps) {
  const { t } = useTranslation("cart");
  const { locale } = useLocale();
  const { updateQuantity, removeItem } = useCart();
  const thumbnailUrl = resolveMediaUrl(item.thumbnailPath);

  return (
    <Stack
      component={motion.div}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -24 }}
      direction={{ xs: "column", sm: "row" }}
      spacing={2.5}
      sx={{ py: 3, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Box
        component={RouterLink}
        to={localizedPath(locale, `/gallery/${item.paintingSlug}`)}
        sx={{ width: 96, height: 120, flexShrink: 0, bgcolor: "#EFE9DF", overflow: "hidden" }}
      >
        {thumbnailUrl && (
          <Box component="img" src={thumbnailUrl} alt={item.paintingName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          component={RouterLink}
          to={localizedPath(locale, `/gallery/${item.paintingSlug}`)}
          variant="h6"
          sx={{ textTransform: "none", fontFamily: "inherit", fontWeight: 500, textDecoration: "none", color: "inherit" }}
        >
          {item.paintingName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("item.size")}: {item.sizeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("item.frame")}: {item.frameName ?? t("item.noFrame")}
          {item.frameSizeLabel ? ` (${item.frameSizeLabel})` : ""}
        </Typography>

        <Stack direction="row" sx={{ mt: 2, alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ alignItems: "center", border: "1px solid", borderColor: "divider", width: "fit-content" }}>
            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ width: 32, textAlign: "center" }}>{item.quantity}</Typography>
            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            {calculatedLine ? (
              <PriceTag
                price={calculatedLine.lineTotal}
                originalPrice={calculatedLine.lineDiscount > 0 ? calculatedLine.lineSubTotal : undefined}
                size="small"
              />
            ) : (
              <Skeleton width={80} />
            )}
            <IconButton size="small" onClick={() => removeItem(item.id)} aria-label={t("item.remove")}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
