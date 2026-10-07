import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import InputAdornment from "@mui/material/InputAdornment";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LoyaltyOutlinedIcon from "@mui/icons-material/LoyaltyOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { AdminDialog, DialogIconTile, SettingRow } from "../../components/admin/AdminDialog";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { EASE_OUT, InitialsAvatar, Pill } from "../../components/admin/TableBadges";
import { PromoPhasePill } from "../../components/admin/PromotionCells";
import { filterFieldSx, formatDate, promoCodePhase, type PromoPhase } from "../../components/admin/adminFormat";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useFieldErrors, v } from "../../utils/validation";
import { formatPrice } from "../../utils/format";
import { palette } from "../../theme/palette";
import {
  useCreateDistributor,
  useCreatePromoCode,
  useDeleteDistributor,
  useDeletePromoCode,
  useDistributorDashboard,
  useDistributors,
  usePromoCodes,
  useUpdateDistributor,
  useUpdatePromoCode,
} from "../../hooks/useDistributors";
import type { Distributor, DistributorSalesRow, PromoCode } from "../../types";

interface DistributorFormState {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

const EMPTY_DISTRIBUTOR: DistributorFormState = { name: "", email: "", phone: "", isActive: true };

interface PromoCodeFormState {
  code: string;
  discountPercentage: string;
  isActive: boolean;
  /** yyyy-mm-dd, empty = no limit */
  startsAt: string;
  endsAt: string;
}

const EMPTY_PROMO: PromoCodeFormState = { code: "", discountPercentage: "", isActive: true, startsAt: "", endsAt: "" };

type Period = "" | "30d" | "90d";
type SortOption = "name" | "sales" | "orders" | "codes" | "newest";

interface ListFilters {
  status: "" | "active" | "inactive";
  period: Period;
  sort: SortOption;
}

const DEFAULT_FILTERS: ListFilters = { status: "", period: "", sort: "name" };
const SORTS: SortOption[] = ["name", "sales", "orders", "codes", "newest"];
const PERIOD_DAYS: Record<Exclude<Period, "">, number> = { "30d": 30, "90d": 90 };

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function periodStart(period: Period): string | undefined {
  if (!period) return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  return d.toISOString();
}

export default function AdminDistributorsPage() {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const locale = i18n.language;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  // Partners are few: load them all once and filter/sort client-side so it feels instant.
  const { data, isLoading, isError, refetch } = useDistributors({ page: 1, pageSize: 100 });
  const { data: sales } = useDistributorDashboard({ fromDate: periodStart(filters.period) });
  const salesById = new Map<number, DistributorSalesRow>((sales ?? []).map((r) => [r.distributorId, r]));

  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();
  const deleteDistributor = useDeleteDistributor();
  const { errors, validate, clearError, reset } = useFieldErrors<DistributorFormState>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);
  const [form, setForm] = useState<DistributorFormState>(EMPTY_DISTRIBUTOR);
  const [pendingDelete, setPendingDelete] = useState<Distributor | null>(null);
  const [codesFor, setCodesFor] = useState<Distributor | null>(null);

