import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { AnimatePresence } from "framer-motion";
import { PageMeta } from "../../components/common/PageMeta";
import { EmptyState } from "../../components/common/EmptyState";
import { CartItemRow } from "../../components/cart/CartItemRow";
import { useCart } from "../../contexts/CartContext";
import { useCartCalculation } from "../../hooks/useCart";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { formatPrice } from "../../utils/format";

export default function CartPage() {
  const { t, i18n } = useTranslation("cart");
  const { locale } = useLocale();
  const { items } = useCart();
  const { data: calculation, isLoading } = useCartCalculation();

  const findCalculatedLine = (item: (typeof items)[number]) =>
    calculation?.items.find(
      (line) =>
        line.paintingId === item.paintingId &&
        line.paintingSizeId === item.paintingSizeId &&
        (line.frameId ?? null) === item.frameId &&
        (line.frameSizeId ?? null) === item.frameSizeId,
    );

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 10, minHeight: "70vh" }}>
      <PageMeta title={t("title")} />
      <Container>
        <Typography variant="h2" sx={{ mb: 6 }}>
          {t("title")}
        </Typography>

        {items.length === 0 ? (
          <EmptyState
            title={t("empty.title")}
            subtitle={t("empty.subtitle")}
            action={
              <Button component={RouterLink} to={localizedPath(locale, "/gallery")} variant="contained">
                {t("empty.cta")}
              </Button>
            }
          />
        ) : (
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 8 }}>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} calculatedLine={findCalculatedLine(item)} />
                ))}
              </AnimatePresence>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", p: 4, position: "sticky", top: 120 }}>
                <Typography variant="h6" sx={{ mb: 3, textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
                  {t("summary.title")}
                </Typography>
                {isLoading || !calculation ? (
                  <Stack spacing={1.5}>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton height={40} />
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("summary.subtotal")}
                      </Typography>
                      <Typography variant="body2">{formatPrice(calculation.subTotal, i18n.language)}</Typography>
                    </Stack>
                    {calculation.discountTotal > 0 && (
                      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("summary.discount")}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          -{formatPrice(calculation.discountTotal, i18n.language)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("summary.shipping")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("summary.shippingCalculated")}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="subtitle1">{t("summary.total")}</Typography>
                      <Typography variant="h6">{formatPrice(calculation.grandTotal, i18n.language)}</Typography>
                    </Stack>
                  </Stack>
                )}

                <Button component={RouterLink} to={localizedPath(locale, "/checkout")} fullWidth variant="contained" size="large" sx={{ mt: 4 }}>
                  {t("summary.checkout")}
                </Button>
                <Button component={RouterLink} to={localizedPath(locale, "/gallery")} fullWidth variant="text" sx={{ mt: 1 }}>
                  {t("summary.continueShopping")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
