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
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { usePaintings } from "../../hooks/usePaintings";
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
import type {
  CombinationPromotion,
  DiscountType,
  Promotion,
  PromotionType,
} from "../../types";

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

  const { data: promotionsResult, isLoading: loadingPromotions } = usePromotions({ page: 1, pageSize: 50 });
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const { data: bundlesResult, isLoading: loadingBundles } = useCombinationPromotions({ page: 1, pageSize: 50 });
  const createBundle = useCreateCombinationPromotion();
  const updateBundle = useUpdateCombinationPromotion();
  const deleteBundle = useDeleteCombinationPromotion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Promotion | null>(null);

  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<CombinationPromotion | null>(null);
  const [bundleForm, setBundleForm] = useState<BundleFormState>(EMPTY_BUNDLE_FORM);
  const [pendingDeleteBundle, setPendingDeleteBundle] = useState<CombinationPromotion | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditing(promotion);
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
    if (editing) {
      await updatePromotion.mutateAsync({ id: editing.id, payload });
    } else {
      await createPromotion.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const openCreateBundle = () => {
    setEditingBundle(null);
    setBundleForm(EMPTY_BUNDLE_FORM);
    setBundleDialogOpen(true);
  };

  const openEditBundle = (bundle: CombinationPromotion) => {
    setEditingBundle(bundle);
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
    if (editingBundle) {
      await updateBundle.mutateAsync({ id: editingBundle.id, payload });
    } else {
      await createBundle.mutateAsync(payload);
    }
    setBundleDialogOpen(false);
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
          onAddNew={openCreateBundle}
          onEdit={openEditBundle}
          onDelete={setPendingDeleteBundle}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label={t("table.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField select label="Applies To" value={form.promotionType} onChange={(e) => setForm({ ...form, promotionType: e.target.value as PromotionType })} fullWidth>
              <MenuItem value="Painting">Painting</MenuItem>
              <MenuItem value="Frame">Frame</MenuItem>
            </TextField>

            {form.promotionType === "Painting" ? (
              <TextField select label="Painting" value={form.targetPaintingId} onChange={(e) => setForm({ ...form, targetPaintingId: e.target.value })} fullWidth>
                {paintingsResult?.items.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField select label="Frame" value={form.targetFrameId} onChange={(e) => setForm({ ...form, targetFrameId: e.target.value })} fullWidth>
                {framesResult?.items.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField select label="Discount Type" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })} fullWidth>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="FixedAmount">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField label="Discount Value" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Starts At" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={6}>
                <TextField label="Ends At" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createPromotion.isPending || updatePromotion.isPending}>
            {t("common:actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bundleDialogOpen} onClose={() => setBundleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBundle ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label={t("table.name")} value={bundleForm.name} onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })} fullWidth />
            <TextField select label="Painting" value={bundleForm.paintingId} onChange={(e) => setBundleForm({ ...bundleForm, paintingId: e.target.value })} fullWidth>
              {paintingsResult?.items.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Frame" value={bundleForm.frameId} onChange={(e) => setBundleForm({ ...bundleForm, frameId: e.target.value })} fullWidth>
              {framesResult?.items.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField select label="Discount Type" value={bundleForm.discountType} onChange={(e) => setBundleForm({ ...bundleForm, discountType: e.target.value as DiscountType })} fullWidth>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="FixedAmount">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField label="Discount Value" type="number" value={bundleForm.discountValue} onChange={(e) => setBundleForm({ ...bundleForm, discountValue: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Starts At" type="date" value={bundleForm.startDate} onChange={(e) => setBundleForm({ ...bundleForm, startDate: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={6}>
                <TextField label="Ends At" type="date" value={bundleForm.endDate} onChange={(e) => setBundleForm({ ...bundleForm, endDate: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBundleDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveBundle} disabled={createBundle.isPending || updateBundle.isPending}>
            {t("common:actions.save")}
          </Button>
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
