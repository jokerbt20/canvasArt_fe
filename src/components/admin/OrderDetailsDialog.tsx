import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useOrder } from "../../hooks/useOrders";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { OrderStatus } from "../../types";

const STATUS_COLOR: Record<OrderStatus, "default" | "warning" | "info" | "success" | "error"> = {
  Pending: "warning",
  Contacted: "info",
  Confirmed: "info",
  Processing: "info",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "error",
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

interface OrderDetailsDialogProps {
  orderId: number | null;
  onClose: () => void;
}

export function OrderDetailsDialog({ orderId, onClose }: OrderDetailsDialogProps) {
  const { t } = useTranslation(["admin", "common"]);
  const { data: order, isLoading } = useOrder(orderId ?? undefined);

  const statusLabel = (status: OrderStatus) => t(`orders.status.${status.toLowerCase()}`);

  return (
    <Dialog open={orderId !== null} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {order ? t("orderDetail.title", { number: order.orderNumber }) : t("nav.orders")}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading || !order ? (
          <Stack spacing={1.5}>
            <Skeleton height={32} />
            <Skeleton height={120} />
            <Skeleton height={80} />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Chip color={STATUS_COLOR[order.status]} label={statusLabel(order.status)} />
              {order.promoCode && (
                <Chip variant="outlined" label={`${t("orderDetail.promoCode")}: ${order.promoCode}`} />
              )}
              {order.distributorName && (
                <Chip variant="outlined" color="primary" label={`${t("orderDetail.distributor")}: ${order.distributorName}`} />
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("orderDetail.customer")}
                </Typography>
                <Typography variant="body2">
                  {order.firstName} {order.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("orderDetail.shipping")}
                </Typography>
                <Typography variant="body2">{order.addressLine}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.postalCode} {order.city}, {order.country}
                </Typography>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="overline" color="text.secondary">
                {t("orderDetail.items")}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {order.items.map((item) => {
                  const paintingUrl = resolveMediaUrl(item.thumbnailPath);
                  const frameUrl = resolveMediaUrl(item.frameThumbnailPath);
                  return (
                    <Stack key={item.id} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                        <ItemThumb url={paintingUrl} alt={item.paintingName} />
                        {(frameUrl || item.frameName) && (
                          <ItemThumb url={frameUrl} alt={item.frameName ?? ""} />
                        )}
                      </Stack>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2">{item.paintingName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.sizeLabel}
                          {item.frameName ? ` · ${item.frameName}` : ""} × {item.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{formatPrice(item.lineTotal)}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>

            <Box sx={{ maxWidth: 320, ml: "auto", width: "100%" }}>
              <SummaryRow label={t("orderDetail.subtotal")} value={formatPrice(order.subTotal)} />
              {order.discountTotal > 0 && (
                <SummaryRow label={t("orderDetail.discount")} value={`-${formatPrice(order.discountTotal)}`} muted />
              )}
              {order.promoDiscount > 0 && (
                <SummaryRow label={t("orderDetail.promoDiscount")} value={`-${formatPrice(order.promoDiscount)}`} muted />
              )}
              <SummaryRow label={t("orderDetail.shippingCost")} value={formatPrice(order.shippingCost)} />
              <Divider sx={{ my: 1 }} />
              <SummaryRow label={t("orderDetail.total")} value={formatPrice(order.grandTotal)} bold />
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("orderDetail.placedAt")}: {formatDateTime(order.createdAt)}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  {t("orderDetail.updatedAt")}: {formatDateTime(order.updatedAt)}
                </Typography>
              </Grid>
              {order.notes && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="overline" color="text.secondary">
                    {t("orderDetail.notes")}
                  </Typography>
                  <Typography variant="body2">{order.notes}</Typography>
                </Grid>
              )}
            </Grid>

            <Box>
              <Typography variant="overline" color="text.secondary">
                {t("orderDetail.history")}
              </Typography>
              {order.history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("orderDetail.noHistory")}
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {order.history.map((entry) => (
                    <Stack key={entry.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Chip size="small" color={STATUS_COLOR[entry.toStatus]} label={statusLabel(entry.toStatus)} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(entry.createdAt)}
                        {entry.changedByName ? ` · ${entry.changedByName}` : ""}
                        {entry.note ? ` · ${entry.note}` : ""}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common:actions.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ItemThumb({ url, alt }: { url: string | undefined; alt: string }) {
  return (
    <Box sx={{ width: 44, height: 56, bgcolor: "#EFE9DF", borderRadius: 0.5, overflow: "hidden", flexShrink: 0 }}>
      {url && (
        <Box component="img" src={url} alt={alt} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
    </Box>
  );
}

function SummaryRow({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="body2" color={muted ? "text.secondary" : "text.primary"}>
        {label}
      </Typography>
      <Typography variant="body2" color={muted ? "error.main" : "text.primary"} sx={{ fontWeight: bold ? 700 : 400 }}>
        {value}
      </Typography>
    </Stack>
  );
}
