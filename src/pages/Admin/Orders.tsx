import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { OrderDetailsDialog } from "../../components/admin/OrderDetailsDialog";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { formatPrice } from "../../utils/format";
import { orderStatuses, type OrderListItem, type OrderStatus } from "../../types";

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

export default function AdminOrdersPage() {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useOrders({ page, pageSize: 10, search: search || undefined });
  const updateStatus = useUpdateOrderStatus();

  const columns: AdminColumn<OrderListItem>[] = [
    { key: "number", label: "#", render: (row) => row.orderNumber },
    { key: "customer", label: t("table.name"), render: (row) => row.customerName },
    { key: "total", label: t("table.price"), render: (row) => formatPrice(row.grandTotal), align: "right" },
    {
      key: "promo",
      label: t("table.promo"),
      render: (row) =>
        row.promoCode || row.distributorName ? (
          <Stack spacing={0.25}>
            {row.promoCode && (
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {row.promoCode}
              </Typography>
            )}
            {row.distributorName && (
              <Typography variant="caption" color="text.secondary">
                {row.distributorName}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => (
        <Select
          size="small"
          value={row.status}
          onChange={(e) => updateStatus.mutate({ id: row.id, payload: { status: e.target.value as OrderStatus } })}
          renderValue={(value) => <Chip size="small" color={STATUS_COLOR[value as OrderStatus]} label={t(`orders.status.${(value as string).toLowerCase()}`)} />}
        >
          {orderStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {t(`orders.status.${status.toLowerCase()}`)}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      key: "createdAt",
      label: t("table.createdAt"),
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(row.createdAt)}
        </Typography>
      ),
    },
    {
      key: "updatedAt",
      label: t("table.updatedAt"),
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(row.updatedAt)}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: t("table.actions"),
      align: "right",
      render: (row) => (
        <Tooltip title={t("table.view")}>
          <IconButton size="small" onClick={() => setDetailsId(row.id)}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.orders")} />
      <AdminDataTable
        title={t("nav.orders")}
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <OrderDetailsDialog orderId={detailsId} onClose={() => setDetailsId(null)} />
    </Box>
  );
}
