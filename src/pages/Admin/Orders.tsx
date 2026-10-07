import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { OrderDetailsDialog } from "../../components/admin/OrderDetailsDialog";
import { OrderStatusSelect, StatusDot } from "../../components/admin/OrderStatusSelect";
import { EASE_OUT, InitialsAvatar, Pill } from "../../components/admin/TableBadges";
import { filterFieldSx, formatDate, formatRelative, formatTime } from "../../components/admin/adminFormat";
import { useOrders, useOrderStats, useUpdateOrderStatus } from "../../hooks/useOrders";
import { formatPrice } from "../../utils/format";
import { palette } from "../../theme/palette";
import { orderStatuses, type OrderListItem, type OrderQuery, type OrderStatus } from "../../types";

type Period = "" | "today" | "7d" | "30d" | "90d";
type SortOption = "newest" | "oldest" | "totalHigh" | "totalLow" | "number";

interface ListFilters {
  status: "" | OrderStatus;
  period: Period;
  sort: SortOption;
}

const DEFAULT_FILTERS: ListFilters = { status: "", period: "", sort: "newest" };

const SORTS: Record<SortOption, Pick<OrderQuery, "sortBy" | "sortDir">> = {
  newest: { sortBy: "created", sortDir: "desc" },
  oldest: { sortBy: "created", sortDir: "asc" },
  totalHigh: { sortBy: "total", sortDir: "desc" },
  totalLow: { sortBy: "total", sortDir: "asc" },
  number: { sortBy: "number", sortDir: "desc" },
};

const PERIOD_DAYS: Record<Exclude<Period, "">, number> = { today: 0, "7d": 7, "30d": 30, "90d": 90 };

function periodStart(period: Period): string | undefined {
  if (!period) return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  return d.toISOString();
}

