import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
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

export default function AdminOrdersPage() {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders({ page, pageSize: 10, search: search || undefined });
  const updateStatus = useUpdateOrderStatus();

  const columns: AdminColumn<OrderListItem>[] = [
    { key: "number", label: "#", render: (row) => row.orderNumber },
    { key: "customer", label: t("table.name"), render: (row) => row.customerName },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "total", label: t("table.price"), render: (row) => formatPrice(row.grandTotal), align: "right" },
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
    { key: "createdAt", label: t("table.createdAt"), render: (row) => new Date(row.createdAt).toLocaleDateString() },
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
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </Box>
  );
}
