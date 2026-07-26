import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useCreateFrame, useDeleteFrame, useManageFrames, useUpdateFrame, useUploadFrameImage } from "../../hooks/useFrames";
import { useFieldErrors, v } from "../../utils/validation";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { FrameListItem } from "../../types";

type ImageFilter = "all" | "withImage" | "withoutImage";

interface FrameFormState {
  name: string;
  material: string;
  color: string;
  description: string;
  basePrice: string;
  isActive: boolean;
}

const EMPTY_FORM: FrameFormState = {
  name: "",
  material: "",
  color: "",
  description: "",
  basePrice: "",
  isActive: true,
};

export default function AdminFramesPage() {
  const { t } = useTranslation(["admin", "common"]);
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const hasImage = imageFilter === "all" ? undefined : imageFilter === "withImage";
  const { data: result, isLoading, isError, refetch } = useManageFrames({ page: 1, pageSize: 50, hasImage });
  const frames = result?.items ?? [];
  const createFrame = useCreateFrame();
  const updateFrame = useUpdateFrame();
  const deleteFrame = useDeleteFrame();
  const uploadImage = useUploadFrameImage();
  const { errors, validate, clearError, reset } = useFieldErrors<FrameFormState>();

  const isSaving = createFrame.isPending || updateFrame.isPending || uploadImage.isPending;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FrameListItem | null>(null);
  const [form, setForm] = useState<FrameFormState>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = useState<FrameListItem | null>(null);

  const filtered = frames.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    reset();
    setDialogOpen(true);
  };

  const openEdit = (frame: FrameListItem) => {
    setEditing(frame);
    setForm({
      name: frame.name,
      material: frame.material,
      color: frame.color,
      description: "",
      basePrice: String(frame.basePrice),
      isActive: frame.isActive,
    });
    setImageFiles([]);
    reset();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !validate(form, {
        name: v.required,
        material: v.required,
        color: v.required,
        basePrice: v.positiveNumber,
      })
    )
      return;

    const payload = {
      name: form.name,
      material: form.material,
      color: form.color,
      description: form.description || undefined,
      basePrice: Number(form.basePrice) || 0,
      isActive: form.isActive,
    };

    try {
      const saved = editing
        ? await updateFrame.mutateAsync({ id: editing.id, payload })
        : await createFrame.mutateAsync(payload);

      if (imageFiles[0]) {
        await uploadImage.mutateAsync({ id: saved.id, file: imageFiles[0] });
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const columns: AdminColumn<FrameListItem>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "material", label: "Material", render: (row) => row.material },
    { key: "color", label: "Color", render: (row) => row.color },
    {
      key: "image",
      label: t("frames.image"),
      render: (row) =>
        row.thumbnailPath ? (
          <Chip size="small" color="success" label={t("frames.hasImage")} />
        ) : (
          <Chip size="small" color="warning" label={t("frames.missingImage")} />
        ),
    },
    { key: "price", label: t("table.price"), render: (row) => formatPrice(row.finalPrice), align: "right" },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.frames")} />
      <Tabs
        value={imageFilter}
        onChange={(_, v) => setImageFilter(v)}
        sx={{ mb: 2, minHeight: 36 }}
      >
        <Tab value="all" label={t("frames.filterAll")} sx={{ minHeight: 36 }} />
        <Tab value="withImage" label={t("frames.filterWithImage")} sx={{ minHeight: 36 }} />
        <Tab value="withoutImage" label={t("frames.filterWithoutImage")} sx={{ minHeight: 36 }} />
      </Tabs>
      <AdminDataTable
        title={t("nav.frames")}
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        onAddNew={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

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
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Material"
                  value={form.material}
                  onChange={(e) => {
                    setForm({ ...form, material: e.target.value });
                    clearError("material");
                  }}
                  error={Boolean(errors.material)}
                  helperText={errors.material}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Color"
                  value={form.color}
                  onChange={(e) => {
                    setForm({ ...form, color: e.target.value });
                    clearError("color");
                  }}
                  error={Boolean(errors.color)}
                  helperText={errors.color}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Base Price"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => {
                    setForm({ ...form, basePrice: e.target.value });
                    clearError("basePrice");
                  }}
                  error={Boolean(errors.basePrice)}
                  helperText={errors.basePrice}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
            <FormControlLabel control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />

            <Box>
              {editing?.thumbnailPath && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  {t("form.currentImage")}
                </Typography>
              )}
              <ImageDropzone
                files={imageFiles}
                onChange={setImageFiles}
                existingPreviewUrls={editing?.thumbnailPath ? [resolveMediaUrl(editing.thumbnailPath) ?? ""] : []}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSave} loading={isSaving}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteFrame.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteFrame.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