const DAY_MS = 86_400_000;

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation("admin");
  const locale = i18n.language;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useOrders({
    page,
    pageSize: 25,
    search: search || undefined,
    status: filters.status || undefined,
    fromDate: periodStart(filters.period),
    ...SORTS[filters.sort],
  });
  const { data: stats } = useOrderStats();
  const updateStatus = useUpdateOrderStatus();

  const filtersActive = (Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]).some((k) => filters[k] !== DEFAULT_FILTERS[k]);
  const setFilter = <K extends keyof ListFilters>(key: K, value: ListFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns: AdminColumn<OrderListItem>[] = [
    {
      key: "order",
      label: t("ordersTable.order"),
      render: (row) => {
        const isNew = Date.now() - new Date(row.createdAt).getTime() < DAY_MS;
        return (
          <Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Typography
                sx={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                }}
              >
                {row.orderNumber}
              </Typography>
              {isNew && <Pill tone="gold">{t("ordersTable.new")}</Pill>}
            </Stack>
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.25 }}>
              {t("ordersTable.items", { count: row.itemCount })}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "customer",
      label: t("ordersTable.customer"),
      render: (row) => (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0, maxWidth: 260 }}>
            <InitialsAvatar name={row.customerName} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                {row.customerName}
              </Typography>
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                {row.email}
              </Typography>
            </Box>
          </Stack>
      ),
    },
    {
      key: "total",
      label: t("ordersTable.total"),
      align: "right",
      render: (row) => (
        <Typography sx={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {formatPrice(row.grandTotal, locale)}
        </Typography>
      ),
    },
    {
      key: "promo",
      label: t("table.promo"),
      render: (row) =>
        row.promoCode || row.distributorName ? (
          <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
            {row.promoCode && (
              <Pill tone="gold" icon={<LocalOfferOutlinedIcon />}>
                <Box component="span" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
                  {row.promoCode}
                </Box>
              </Pill>
            )}
            {row.distributorName && (
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", maxWidth: 160 }}>
                {row.distributorName}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => (
        <OrderStatusSelect
          value={row.status}
          saving={updateStatus.isPending && updateStatus.variables?.id === row.id}
          onChange={(status) => updateStatus.mutate({ id: row.id, payload: { status } })}
        />
      ),
    },
    {
      key: "placed",
      label: `${t("table.createdAt")} / ${t("table.updatedAt")}`,
      render: (row) => {
        const wasUpdated = new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime() > 60_000;
        return (
          <Box sx={{ whiteSpace: "nowrap" }}>
            <Tooltip title={new Date(row.createdAt).toLocaleString(locale)} placement="top-start">
              <Typography component="span" sx={{ fontSize: 13, fontVariantNumeric: "tabular-nums", cursor: "default" }}>
                {formatDate(row.createdAt, locale)}
                <Box component="span" sx={{ color: "text.secondary", ml: 0.75 }}>
                  {formatTime(row.createdAt, locale)}
                </Box>
              </Typography>
            </Tooltip>
            {wasUpdated && (
              <Tooltip title={new Date(row.updatedAt).toLocaleString(locale)} placement="bottom-start">
                <Typography sx={{ fontSize: 11.5, color: "text.secondary", cursor: "default", width: "fit-content" }}>
                  {t("table.updatedRel", { when: formatRelative(row.updatedAt, locale) })}
                </Typography>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <Tooltip title={t("table.view")}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDetailsId(row.id);
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Rendered inline on the table toolbar, next to search.
  const filterBar = (
    <>
      <TextField
        select
        size="small"
        label={t("table.status")}
        value={filters.status}
        onChange={(e) => setFilter("status", e.target.value as ListFilters["status"])}
        sx={filterFieldSx(Boolean(filters.status), 150)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        {orderStatuses.map((status) => (
          <MenuItem key={status} value={status} sx={{ gap: 1.25 }}>
            <StatusDot status={status} />
            {t(`orders.status.${status.toLowerCase()}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t("ordersTable.period")}
        value={filters.period}
        onChange={(e) => setFilter("period", e.target.value as Period)}
        sx={filterFieldSx(Boolean(filters.period), 140)}
      >
        <MenuItem value="">{t("ordersTable.periods.all")}</MenuItem>
        {(Object.keys(PERIOD_DAYS) as Exclude<Period, "">[]).map((p) => (
          <MenuItem key={p} value={p}>
            {t(`ordersTable.periods.${p}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t("filters.sort")}
        value={filters.sort}
        onChange={(e) => setFilter("sort", e.target.value as SortOption)}
        sx={filterFieldSx(filters.sort !== DEFAULT_FILTERS.sort, 160)}
      >
        {(Object.keys(SORTS) as SortOption[]).map((key) => (
          <MenuItem key={key} value={key}>
            {t(`ordersTable.sorts.${key}`)}
          </MenuItem>
        ))}
      </TextField>
      {filtersActive && (
        <Button
          size="small"
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(1);
          }}
          sx={{
            color: "text.secondary",
            animation: `adminFadeIn 160ms ${EASE_OUT}`,
            "@keyframes adminFadeIn": { from: { opacity: 0, transform: "scale(0.95)" } },
            transition: `transform 140ms ${EASE_OUT}`,
            "&:active": { transform: "scale(0.97)" },
          }}
        >
          {t("filters.clear")}
        </Button>
      )}
    </>
  );

  const titleExtra = (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      {data && <Pill tone={data.totalCount ? "gold" : "neutral"}>{t("ordersTable.count", { count: data.totalCount })}</Pill>}
      {stats && stats.pending > 0 && (
        <Box
          component="button"
          type="button"
          onClick={() => setFilter("status", filters.status === "Pending" ? "" : "Pending")}
          sx={{
            all: "unset",
            cursor: "pointer",
            borderRadius: 999,
            transition: `transform 140ms ${EASE_OUT}`,
            "&:active": { transform: "scale(0.96)" },
            "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2 },
          }}
        >
          <Pill tone="danger" icon={<StatusDot status="Pending" size={6} />} tooltip={t("ordersTable.pendingHint")}>
            {t("ordersTable.pending", { count: stats.pending })}
          </Pill>
        </Box>
      )}
    </Stack>
  );

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <PageMeta title={t("nav.orders")} />
      <AdminDataTable
        fillHeight
        title={t("nav.orders")}
        titleExtra={titleExtra}
        filters={filterBar}
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        onRowClick={(row) => setDetailsId(row.id)}
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