  const isSaving = createDistributor.isPending || updateDistributor.isPending;
  const filtersActive = (Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]).some((k) => filters[k] !== DEFAULT_FILTERS[k]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_DISTRIBUTOR);
    reset();
    setDialogOpen(true);
  };

  const openEdit = (distributor: Distributor) => {
    setEditing(distributor);
    setForm({
      name: distributor.name,
      email: distributor.email ?? "",
      phone: distributor.phone ?? "",
      isActive: distributor.isActive,
    });
    reset();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form, { name: v.required, email: v.email })) return;
    const payload = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await updateDistributor.mutateAsync({ id: editing.id, payload });
      } else {
        await createDistributor.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const q = search.trim().toLowerCase();
  const rows = (data?.items ?? [])
    .filter((d) => (filters.status === "active" ? d.isActive : filters.status === "inactive" ? !d.isActive : true))
    .filter((d) => !q || [d.name, d.email, d.phone].some((s) => s?.toLowerCase().includes(q)))
    .sort((a, b) => {
      const sa = salesById.get(a.id);
      const sb = salesById.get(b.id);
      switch (filters.sort) {
        case "sales":
          return (sb?.totalSales ?? 0) - (sa?.totalSales ?? 0);
        case "orders":
          return (sb?.orderCount ?? 0) - (sa?.orderCount ?? 0);
        case "codes":
          return b.promoCodeCount - a.promoCodeCount;
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return a.name.localeCompare(b.name, locale);
      }
    });

  const topSales = Math.max(0, ...(sales ?? []).map((r) => r.totalSales));

  const columns: AdminColumn<Distributor>[] = [
    {
      key: "name",
      label: t("distributors.distributor"),
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0, maxWidth: 260 }}>
          <InitialsAvatar name={row.name} size={34} muted={!row.isActive} />
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: row.isActive ? "text.primary" : "text.secondary" }}>
              {row.name}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {t("distributors.since", { date: formatDate(row.createdAt, locale) })}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "contact",
      label: t("distributors.contact"),
      render: (row) =>
        row.email || row.phone ? (
          <Stack spacing={0.25} sx={{ minWidth: 0, maxWidth: 240, "& svg": { fontSize: 14, color: "text.disabled" } }}>
            {row.email && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                <MailOutlineRoundedIcon />
                <Typography noWrap sx={{ fontSize: 13 }}>
                  {row.email}
                </Typography>
              </Stack>
            )}
            {row.phone && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <PhoneOutlinedIcon />
                <Typography noWrap sx={{ fontSize: 12.5, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                  {row.phone}
                </Typography>
              </Stack>
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      key: "codes",
      label: t("distributors.activeCodes"),
      render: (row) => <PromoCodesCell distributor={row} onOpen={() => setCodesFor(row)} />,
    },
    {
      key: "orders",
      label: t("distributors.orders"),
      align: "right",
      render: (row) => {
        const s = salesById.get(row.id);
        if (!sales) return <Skeleton width={24} sx={{ ml: "auto" }} />;
        return (
          <Typography sx={{ fontSize: 13.5, fontWeight: s?.orderCount ? 600 : 400, color: s?.orderCount ? "text.primary" : "text.disabled", fontVariantNumeric: "tabular-nums" }}>
            {s?.orderCount ?? 0}
          </Typography>
        );
      },
    },
    {
      key: "sales",
      label: t("distributors.sales"),
      align: "right",
      render: (row) => {
        const s = salesById.get(row.id);
        if (!sales) return <Skeleton width={70} sx={{ ml: "auto" }} />;
        const share = topSales ? (s?.totalSales ?? 0) / topSales : 0;
        return (
          <Box sx={{ minWidth: 110 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: s?.totalSales ? "text.primary" : "text.disabled" }}>
              {formatPrice(s?.totalSales ?? 0, locale)}
            </Typography>
            {/* Relative bar vs. the top partner in the selected period. */}
            <Box sx={{ mt: 0.5, ml: "auto", height: 3, width: 90, borderRadius: 999, bgcolor: alpha(palette.charcoal, 0.06), overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  bgcolor: palette.gold,
                  transformOrigin: "left",
                  transform: `scaleX(${share})`,
                  transition: `transform 500ms ${EASE_OUT}`,
                  animation: `distFill 600ms ${EASE_OUT}`,
                  "@keyframes distFill": { from: { transform: "scaleX(0)" } },
                  "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
                }}
              />
            </Box>
            {!!s?.totalPromoDiscount && (
              <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25, whiteSpace: "nowrap" }}>
                {t("distributors.discountGiven", { amount: formatPrice(s.totalPromoDiscount, locale) })}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) =>
        row.isActive ? (
          <Pill tone="success" dot>
            {t("distributors.active")}
          </Pill>
        ) : (
          <Pill tone="neutral" dot>
            {t("distributors.inactive")}
          </Pill>
        ),
    },
  ];

  const filterBar = (
    <>
      <TextField
        select
        size="small"
        label={t("table.status")}
        value={filters.status}
        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as ListFilters["status"] }))}
        sx={filterFieldSx(Boolean(filters.status), 130)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        <MenuItem value="active">{t("distributors.active")}</MenuItem>
        <MenuItem value="inactive">{t("distributors.inactive")}</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label={t("distributors.salesPeriod")}
        value={filters.period}
        onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value as Period }))}
        sx={filterFieldSx(Boolean(filters.period), 150)}
      >
        <MenuItem value="">{t("ordersTable.periods.all")}</MenuItem>
        <MenuItem value="30d">{t("ordersTable.periods.30d")}</MenuItem>
        <MenuItem value="90d">{t("ordersTable.periods.90d")}</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label={t("filters.sort")}
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))}
        sx={filterFieldSx(filters.sort !== DEFAULT_FILTERS.sort, 160)}
      >
        {SORTS.map((key) => (
          <MenuItem key={key} value={key}>
            {t(`distributors.sorts.${key}`)}
          </MenuItem>
        ))}
      </TextField>
      {filtersActive && (
        <Button
          size="small"
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={() => setFilters(DEFAULT_FILTERS)}
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

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <PageMeta title={t("nav.distributors")} />
      <AdminDataTable
        fillHeight
        title={t("nav.distributors")}
        titleExtra={data && <Pill tone={rows.length ? "gold" : "neutral"}>{t("distributors.count", { count: rows.length })}</Pill>}
        filters={filterBar}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={openEdit}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        onAddNew={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <AdminDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        media={
          form.name.trim() ? (
            <InitialsAvatar name={form.name} size={40} muted={!form.isActive} />
          ) : (
            <DialogIconTile>
              <PersonOutlineRoundedIcon />
            </DialogIconTile>
          )
        }
        title={editing ? t("distributors.editTitle") : t("distributors.newTitle")}
        subtitle={t("distributors.dialogSubtitle")}
        actions={
          <>
            <Button color="inherit" onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>
              {t("common:actions.cancel")}
            </Button>
            <SubmitButton variant="contained" onClick={handleSave} loading={isSaving}>
              {editing ? t("common:actions.save") : t("distributors.create")}
            </SubmitButton>
          </>
        }
      >
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label={t("table.name")}
            placeholder={t("distributors.namePlaceholder")}
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              clearError("name");
            }}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            slotProps={{ input: { startAdornment: <FieldIcon><PersonOutlineRoundedIcon /></FieldIcon> } }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t("distributors.email")}
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                clearError("email");
              }}
              error={Boolean(errors.email)}
              helperText={errors.email ?? t("distributors.optional")}
              fullWidth
              slotProps={{ input: { startAdornment: <FieldIcon><MailOutlineRoundedIcon /></FieldIcon> } }}
            />
            <TextField
              label={t("distributors.phone")}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              helperText={t("distributors.optional")}
              fullWidth
              slotProps={{ input: { startAdornment: <FieldIcon><PhoneOutlinedIcon /></FieldIcon> } }}
            />
          </Stack>
          <SettingRow
            tone={form.isActive ? "on" : "off"}
            title={form.isActive ? t("distributors.active") : t("distributors.inactive")}
            hint={form.isActive ? t("distributors.activeHint") : t("distributors.inactiveHint")}
            control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} color="success" />}
          />
        </Stack>
      </AdminDialog>

      <PromoCodesDialog distributor={codesFor} onClose={() => setCodesFor(null)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteDistributor.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteDistributor.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}

