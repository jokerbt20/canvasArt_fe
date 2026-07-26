import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
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
import { PriceTag } from "../../components/common/PriceTag";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import { SubmitButton } from "../../components/common/SubmitButton";
import { queryKeys } from "../../api/queryKeys";
import { useFieldErrors, v } from "../../utils/validation";
import { notify } from "../../utils/notify";
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
import { resolveMediaUrl } from "../../utils/media";
import { paintingService } from "../../services/paintingService";
import type { PaintingListItem, PaintingSizeInput } from "../../types";

interface PaintingFormState {
  code: string;
  name: string;
  categoryId: string;
  description: string;
  tagIds: number[];
  compatibleFrameIds: number[];
  isPublished: boolean;
  isFeatured: boolean;
  sizes: PaintingSizeInput[];
}

const EMPTY_SIZE: PaintingSizeInput = { label: "", widthCm: 0, heightCm: 0, price: 0, isDefault: true, displayOrder: 0, isActive: true };
const EMPTY_FORM: PaintingFormState = {
  code: "",
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
  const { data, isLoading, isError, refetch } = useManagePaintings({ page, pageSize: 10, search: search || undefined });
  const { data: categories } = useCategories();
  const { data: framesResult } = useFrames({ page: 1, pageSize: 100 });
  const { data: tags } = useTags();
  const createPainting = useCreatePainting();
  const updatePainting = useUpdatePainting();
  const deletePainting = useDeletePainting();
  const uploadImage = useUploadPaintingImage();
  const { errors, validate, clearError, reset } = useFieldErrors<PaintingFormState>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaintingListItem | null>(null);
  const [form, setForm] = useState<PaintingFormState>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PaintingListItem | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const isSaving = createPainting.isPending || updatePainting.isPending || uploadImage.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setExistingImages([]);
    reset();
    setDialogOpen(true);
  };

  const openEdit = async (painting: PaintingListItem) => {
    setEditing(painting);
    setImageFiles([]);
    setExistingImages([]);
    reset();
    setDialogOpen(true);
    setLoadingEdit(true);
    try {
      const detail = await paintingService.manageById(painting.id);
      setExistingImages(
        [...detail.images]
          .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder)
          .map((img) => resolveMediaUrl(img.resizedPath) ?? resolveMediaUrl(img.thumbnailPath) ?? "")
          .filter(Boolean),
      );
      setForm({
        code: detail.code,
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
    if (!validate(form, { name: v.required, categoryId: v.required })) return;

    // Sizes are a dynamic list — validate them together and surface a clear message.
    const validSizes = form.sizes.filter((s) => s.label.trim());
    if (validSizes.length === 0) {
      notify.error("Add at least one size with a label.");
      return;
    }
    if (validSizes.some((s) => s.price <= 0 || s.widthCm <= 0 || s.heightCm <= 0)) {
      notify.error("Every size needs a width, height and price greater than 0.");
      return;
    }

    const payload = {
      code: form.code || undefined,
      name: form.name,
      categoryId: Number(form.categoryId),
      description: form.description || undefined,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      sizes: validSizes,
      tagIds: form.tagIds,
      compatibleFrameIds: form.compatibleFrameIds,
    };

    try {
      const saved = editing
        ? await updatePainting.mutateAsync({ id: editing.id, payload })
        : await createPainting.mutateAsync(payload);

      for (const file of imageFiles) {
        await uploadImage.mutateAsync({ id: saved.id, file });
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const columns: AdminColumn<PaintingListItem>[] = [
    {
      key: "image",
      label: t("table.image"),
      render: (row) => {
        const url = resolveMediaUrl(row.thumbnailPath);
        return (
          <Box sx={{ width: 44, height: 56, bgcolor: "#EFE9DF", overflow: "hidden", borderRadius: 0.5, flexShrink: 0 }}>
            {url && (
              <Box component="img" src={url} alt={row.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
          </Box>
        );
      },
    },
    { key: "name", label: t("table.name"), render: (row) => row.name },
    {
      key: "code",
      label: t("table.code"),
      render: (row) => (
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
          {row.code}
        </Typography>
      ),
    },
    { key: "category", label: t("table.category"), render: (row) => row.categoryName },
    { key: "tags", label: t("table.tags"), render: (row) => <PaintingTagsCell id={row.id} /> },
    {
      key: "price",
      label: t("table.price"),
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <PriceTag
            price={row.fromFinalPrice}
            originalPrice={row.fromPrice > row.fromFinalPrice ? row.fromPrice : undefined}
            size="small"
          />
        </Box>
      ),
    },
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
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  fullWidth
                  helperText={editing ? undefined : "Optional — auto-generated if blank"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label={t("table.category")}
                  value={form.categoryId}
                  onChange={(e) => {
                    setForm({ ...form, categoryId: e.target.value });
                    clearError("categoryId");
                  }}
                  error={Boolean(errors.categoryId)}
                  helperText={errors.categoryId}
                  fullWidth
                >
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
                    <Grid size={3}>
                      <TextField size="small" label="Label" value={size.label} onChange={(e) => updateSize(i, "label", e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={2.5}>
                      <TextField size="small" label="Width cm" type="number" value={size.widthCm} onChange={(e) => updateSize(i, "widthCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2.5}>
                      <TextField size="small" label="Height cm" type="number" value={size.heightCm} onChange={(e) => updateSize(i, "heightCm", Number(e.target.value))} fullWidth />
                    </Grid>
                    <Grid size={2.5}>
                      <TextField size="small" label="Price" type="number" value={size.price} onChange={(e) => updateSize(i, "price", Number(e.target.value))} fullWidth />
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
              {editing && existingImages.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  {t("form.currentImages")}
                </Typography>
              )}
              <ImageDropzone
                files={imageFiles}
                onChange={setImageFiles}
                existingPreviewUrls={existingImages}
                multiple
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSave} loading={isSaving} disabled={loadingEdit}>
            {t("common:actions.save")}
          </SubmitButton>
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

/**
 * Tags aren't included in the paintings list payload, so we lazily load the painting's
 * detail (cached, shared with the edit dialog) just to render its tag chips. Errors are
 * silent here — a failed tag fetch shouldn't spam the page with toasts.
 */
function PaintingTagsCell({ id }: { id: number }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paintings.manageById(id),
    queryFn: () => paintingService.manageById(id),
    staleTime: 5 * 60_000,
    meta: { suppressErrorToast: true },
  });

  if (isLoading) return <Skeleton width={90} height={24} />;

  const tags = data?.tags ?? [];
  if (tags.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", maxWidth: 220 }}>
      {tags.map((tag) => (
        <Chip key={tag.id} size="small" variant="outlined" label={tag.name} />
      ))}
    </Stack>
  );
}
