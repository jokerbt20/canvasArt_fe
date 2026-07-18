import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { PageMeta } from "../../components/common/PageMeta";
import { CheckoutForm, type CheckoutFormValues } from "../../components/forms/CheckoutForm";
import { useCart } from "../../contexts/CartContext";
import { useCartCalculation } from "../../hooks/useCart";
import { useCreateOrder } from "../../hooks/useOrders";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { formatPrice } from "../../utils/format";
import type { CartLineRequest } from "../../types";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation("cart");
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { data: calculation, isLoading: isCalculating } = useCartCalculation();
  const createOrder = useCreateOrder();

  const handleSubmit = async (values: CheckoutFormValues) => {
    const cartLines: CartLineRequest[] = items.map((item) => ({
      paintingId: item.paintingId,
      paintingSizeId: item.paintingSizeId,
      frameId: item.frameId,
      frameSizeId: item.frameSizeId,
      quantity: item.quantity,
    }));

    const order = await createOrder.mutateAsync({ ...values, items: cartLines });
    clearCart();
    navigate(localizedPath(locale, `/checkout/success/${order.orderNumber}`));
  };

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 10, minHeight: "70vh" }}>
      <PageMeta title={t("checkout.title")} />
      <Container>
        <Typography variant="h2" sx={{ mb: 6 }}>
          {t("checkout.title")}
        </Typography>

        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 7 }}>
            {createOrder.isError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {t("checkout.title")}
              </Alert>
            )}
            <CheckoutForm onSubmit={handleSubmit} isSubmitting={createOrder.isPending} />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ border: "1px solid", borderColor: "divider", p: 4, position: "sticky", top: 120 }}>
              <Typography variant="h6" sx={{ mb: 3, textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
                {t("checkout.orderSummary")}
              </Typography>
              {isCalculating || !calculation ? (
                <Stack spacing={1.5}>
                  <Skeleton />
                  <Skeleton />
                </Stack>
              ) : (
                <>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {calculation.items.map((line, i) => (
                      <Stack key={i} direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2">
                          {line.paintingName} · {line.sizeLabel} × {line.quantity}
                        </Typography>
                        <Typography variant="body2">{formatPrice(line.lineTotal, i18n.language)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="subtitle1">{t("summary.total")}</Typography>
                    <Typography variant="h6">{formatPrice(calculation.grandTotal, i18n.language)}</Typography>
                  </Stack>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
