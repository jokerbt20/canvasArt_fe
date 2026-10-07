import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PageMeta } from "../../components/common/PageMeta";
import { EASE_OUT, Pill } from "../../components/admin/TableBadges";
import { filterFieldSx, promoPhase, type PromoPhase } from "../../components/admin/adminFormat";
import { DiscountPill, PromoPeriodCell, PromoPhasePill, TargetCell, Thumb } from "../../components/admin/PromotionCells";
import { palette } from "../../theme/palette";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useFieldErrors, v } from "../../utils/validation";
import { usePaintings, useManagePainting } from "../../hooks/usePaintings";
import { useFrames } from "../../hooks/useFrames";
import {
  useCombinationPromotions,
  useCreateCombinationPromotion,
  useCreatePromotion,
  useDeleteCombinationPromotion,
  useDeletePromotion,
  usePromotions,
  useUpdateCombinationPromotion,
  useUpdatePromotion,
} from "../../hooks/usePromotions";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type {
  CombinationPromotion,
  DiscountType,
  Promotion,
  PromotionType,
} from "../../types";

/** A dropdown option that shows a thumbnail beside the name, so images are easy to pick. */
function OptionLabel({ thumbnailPath, name }: { thumbnailPath: string | null; name: string }) {
  const url = resolveMediaUrl(thumbnailPath);
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
      <Box sx={{ width: 28, height: 28, flexShrink: 0, bgcolor: "#EFE9DF", borderRadius: 0.5, overflow: "hidden" }}>
        {url && (
          <Box component="img" src={url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </Box>
      <Typography variant="body2" noWrap>
        {name}
      </Typography>
    </Stack>
  );
}

type SortOption = "endingSoon" | "newest" | "startDate" | "discount" | "name";
const SORT_LABELS: Record<SortOption, true> = { endingSoon: true, newest: true, startDate: true, discount: true, name: true };

const PHASES: PromoPhase[] = ["live", "scheduled", "expired", "paused"];
/** "Ending soon" groups live first, then upcoming, then the rest. */
const PHASE_ORDER: Record<PromoPhase, number> = { live: 0, scheduled: 1, paused: 2, expired: 3 };

interface ListFilters {
  phase: "" | PromoPhase;
  type: "" | PromotionType;
  sort: SortOption;
}

const DEFAULT_FILTERS: ListFilters = { phase: "", type: "", sort: "endingSoon" };

interface PromotionFormState {
  name: string;
  description: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: string;
  targetPaintingId: string;
  targetFrameId: string;
  startDate: string;
  endDate: string;
  priority: string;
  isActive: boolean;
}

const EMPTY_FORM: PromotionFormState = {
  name: "",
  description: "",
  promotionType: "Painting",
  discountType: "Percentage",
  discountValue: "",
  targetPaintingId: "",
  targetFrameId: "",
  startDate: "",
  endDate: "",
  priority: "0",
  isActive: true,
};

interface BundleFormState {
  name: string;
  description: string;
  paintingId: string;
  frameId: string;
  discountType: DiscountType;
  discountValue: string;
  startDate: string;
  endDate: string;
  priority: string;
  isActive: boolean;
}

const EMPTY_BUNDLE_FORM: BundleFormState = {
  name: "",
  description: "",
  paintingId: "",
  frameId: "",
  discountType: "Percentage",
  discountValue: "",
  startDate: "",
  endDate: "",
  priority: "0",
  isActive: true,
};

export default function AdminPromotionsPage() {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const [tab, setTab] = useState<"single" | "bundle">("single");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const filtersActive = (Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]).some((k) => filters[k] !== DEFAULT_FILTERS[k]);

  const { data: paintingsResult } = usePaintings({ page: 1, pageSize: 100, isPublished: true });
  const { data: framesResult } = useFrames({ page: 1, pageSize: 100 });

  const { data: promotionsResult, isLoading: loadingPromotions, isError: promotionsError, refetch: refetchPromotions } = usePromotions({ page: 1, pageSize: 100 });
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const { data: bundlesResult, isLoading: loadingBundles, isError: bundlesError, refetch: refetchBundles } = useCombinationPromotions({ page: 1, pageSize: 100 });
  const createBundle = useCreateCombinationPromotion();
  const updateBundle = useUpdateCombinationPromotion();
  const deleteBundle = useDeleteCombinationPromotion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Promotion | null>(null);
  const { errors, validate, clearError, reset } = useFieldErrors<PromotionFormState>();

  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<CombinationPromotion | null>(null);
  const [bundleForm, setBundleForm] = useState<BundleFormState>(EMPTY_BUNDLE_FORM);
  const [pendingDeleteBundle, setPendingDeleteBundle] = useState<CombinationPromotion | null>(null);
  const {
    errors: bundleErrors,
    validate: validateBundle,
    clearError: clearBundleError,
    reset: resetBundleErrors,
  } = useFieldErrors<BundleFormState>();

  const isSaving = createPromotion.isPending || updatePromotion.isPending;
  const isSavingBundle = createBundle.isPending || updateBundle.isPending;

  const bundlePaintingId = bundleForm.paintingId ? Number(bundleForm.paintingId) : undefined;
  const { data: bundlePaintingDetail } = useManagePainting(bundlePaintingId);
  const compatibleFrames = bundlePaintingDetail?.compatibleFrames ?? [];

  const selectedFormPainting = form.targetPaintingId
    ? paintingsResult?.items.find((p) => p.id === Number(form.targetPaintingId))
    : undefined;
  const selectedFormFrame = form.targetFrameId
    ? framesResult?.items.find((f) => f.id === Number(form.targetFrameId))
    : undefined;

  const selectedBundleFrame = bundleForm.frameId
    ? framesResult?.items.find((f) => f.id === Number(bundleForm.frameId))
    : undefined;
  const bundlePaintingBasePrice = bundlePaintingDetail?.sizes.length
    ? Math.min(...bundlePaintingDetail.sizes.map((s) => s.price))
    : 0;
  const bundleFrameBasePrice = selectedBundleFrame?.basePrice ?? 0;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    reset();
    setDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditing(promotion);
    reset();
    setForm({
      name: promotion.name,
      description: promotion.description ?? "",
      promotionType: promotion.promotionType,
      discountType: promotion.discountType,
      discountValue: String(promotion.discountValue),
      targetPaintingId: promotion.targetPaintingId ? String(promotion.targetPaintingId) : "",
      targetFrameId: promotion.targetFrameId ? String(promotion.targetFrameId) : "",
      startDate: promotion.startDate.slice(0, 10),
      endDate: promotion.endDate.slice(0, 10),
      priority: String(promotion.priority),
      isActive: promotion.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const valid = validate(form, {
      name: v.required,
      discountValue: v.positiveNumber,
      startDate: v.required,
      endDate: (value: string, values: PromotionFormState) =>
        !value
          ? "This field is required."
          : values.startDate && value < values.startDate
            ? "End date must be after the start date."
            : undefined,
      targetPaintingId: (value: string, values: PromotionFormState) =>
        values.promotionType === "Painting" && !value ? "Select a painting." : undefined,
      targetFrameId: (value: string, values: PromotionFormState) =>
        values.promotionType === "Frame" && !value ? "Select a frame." : undefined,
    });
    if (!valid) return;

    const payload = {
      name: form.name,
      description: form.description || undefined,
      promotionType: form.promotionType,
      discountType: form.discountType,
      discountValue: Number(form.discountValue) || 0,
      targetPaintingId: form.promotionType === "Painting" && form.targetPaintingId ? Number(form.targetPaintingId) : undefined,
      targetFrameId: form.promotionType === "Frame" && form.targetFrameId ? Number(form.targetFrameId) : undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
      priority: Number(form.priority) || 0,
    };
    try {
      if (editing) {
        await updatePromotion.mutateAsync({ id: editing.id, payload });
      } else {
        await createPromotion.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const openCreateBundle = () => {
    setEditingBundle(null);
    setBundleForm(EMPTY_BUNDLE_FORM);
    resetBundleErrors();
    setBundleDialogOpen(true);
  };

  const openEditBundle = (bundle: CombinationPromotion) => {
    setEditingBundle(bundle);
    resetBundleErrors();
    setBundleForm({
      name: bundle.name,
      description: bundle.description ?? "",
      paintingId: String(bundle.paintingId),
      frameId: String(bundle.frameId),
      discountType: bundle.discountType,
      discountValue: String(bundle.discountValue),
      startDate: bundle.startDate.slice(0, 10),
      endDate: bundle.endDate.slice(0, 10),
      priority: String(bundle.priority),
      isActive: bundle.isActive,
    });
    setBundleDialogOpen(true);
  };

  const handleSaveBundle = async () => {
    const valid = validateBundle(bundleForm, {
      name: v.required,
      paintingId: v.required,
      frameId: v.required,
      discountValue: v.positiveNumber,
      startDate: v.required,
      endDate: (value: string, values: BundleFormState) =>
        !value
          ? "This field is required."
          : values.startDate && value < values.startDate
            ? "End date must be after the start date."
            : undefined,
    });
    if (!valid) return;

    const payload = {
      name: bundleForm.name,
      description: bundleForm.description || undefined,
      paintingId: Number(bundleForm.paintingId),
      frameId: Number(bundleForm.frameId),
      discountType: bundleForm.discountType,
      discountValue: Number(bundleForm.discountValue) || 0,
      startDate: bundleForm.startDate,
      endDate: bundleForm.endDate,
      isActive: bundleForm.isActive,
      priority: Number(bundleForm.priority) || 0,
    };
    try {
      if (editingBundle) {
        await updateBundle.mutateAsync({ id: editingBundle.id, payload });
      } else {
        await createBundle.mutateAsync(payload);
      }
      setBundleDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const locale = i18n.language;
  const paintingById = new Map((paintingsResult?.items ?? []).map((p) => [p.id, p]));
  const frameById = new Map((framesResult?.items ?? []).map((f) => [f.id, f]));

  // Everything is loaded in one page (≤100), so search/filter/sort run client-side and feel instant.
  const matches = (row: Promotion | CombinationPromotion, extraText: (string | null | undefined)[]) => {
    const phase = promoPhase(row);
    if (filters.phase && phase !== filters.phase) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [row.name, row.description, ...extraText].some((s) => s?.toLowerCase().includes(q));
  };

  const sortRows = <R extends Promotion | CombinationPromotion>(rows: R[]) => {
    const by: Record<SortOption, (a: R, b: R) => number> = {
      endingSoon: (a, b) => PHASE_ORDER[promoPhase(a)] - PHASE_ORDER[promoPhase(b)] || a.endDate.localeCompare(b.endDate),
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      startDate: (a, b) => b.startDate.localeCompare(a.startDate),
      discount: (a, b) =>
        Number(b.discountType === "Percentage") - Number(a.discountType === "Percentage") || b.discountValue - a.discountValue,
      name: (a, b) => a.name.localeCompare(b.name, locale),
    };
    return [...rows].sort(by[filters.sort]);
  };

  const singleRows = sortRows(
    (promotionsResult?.items ?? []).filter((row) => {
      if (filters.type && row.promotionType !== filters.type) return false;
      const target =
        row.promotionType === "Painting"
          ? paintingById.get(row.targetPaintingId ?? -1)?.name
          : frameById.get(row.targetFrameId ?? -1)?.name;
      return matches(row, [target]);
    }),
  );
  const bundleRows = sortRows((bundlesResult?.items ?? []).filter((row) => matches(row, [row.paintingName, row.frameName])));

  const liveCount = (rows: (Promotion | CombinationPromotion)[] | undefined) =>
    (rows ?? []).filter((r) => promoPhase(r) === "live").length;

  const nameCell = (row: Promotion | CombinationPromotion) => (
    <Box sx={{ minWidth: 160, maxWidth: 260 }}>
      <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
        {row.name}
      </Typography>
      {row.description && (
        <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
          {row.description}
        </Typography>
      )}
    </Box>
  );

  const sharedTail = <R extends Promotion | CombinationPromotion>(): AdminColumn<R>[] => [
    {
      key: "discount",
      label: t("promotionsTable.discount"),
      render: (row) => <DiscountPill discountType={row.discountType} discountValue={row.discountValue} />,
    },
    {
      key: "period",
      label: t("promotionsTable.period"),
      render: (row) => <PromoPeriodCell startDate={row.startDate} endDate={row.endDate} phase={promoPhase(row)} />,
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => <PromoPhasePill phase={promoPhase(row)} />,
    },
  ];

  const promotionColumns: AdminColumn<Promotion>[] = [
    { key: "name", label: t("promotionsTable.promotion"), render: nameCell },
    {
      key: "target",
      label: t("promotionsTable.appliesTo"),
      render: (row) => {
        if (row.promotionType === "Painting") {
          const p = paintingById.get(row.targetPaintingId ?? -1);
          return (
            <TargetCell
              thumb={p?.thumbnailPath}
              name={p ? (p.name ?? p.code) : `#${row.targetPaintingId ?? "—"}`}
              caption={t("promotionsTable.typePainting")}
            />
          );
        }
        const f = frameById.get(row.targetFrameId ?? -1);
        return <TargetCell thumb={f?.thumbnailPath} name={f?.name ?? `#${row.targetFrameId ?? "—"}`} caption={t("promotionsTable.typeFrame")} />;
      },
    },
    ...sharedTail<Promotion>(),
  ];

  const bundleColumns: AdminColumn<CombinationPromotion>[] = [
    { key: "name", label: t("promotionsTable.promotion"), render: nameCell },
    {
      key: "combo",
      label: t("promotionsTable.combination"),
      render: (row) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0, maxWidth: 300 }}>
          <Stack direction="row" sx={{ alignItems: "center", flexShrink: 0 }}>
            <Thumb path={paintingById.get(row.paintingId)?.thumbnailPath} />
            <Box
              sx={{
                mx: -0.5,
                zIndex: 1,
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1,
                color: palette.goldDark,
                bgcolor: "background.paper",
                boxShadow: `0 0 0 1px ${alpha(palette.gold, 0.4)}`,
              }}
            >
              +
            </Box>
            <Thumb path={frameById.get(row.frameId)?.thumbnailPath} />
          </Stack>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>
              {row.paintingName ?? `#${row.paintingId}`}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {row.frameName ?? `#${row.frameId}`}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    ...sharedTail<CombinationPromotion>(),
  ];

  const filterBar = (
    <>
      <TextField
        select
        size="small"
        label={t("table.status")}
        value={filters.phase}
        onChange={(e) => setFilters((f) => ({ ...f, phase: e.target.value as ListFilters["phase"] }))}
        sx={filterFieldSx(Boolean(filters.phase), 140)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        {PHASES.map((phase) => (
          <MenuItem key={phase} value={phase}>
            {t(`promotionsTable.phase.${phase}`)}
          </MenuItem>
        ))}
      </TextField>
      {tab === "single" && (
        <TextField
          select
          size="small"
          label={t("promotionsTable.appliesTo")}
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as ListFilters["type"] }))}
          sx={filterFieldSx(Boolean(filters.type), 140)}
        >
          <MenuItem value="">{t("filters.all")}</MenuItem>
          <MenuItem value="Painting">{t("promotionsTable.typePainting")}</MenuItem>
          <MenuItem value="Frame">{t("promotionsTable.typeFrame")}</MenuItem>
        </TextField>
      )}
      <TextField
        select
        size="small"
        label={t("filters.sort")}
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))}
        sx={filterFieldSx(filters.sort !== DEFAULT_FILTERS.sort, 170)}
      >
        {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
          <MenuItem key={key} value={key}>
            {t(`promotionsTable.sorts.${key}`)}
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

  const tabLabel = (label: string, total: number | undefined, live: number) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <span>{label}</span>
      {total !== undefined && (
        <Box
          component="span"
          sx={{
            minWidth: 20,
            height: 20,
            px: 0.75,
            borderRadius: 999,
            display: "inline-grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: live ? palette.success : palette.textSecondary,
            bgcolor: alpha(live ? palette.success : palette.textSecondary, 0.1),
          }}
        >
          {live ? t("promotionsTable.liveOf", { live, total }) : total}
        </Box>
      )}
    </Stack>
  );

  const shownCount = tab === "single" ? singleRows.length : bundleRows.length;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <PageMeta title={t("nav.promotions")} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          minHeight: 40,
          "& .MuiTab-root": {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            transition: "color 150ms ease",
          },
          "& .MuiTabs-indicator": { height: 2, borderRadius: 2, transition: `left 240ms ${EASE_OUT}, width 240ms ${EASE_OUT}` },
        }}
      >
        <Tab value="single" label={tabLabel(t("promotionsTable.tabSingle"), promotionsResult?.items.length, liveCount(promotionsResult?.items))} />
        <Tab value="bundle" label={tabLabel(t("promotionsTable.tabBundle"), bundlesResult?.items.length, liveCount(bundlesResult?.items))} />
      </Tabs>

      {tab === "single" ? (
        <AdminDataTable
          key="single"
          fillHeight
          title={t("promotionsTable.tabSingle")}
          titleExtra={promotionsResult && <Pill tone={shownCount ? "gold" : "neutral"}>{t("promotionsTable.count", { count: shownCount })}</Pill>}
          filters={filterBar}
          search={search}
          onSearchChange={setSearch}
          columns={promotionColumns}
          rows={singleRows}
          rowKey={(row) => row.id}
          onRowClick={openEdit}
          isLoading={loadingPromotions}
          isError={promotionsError}
          onRetry={() => refetchPromotions()}
          onAddNew={openCreate}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      ) : (
        <AdminDataTable
          key="bundle"
          fillHeight
          title={t("promotionsTable.tabBundle")}
          titleExtra={bundlesResult && <Pill tone={shownCount ? "gold" : "neutral"}>{t("promotionsTable.count", { count: shownCount })}</Pill>}
          filters={filterBar}
          search={search}
          onSearchChange={setSearch}
          columns={bundleColumns}
          rows={bundleRows}
          rowKey={(row) => row.id}
          onRowClick={openEditBundle}
          isLoading={loadingBundles}
          isError={bundlesError}
          onRetry={() => refetchBundles()}
          onAddNew={openCreateBundle}
          onEdit={openEditBundle}
          onDelete={setPendingDeleteBundle}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={t("table.name")}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError("name");
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
            />
            <TextField select label="Applies To" value={form.promotionType} onChange={(e) => setForm({ ...form, promotionType: e.target.value as PromotionType })} fullWidth>
              <MenuItem value="Painting">Painting</MenuItem>
              <MenuItem value="Frame">Frame</MenuItem>
            </TextField>

            {form.promotionType === "Painting" ? (
              <TextField
                select
                label="Painting"
                value={form.targetPaintingId}
                onChange={(e) => {
                  setForm({ ...form, targetPaintingId: e.target.value });
                  clearError("targetPaintingId");
                }}
                error={Boolean(errors.targetPaintingId)}
                helperText={errors.targetPaintingId}
                fullWidth
              >
                {paintingsResult?.items.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <OptionLabel thumbnailPath={p.thumbnailPath} name={p.name ?? p.code} />
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                select
                label="Frame"
                value={form.targetFrameId}
                onChange={(e) => {
                  setForm({ ...form, targetFrameId: e.target.value });
                  clearError("targetFrameId");
                }}
                error={Boolean(errors.targetFrameId)}
                helperText={errors.targetFrameId}
                fullWidth
              >
                {framesResult?.items.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    <OptionLabel thumbnailPath={f.thumbnailPath} name={f.name} />
                  </MenuItem>
                ))}
              </TextField>
            )}

            {(selectedFormPainting || selectedFormFrame) && (
              <Typography variant="caption" color="text.secondary">
                Original price:{" "}
                {formatPrice(selectedFormPainting?.fromPrice ?? selectedFormFrame?.basePrice ?? 0)}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField select label="Discount Type" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })} fullWidth>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="FixedAmount">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Discount Value"
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => {
                    setForm({ ...form, discountValue: e.target.value });
                    clearError("discountValue");
                  }}
                  error={Boolean(errors.discountValue)}
                  helperText={errors.discountValue}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Starts At"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => {
                    setForm({ ...form, startDate: e.target.value });
                    clearError("startDate");
                  }}
                  error={Boolean(errors.startDate)}
                  helperText={errors.startDate}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Ends At"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => {
                    setForm({ ...form, endDate: e.target.value });
                    clearError("endDate");
                  }}
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSave} loading={isSaving}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      <Dialog open={bundleDialogOpen} onClose={() => setBundleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBundle ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={t("table.name")}
              value={bundleForm.name}
              onChange={(e) => {
                setBundleForm({ ...bundleForm, name: e.target.value });
                clearBundleError("name");
              }}
              error={Boolean(bundleErrors.name)}
              helperText={bundleErrors.name}
              fullWidth
            />
            <TextField
              select
              label="Painting"
              value={bundleForm.paintingId}
              onChange={(e) => {
                setBundleForm({ ...bundleForm, paintingId: e.target.value, frameId: "" });
                clearBundleError("paintingId");
              }}
              error={Boolean(bundleErrors.paintingId)}
              helperText={bundleErrors.paintingId}
              fullWidth
            >
              {paintingsResult?.items.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <OptionLabel thumbnailPath={p.thumbnailPath} name={p.name ?? p.code} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Frame"
              value={bundleForm.frameId}
              onChange={(e) => {
                setBundleForm({ ...bundleForm, frameId: e.target.value });
                clearBundleError("frameId");
              }}
              disabled={!bundlePaintingId}
              error={Boolean(bundleErrors.frameId)}
              helperText={
                bundleErrors.frameId ??
                (bundlePaintingId && compatibleFrames.length === 0
                  ? "This painting has no compatible frames."
                  : "Only frames compatible with the selected painting are shown.")
              }
              fullWidth
            >
              {compatibleFrames.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  <OptionLabel thumbnailPath={f.thumbnailPath} name={f.name} />
                </MenuItem>
              ))}
            </TextField>

            {bundlePaintingId && (
              <Typography variant="caption" color="text.secondary">
                Original price: painting {formatPrice(bundlePaintingBasePrice)}
                {selectedBundleFrame && <> + frame {formatPrice(bundleFrameBasePrice)}</>} = {formatPrice(bundlePaintingBasePrice + bundleFrameBasePrice)}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField select label="Discount Type" value={bundleForm.discountType} onChange={(e) => setBundleForm({ ...bundleForm, discountType: e.target.value as DiscountType })} fullWidth>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="FixedAmount">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Discount Value"
                  type="number"
                  value={bundleForm.discountValue}
                  onChange={(e) => {
                    setBundleForm({ ...bundleForm, discountValue: e.target.value });
                    clearBundleError("discountValue");
                  }}
                  error={Boolean(bundleErrors.discountValue)}
                  helperText={bundleErrors.discountValue}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Starts At"
                  type="date"
                  value={bundleForm.startDate}
                  onChange={(e) => {
                    setBundleForm({ ...bundleForm, startDate: e.target.value });
                    clearBundleError("startDate");
                  }}
                  error={Boolean(bundleErrors.startDate)}
                  helperText={bundleErrors.startDate}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Ends At"
                  type="date"
                  value={bundleForm.endDate}
                  onChange={(e) => {
                    setBundleForm({ ...bundleForm, endDate: e.target.value });
                    clearBundleError("endDate");
                  }}
                  error={Boolean(bundleErrors.endDate)}
                  helperText={bundleErrors.endDate}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBundleDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSaveBundle} loading={isSavingBundle}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deletePromotion.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deletePromotion.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteBundle)}
        onClose={() => setPendingDeleteBundle(null)}
        loading={deleteBundle.isPending}
        onConfirm={async () => {
          if (pendingDeleteBundle) await deleteBundle.mutateAsync(pendingDeleteBundle.id);
          setPendingDeleteBundle(null);
        }}
      />
    </Box>
  );
}
