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
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import { useCategories } from "../../hooks/useCategories";
import { useFrames } from "../../hooks/useFrames";
import { useTags } from "../../hooks/useTags";
import {
  useCreatePainting,
  useDeletePainting,
  useManagePaintings,
  useUpdatePainting,
  useUploadPaintingImage,
} from "../../hooks/usePaintings";
import { formatPrice } from "../../utils/format";
import { paintingService } from "../../services/paintingService";
import type { PaintingListItem, PaintingSizeInput } from "../../types";

interface PaintingFormState {
  name: string;
  categoryId: string;
  description: string;
  tagIds: number[];
  compatibleFrameIds: number[];
  isPublished: boolean;
  isFeatured: boolean;
  sizes: PaintingSizeInput[];
}

const EMPTY_SIZE: PaintingSizeInput = { label: "", widthCm: 0, heightCm: 0, price: 0, stock: 0, isDefault: true, displayOrder: 0, isActive: true };
const EMPTY_FORM: PaintingFormState = {
  name: "",
  categoryId: "",
  description: "",
  tagIds: [],
  compatibleFrameIds: [],
  isPublished: true,
  isFeatured: false,
  sizes: [{ ...EMPTY_SIZE }],
};

export default function AdminPaintingsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useManagePaintings({ page, pageSize: 10, search: search || undefined });
  const { data: categories } = useCategories();
  const { data: framesResult } = useFrames({ page: 1, pageSize: 100 });
  const { data: tags } = useTags();
  const createPainting = useCreatePainting();
  const updatePainting = useUpdatePainting();
  const deletePainting = useDeletePainting();
  const uploadImage = useUploadPaintingImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaintingListItem | null>(null);
  const [form, setForm] = useState<PaintingFormState>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PaintingListItem | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setDialogOpen(true);
  };

  const openEdit = async (painting: PaintingListItem) => {
    setEditing(painting);
    setImageFiles([]);
    setDialogOpen(true);
    setLoadingEdit(true);
    try {
      const detail = await paintingService.manageById(painting.id);
      setForm({
        name: detail.name,
        categoryId: String(detail.categoryId),
        description: detail.description ?? "",
        tagIds: detail.tags.map((tag) => tag.id),
        compatibleFrameIds: detail.compatibleFrames.map((frame) => frame.id),
        isPublished: detail.isPublished,
        isFeatured: detail.isFeatured,
        sizes: detail.sizes.length
          ? detail.sizes.map((s) => ({
              id: s.id,
              label: s.label,
              widthCm: s.widthCm,
              heightCm: s.heightCm,
              price: s.price,
              stock: s.stock,
              sku: s.sku ?? undefined,
              isDefault: s.isDefault,
              displayOrder: s.displayOrder,
              isActive: s.isActive,
            }))
          : [{ ...EMPTY_SIZE }],
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const updateSize = (index: number, field: keyof PaintingSizeInput, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };
  const addSize = () => setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { ...EMPTY_SIZE, isDefault: false }] }));
  const removeSize = (index: number) =>
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    const payload = {
      name: form.name,
      categoryId: Number(form.categoryId),
      description: form.description || undefined,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      sizes: form.sizes.filter((s) => s.label),
      tagIds: form.tagIds,
      compatibleFrameIds: form.compatibleFrameIds,
    };

    const saved = editing
      ? await updatePainting.mutateAsync({ id: editing.id, payload })
      : await createPainting.mutateAsync(payload);

    for (const file of imageFiles) {
      await uploadImage.mutateAsync({ id: saved.id, file });
    }
    setDialogOpen(false);
  };

  const columns: AdminColumn<PaintingListItem>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "category", label: t("table.category"), render: (row) => row.categoryName },
    { key: "price", label: t("table.price"), render: (row) => formatPrice(row.fromFinalPrice), align: "right" },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {row.isFeatured && <Chip size="small" label="Featured" />}
          {!row.isPublished && <Chip size="small" label="Draft" />}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.paintings")} />
      <AdminDataTable
        title={t("nav.paintings")}
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAddNew={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t("table.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label={t("table.category")} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} fullWidth>
                  {categories?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={3} />

            <TextField
              select
              label="Tags"
              value={form.tagIds}
              onChange={(e) => setForm({ ...form, tagIds: (e.target.value as unknown as string[]).map(Number) })}
              fullWidth
              slotProps={{ select: { multiple: true, renderValue: (selected) => (selected as number[]).map((id) => tags?.find((tag) => tag.id === id)?.name).join(", ") } }}
            >
              {tags?.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Compatible Frames"
              value={form.compatibleFrameIds}
              onChange={(e) => setForm({ ...form, compatibleFrameIds: (e.target.value as unknown as string[]).map(Number) })}
              fullWidth
              slotProps={{ select: { multiple: true, renderValue: (selected) => (selected as number[]).map((id) => framesResult?.items.find((f) => f.id === id)?.name).join(", ") } }}
            >
              {framesResult?.items.map((frame) => (
                <MenuItem key={frame.id} value={frame.id}>
                  {frame.name}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2}>
              <FormControlLabel control={<Checkbox checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />} label="Published" />
              <FormControlLabel control={<Checkbox checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />} label="Featured" />
            </Stack>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Sizes
              </Typography>
              <Stack spacing={1.5}>
                {form.sizes.map((size, i) => (
                  <Grid container spacing={1.5} key={i} sx={{ alignItems: "center" }}>
                    <Grid size={2.5}>
                      <TextField size="small" label="Label" value={size.label} onChange={(e) => updateSize(i, "label", e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={2}>
                      <TextField size="small" label="Width cm" type="number" value={size.widthCm} onChange={(e) => updateSize(i, "widthCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2}>
                      <TextField size="small" label="Height cm" type="number" value={size.heightCm} onChange={(e) => updateSize(i, "heightCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2}>
                      <TextField size="small" label="Price" type="number" value={size.price} onChange={(e) => updateSize(i, "price", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={1.5}>
                      <TextField size="small" label="Stock" type="number" value={size.stock} onChange={(e) => updateSize(i, "stock", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={1.5}>
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

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {t("form.uploadImage")}
              </Typography>
              <ImageDropzone files={imageFiles} onChange={setImageFiles} multiple />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createPainting.isPending || updatePainting.isPending || loadingEdit}>
            {t("common:actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deletePainting.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deletePainting.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
