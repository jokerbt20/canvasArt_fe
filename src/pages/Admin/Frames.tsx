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
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import { useCreateFrame, useDeleteFrame, useFrames, useUpdateFrame, useUploadFrameImage } from "../../hooks/useFrames";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { FrameListItem, FrameSizeInput } from "../../types";

interface FrameFormState {
  name: string;
  material: string;
  color: string;
  description: string;
  basePrice: string;
  stock: string;
  isActive: boolean;
  sizes: FrameSizeInput[];
}

const EMPTY_SIZE: FrameSizeInput = { label: "", widthCm: 0, heightCm: 0, price: 0, stock: 0, displayOrder: 0, isActive: true };
const EMPTY_FORM: FrameFormState = {
  name: "",
  material: "",
  color: "",
  description: "",
  basePrice: "",
  stock: "0",
  isActive: true,
  sizes: [{ ...EMPTY_SIZE }],
};

export default function AdminFramesPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data: result, isLoading } = useFrames({ page: 1, pageSize: 50 });
  const frames = result?.items ?? [];
  const createFrame = useCreateFrame();
  const updateFrame = useUpdateFrame();
  const deleteFrame = useDeleteFrame();
  const uploadImage = useUploadFrameImage();

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
      stock: String(frame.stock),
      isActive: frame.isActive,
      sizes: [{ ...EMPTY_SIZE }],
    });
    setImageFiles([]);
    setDialogOpen(true);
  };

  const updateSize = (index: number, field: keyof FrameSizeInput, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };
  const addSize = () => setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { ...EMPTY_SIZE }] }));
  const removeSize = (index: number) =>
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    const payload = {
      name: form.name,
      material: form.material,
      color: form.color,
      description: form.description || undefined,
      basePrice: Number(form.basePrice) || 0,
      stock: Number(form.stock) || 0,
      isActive: form.isActive,
      sizes: form.sizes.filter((s) => s.label),
    };

    const saved = editing
      ? await updateFrame.mutateAsync({ id: editing.id, payload })
      : await createFrame.mutateAsync(payload);

    if (imageFiles[0]) {
      await uploadImage.mutateAsync({ id: saved.id, file: imageFiles[0] });
    }
    setDialogOpen(false);
  };

  const columns: AdminColumn<FrameListItem>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "material", label: "Material", render: (row) => row.material },
    { key: "color", label: "Color", render: (row) => row.color },
    { key: "price", label: t("table.price"), render: (row) => formatPrice(row.finalPrice), align: "right" },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.frames")} />
      <AdminDataTable
        title={t("nav.frames")}
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        onAddNew={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label={t("table.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Base Price" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} fullWidth />
              </Grid>
            </Grid>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
            <FormControlLabel control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Sizes
              </Typography>
              <Stack spacing={1.5}>
                {form.sizes.map((size, i) => (
                  <Grid container spacing={1.5} key={i} sx={{ alignItems: "center" }}>
                    <Grid size={3}>
                      <TextField size="small" label="Label" value={size.label} onChange={(e) => updateSize(i, "label", e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={2.5}>
                      <TextField size="small" label="Width cm" type="number" value={size.widthCm} onChange={(e) => updateSize(i, "widthCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2.5}>
                      <TextField size="small" label="Height cm" type="number" value={size.heightCm} onChange={(e) => updateSize(i, "heightCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2}>
                      <TextField size="small" label="Price" type="number" value={size.price} onChange={(e) => updateSize(i, "price", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={1.5}>
                      <TextField size="small" label="Stock" type="number" value={size.stock} onChange={(e) => updateSize(i, "stock", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={0.5}>
                      <IconButton size="small" onClick={() => removeSize(i)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<AddIcon />} onClick={addSize} size="small" sx={{ alignSelf: "flex-start" }}>
                  Add Size
                </Button>
              </Stack>
            </Box>

            <ImageDropzone
              files={imageFiles}
              onChange={setImageFiles}
              existingPreviewUrls={editing?.thumbnailPath ? [resolveMediaUrl(editing.thumbnailPath) ?? ""] : []}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createFrame.isPending || updateFrame.isPending}>
            {t("common:actions.save")}
          </Button>
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