const PHASE_RANK: Record<PromoPhase, number> = { live: 0, scheduled: 1, paused: 2, expired: 3 };
const PHASE_DOT: Record<PromoPhase, string> = {
  live: palette.success,
  scheduled: "#3F6E8C",
  paused: palette.textSecondary,
  expired: palette.textSecondary,
};

/** "until 31 Oct" / "from 5 Nov" / "no end date" / "ended 2 Oct" for one code. */
function useCodeWindowLabel() {
  const { t, i18n } = useTranslation("admin");
  return (code: PromoCode, phase: PromoPhase) => {
    const d = (v: string) => formatShortDate(v, i18n.language);
    if (phase === "scheduled" && code.startsAt) return t("distributors.window.from", { date: d(code.startsAt) });
    if (phase === "expired" && code.endsAt) return t("distributors.window.ended", { date: d(code.endsAt) });
    if (code.endsAt) return t("distributors.window.until", { date: d(code.endsAt) });
    return t("distributors.window.noEnd");
  };
}

const formatShortDate = (value: string, locale: string) =>
  new Date(value).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

/** Table cell: the distributor's usable codes (live first, then scheduled) with their end dates. */
function PromoCodesCell({ distributor, onOpen }: { distributor: Distributor; onOpen: () => void }) {
  const { t } = useTranslation("admin");
  const windowLabel = useCodeWindowLabel();
  const { data: codes, isLoading } = usePromoCodes(distributor.promoCodeCount ? distributor.id : undefined);

  const ranked = (codes ?? [])
    .map((c) => ({ code: c, phase: promoCodePhase(c) }))
    .sort((a, b) => PHASE_RANK[a.phase] - PHASE_RANK[b.phase] || a.code.code.localeCompare(b.code.code));
  const usable = ranked.filter((r) => r.phase === "live" || r.phase === "scheduled");
  const shown = usable.slice(0, 2);
  const rest = ranked.length - shown.length;

  return (
    <Box sx={{ minWidth: 200, maxWidth: 280 }}>
      {distributor.promoCodeCount > 0 && isLoading ? (
        <Skeleton width={150} height={20} />
      ) : (
        <Stack spacing={0.5}>
          {shown.map(({ code, phase }) => (
            <Stack key={code.id} direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: PHASE_DOT[phase] }} />
              <Typography sx={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em" }}>{code.code}</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.goldDark, fontVariantNumeric: "tabular-nums" }}>
                −{code.discountPercentage}%
              </Typography>
              <Typography noWrap sx={{ fontSize: 11.5, color: phase === "scheduled" ? PHASE_DOT.scheduled : "text.secondary" }}>
                · {windowLabel(code, phase)}
              </Typography>
            </Stack>
          ))}
          {codes && usable.length === 0 && codes.length > 0 && (
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{t("distributors.noUsableCodes")}</Typography>
          )}
        </Stack>
      )}
      <Box
        component="button"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        sx={{
          all: "unset",
          cursor: "pointer",
          mt: distributor.promoCodeCount ? 0.5 : 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          fontSize: 12,
          fontWeight: 600,
          color: palette.goldDark,
          borderRadius: 0.5,
          "& svg": { fontSize: 15 },
          "& .chev": { transition: `transform 160ms ${EASE_OUT}` },
          "@media (hover: hover) and (pointer: fine)": { "&:hover .chev": { transform: "translateX(2px)" }, "&:hover": { textDecoration: "underline" } },
          "&:active": { opacity: 0.7 },
          "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2 },
        }}
      >
        {distributor.promoCodeCount === 0 ? (
          <>
            <AddIcon />
            {t("distributors.addFirstCode")}
          </>
        ) : rest > 0 ? (
          t("distributors.manageMore", { count: rest })
        ) : (
          t("distributors.manageCodes")
        )}
        <ChevronRightRoundedIcon className="chev" />
      </Box>
    </Box>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <InputAdornment position="start" sx={{ color: "text.disabled", "& svg": { fontSize: 18 } }}>
      {children}
    </InputAdornment>
  );
}

