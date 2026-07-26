import { useState } from "react";
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
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { PageMeta } from "../../components/common/PageMeta";
import { CheckoutForm, type CheckoutFormValues } from "../../components/forms/CheckoutForm";
import { useCart } from "../../contexts/CartContext";
import { useCartCalculation } from "../../hooks/useCart";
import { useCreateOrder } from "../../hooks/useOrders";
import { useApplyPromoCode } from "../../hooks/useDistributors";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { formatPrice } from "../../utils/format";
import type { CartLineRequest, PromoCodeApplyResult } from "../../types";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation("cart");
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { data: calculation, isLoading: isCalculating } = useCartCalculation();
  const createOrder = useCreateOrder();

  const applyPromo = useApplyPromoCode();
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeApplyResult | null>(null);

  const goodsTotal = calculation?.grandTotal ?? 0;
  const promoDiscount = appliedPromo
    ? Math.round(goodsTotal * appliedPromo.discountPercentage) / 100
    : 0;
  const totalAfterPromo = goodsTotal - promoDiscount;

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    const result = await applyPromo.mutateAsync({ code });
    setAppliedPromo(result);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    applyPromo.reset();
  };

  const handleSubmit = async (values: CheckoutFormValues) => {
    const cartLines: CartLineRequest[] = items.map((item) => ({
      paintingId: item.paintingId,
      paintingSizeId: item.paintingSizeId,
      frameId: item.frameId,
      quantity: item.quantity,
    }));

    const order = await createOrder.mutateAsync({
      ...values,
      promoCode: appliedPromo?.code,
      items: cartLines,
    });
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

                  {appliedPromo ? (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Alert severity="success" sx={{ py: 0 }} onClose={handleRemovePromo}>
                        {t("checkout.promoApplied", {
                          code: appliedPromo.code,
                          percentage: appliedPromo.discountPercentage,
                        })}
                      </Alert>
                      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2">{t("checkout.promoDiscount")}</Typography>
                        <Typography variant="body2" color="success.main">
                          −{formatPrice(promoDiscount, i18n.language)}
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          fullWidth
                          label={t("checkout.promoCode")}
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleApplyPromo();
                            }
                          }}
                          error={applyPromo.isError}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || applyPromo.isPending}
                        >
                          {t("checkout.promoApply")}
                        </Button>
                      </Stack>
                      {applyPromo.isError && (
                        <Typography variant="caption" color="error">
                          {t("checkout.promoInvalid")}
                        </Typography>
                      )}
                    </Stack>
                  )}

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="subtitle1">{t("summary.total")}</Typography>
                    <Typography variant="h6">{formatPrice(totalAfterPromo, i18n.language)}</Typography>
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
