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
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { PageMeta } from "../../components/common/PageMeta";
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
  const { t } = useTranslation(["admin", "common"]);
  const [tab, setTab] = useState<"single" | "bundle">("single");

  const { data: paintingsResult } = usePaintings({ page: 1, pageSize: 100, isPublished: true });
  const { data: framesResult } = useFrames({ page: 1, pageSize: 100 });

  const { data: promotionsResult, isLoading: loadingPromotions, isError: promotionsError, refetch: refetchPromotions } = usePromotions({ page: 1, pageSize: 50 });
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const { data: bundlesResult, isLoading: loadingBundles, isError: bundlesError, refetch: refetchBundles } = useCombinationPromotions({ page: 1, pageSize: 50 });
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

  const promotionColumns: AdminColumn<Promotion>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "type", label: "Type", render: (row) => <Chip size="small" label={row.promotionType} /> },
    { key: "discount", label: "Discount", render: (row) => (row.discountType === "Percentage" ? `${row.discountValue}%` : formatPrice(row.discountValue)) },
    { key: "active", label: t("table.status"), render: (row) => <Chip size="small" color={row.isCurrentlyActive ? "success" : "default"} label={row.isCurrentlyActive ? "Active" : "Inactive"} /> },
  ];

  const bundleColumns: AdminColumn<CombinationPromotion>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "painting", label: "Painting", render: (row) => row.paintingName },
    { key: "frame", label: "Frame", render: (row) => row.frameName },
    { key: "discount", label: "Discount", render: (row) => (row.discountType === "Percentage" ? `${row.discountValue}%` : formatPrice(row.discountValue)) },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.promotions")} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab value="single" label="Поединечни попусти" />
        <Tab value="bundle" label="Слика + Рамка попусти" />
      </Tabs>

      {tab === "single" ? (
        <AdminDataTable
          title="Поединечни попусти"
          columns={promotionColumns}
          rows={promotionsResult?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={loadingPromotions}
          isError={promotionsError}
          onRetry={() => refetchPromotions()}
          onAddNew={openCreate}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      ) : (
        <AdminDataTable
          title="Слика + Рамка попусти"
          columns={bundleColumns}
          rows={bundlesResult?.items ?? []}
          rowKey={(row) => row.id}
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
                    <OptionLabel thumbnailPath={p.thumbnailPath} name={p.name} />
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
                  <OptionLabel thumbnailPath={p.thumbnailPath} name={p.name} />
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