/** Copy-to-clipboard button whose icon crossfades (with a touch of blur) into a check. */
function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation("admin");
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const iconSx = (visible: boolean) => ({
    gridArea: "1 / 1",
    fontSize: 16,
    opacity: visible ? 1 : 0,
    filter: visible ? "blur(0)" : "blur(2px)",
    transform: visible ? "scale(1)" : "scale(0.8)",
    transition: `opacity 180ms ease, filter 180ms ease, transform 180ms ${EASE_OUT}`,
  });

  return (
    <Tooltip title={copied ? t("distributors.copied") : t("distributors.copy")} placement="top">
      <IconButton
        size="small"
        onClick={() => {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1500);
        }}
        sx={{
          color: copied ? palette.success : "text.secondary",
          transition: `color 150ms ease, transform 140ms ${EASE_OUT}`,
          "&:active": { transform: "scale(0.9)" },
        }}
      >
        <Box sx={{ display: "grid" }}>
          <ContentCopyRoundedIcon sx={iconSx(!copied)} />
          <CheckRoundedIcon sx={iconSx(copied)} />
        </Box>
      </IconButton>
    </Tooltip>
  );
}

function PromoCodesDialog({ distributor, onClose }: { distributor: Distributor | null; onClose: () => void }) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { data: codes, isLoading } = usePromoCodes(distributor?.id);
  const createCode = useCreatePromoCode();
  const updateCode = useUpdatePromoCode();
  const deleteCode = useDeletePromoCode();
  const { errors, validate, clearError, reset } = useFieldErrors<PromoCodeFormState>();

  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoCodeFormState>(EMPTY_PROMO);
  const [pendingDelete, setPendingDelete] = useState<PromoCode | null>(null);

  const isSavingCode = createCode.isPending || updateCode.isPending;
  const togglingId = updateCode.isPending && !editingCode ? updateCode.variables?.id : undefined;

  const resetForm = () => {
    setEditingCode(null);
    setForm(EMPTY_PROMO);
    reset();
  };

  const close = () => {
    resetForm();
    onClose();
  };

  const startEdit = (code: PromoCode) => {
    setEditingCode(code);
    setForm({
      code: code.code,
      discountPercentage: String(code.discountPercentage),
      isActive: code.isActive,
      startsAt: code.startsAt?.slice(0, 10) ?? "",
      endsAt: code.endsAt?.slice(0, 10) ?? "",
    });
    reset();
  };

  const toggleActive = (code: PromoCode) =>
    updateCode.mutate({
      id: code.id,
      payload: {
        code: code.code,
        discountPercentage: code.discountPercentage,
        isActive: !code.isActive,
        startsAt: code.startsAt,
        endsAt: code.endsAt,
      },
    });

  const handleSave = async () => {
    if (!distributor) return;
    if (
      !validate(form, {
        code: v.required,
        discountPercentage: v.positiveNumber,
        endsAt: (value: string, values: PromoCodeFormState) =>
          value && values.startsAt && value < values.startsAt ? t("distributors.endBeforeStart") : undefined,
      })
    )
      return;
    const percentage = Number(form.discountPercentage) || 0;
    const window = { startsAt: form.startsAt || null, endsAt: form.endsAt || null };
    try {
      if (editingCode) {
        await updateCode.mutateAsync({
          id: editingCode.id,
          payload: { code: form.code, discountPercentage: percentage, isActive: form.isActive, ...window },
        });
      } else {
        await createCode.mutateAsync({
          distributorId: distributor.id,
          code: form.code,
          discountPercentage: percentage,
          isActive: form.isActive,
          ...window,
        });
      }
      resetForm();
    } catch {
      // Error toast is shown globally; keep the form open so the user can retry.
    }
  };

  const activeCount = codes?.filter((c) => promoCodePhase(c) === "live").length ?? 0;

  return (
    <AdminDialog
      open={Boolean(distributor)}
      onClose={close}
      media={distributor ? <InitialsAvatar name={distributor.name} size={40} muted={!distributor.isActive} /> : undefined}
      title={t("distributors.codesFor", { name: distributor?.name ?? "" })}
      subtitle={codes ? t("distributors.codesSubtitle", { count: codes.length, active: activeCount }) : " "}
      actions={
        <Button color="inherit" onClick={close} sx={{ color: "text.secondary" }}>
          {t("common:actions.close")}
        </Button>
      }
    >
      <Stack spacing={1} sx={{ pt: 0.5, mb: 2.5 }}>
        {isLoading || !codes ? (
          [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1.5 }} />)
        ) : codes.length === 0 ? (
          <Stack
            sx={{
              alignItems: "center",
              py: 3.5,
              borderRadius: 1.5,
              border: `1px dashed ${palette.line}`,
              color: "text.secondary",
            }}
          >
            <LoyaltyOutlinedIcon sx={{ fontSize: 28, color: alpha(palette.gold, 0.7), mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>{t("distributors.noCodes")}</Typography>
            <Typography sx={{ fontSize: 12.5 }}>{t("distributors.noCodesHint")}</Typography>
          </Stack>
        ) : (
          codes.map((code, i) => {
            const isEditing = editingCode?.id === code.id;
            const phase = promoCodePhase(code);
            const usable = phase === "live" || phase === "scheduled";
            return (
              <Stack
                key={code.id}
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  pl: 1.75,
                  pr: 1,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: isEditing ? alpha(palette.gold, 0.08) : "background.paper",
                  boxShadow: `inset 0 0 0 1px ${isEditing ? alpha(palette.gold, 0.5) : palette.line}`,
                  opacity: usable ? 1 : 0.7,
                  transition: "background-color 160ms ease, box-shadow 160ms ease, opacity 200ms ease",
                  animation: `codeIn 220ms ${EASE_OUT} both`,
                  animationDelay: `${Math.min(i, 8) * 25}ms`,
                  "@keyframes codeIn": { from: { opacity: 0, transform: "translateY(4px)" } },
                  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textDecoration: usable ? "none" : "line-through",
                        textDecorationColor: alpha(palette.textSecondary, 0.5),
                      }}
                    >
                      {code.code}
                    </Typography>
                    <CopyButton text={code.code} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.25 }}>
                    <PromoPhasePill phase={phase} />
                    <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                      {code.startsAt || code.endsAt
                        ? `${code.startsAt ? formatShortDate(code.startsAt, i18n.language) : t("distributors.window.now")} → ${code.endsAt ? formatShortDate(code.endsAt, i18n.language) : t("distributors.window.noEndShort")}`
                        : t("distributors.window.always")}
                    </Typography>
                  </Stack>
                </Box>
                <Pill tone="gold">−{code.discountPercentage}%</Pill>
                <Tooltip title={code.isActive ? t("distributors.active") : t("distributors.inactive")}>
                  <Switch
                    size="small"
                    color="success"
                    checked={code.isActive}
                    disabled={togglingId === code.id}
                    onChange={() => toggleActive(code)}
                  />
                </Tooltip>
                <IconButton size="small" onClick={() => startEdit(code)} sx={{ transition: `transform 140ms ${EASE_OUT}`, "&:active": { transform: "scale(0.9)" } }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPendingDelete(code)}
                  sx={{
                    transition: `transform 140ms ${EASE_OUT}, color 120ms ease, background-color 120ms ease`,
                    "&:active": { transform: "scale(0.9)" },
                    "&:hover": { color: palette.error, bgcolor: alpha(palette.error, 0.08) },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            );
          })
        )}
      </Stack>

      {/* Add / edit panel */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: editingCode ? alpha(palette.gold, 0.06) : alpha(palette.ivory, 0.8),
          boxShadow: `inset 0 0 0 1px ${editingCode ? alpha(palette.gold, 0.35) : palette.line}`,
          transition: "background-color 200ms ease, box-shadow 200ms ease",
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.secondary", mb: 1.5 }}>
          {editingCode ? t("distributors.editCode") : t("distributors.addCode")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "flex-start" } }}>
          <TextField
            size="small"
            label={t("distributors.code")}
            placeholder="SUMMER20"
            value={form.code}
            onChange={(e) => {
              setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") });
              clearError("code");
            }}
            error={Boolean(errors.code)}
            helperText={errors.code}
            sx={{ flex: 1.4, "& input": { fontFamily: MONO, fontWeight: 700, letterSpacing: "0.06em" } }}
          />
          <TextField
            size="small"
            label={t("distributors.discount")}
            type="number"
            value={form.discountPercentage}
            onChange={(e) => {
              setForm({ ...form, discountPercentage: e.target.value });
              clearError("discountPercentage");
            }}
            error={Boolean(errors.discountPercentage)}
            helperText={errors.discountPercentage}
            sx={{ flex: 1 }}
            slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", height: 40 }}>
            <Switch size="small" color="success" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <Typography sx={{ fontSize: 13, color: "text.secondary", whiteSpace: "nowrap" }}>{t("distributors.active")}</Typography>
          </Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5, alignItems: { sm: "flex-start" } }}>
          <TextField
            size="small"
            type="date"
            label={t("distributors.startsAt")}
            value={form.startsAt}
            onChange={(e) => {
              setForm({ ...form, startsAt: e.target.value });
              clearError("endsAt");
            }}
            helperText={t("distributors.startsHint")}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label={t("distributors.endsAt")}
            value={form.endsAt}
            onChange={(e) => {
              setForm({ ...form, endsAt: e.target.value });
              clearError("endsAt");
            }}
            error={Boolean(errors.endsAt)}
            helperText={errors.endsAt ?? t("distributors.endsHint")}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.startsAt || undefined } }}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.75, justifyContent: "flex-end" }}>
          {editingCode && (
            <Button color="inherit" size="small" onClick={resetForm} sx={{ color: "text.secondary" }}>
              {t("common:actions.cancel")}
            </Button>
          )}
          <SubmitButton
            variant="contained"
            size="small"
            startIcon={editingCode ? undefined : <AddIcon />}
            onClick={handleSave}
            loading={isSavingCode && !togglingId}
            sx={{ transition: `transform 140ms ${EASE_OUT}`, "&:active": { transform: "scale(0.97)" } }}
          >
            {editingCode ? t("common:actions.save") : t("distributors.addCode")}
          </SubmitButton>
        </Stack>
      </Box>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteCode.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteCode.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </AdminDialog>
  );
}
