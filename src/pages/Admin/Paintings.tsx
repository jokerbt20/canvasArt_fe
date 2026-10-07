import { useState, type ReactNode } from "react";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import FilterFramesOutlinedIcon from "@mui/icons-material/FilterFramesOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { PriceTag } from "../../components/common/PriceTag";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { EASE_OUT, Metric, Pill } from "../../components/admin/TableBadges";
import { filterFieldSx, formatDate, formatRelative } from "../../components/admin/adminFormat";
import { palette } from "../../theme/palette";
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
import { formatPrice } from "../../utils/format";
import { paintingService } from "../../services/paintingService";
import type { PaintingListItem, PaintingQuery, PaintingSizeInput } from "../../types";

type StatusFilter = "" | "published" | "draft" | "featured";
type FramesFilter = "" | "with" | "without";
type SortOption = "newest" | "oldest" | "updated" | "name" | "code" | "views";

interface ListFilters {
  categoryId: string;
  tagId: string;
  status: StatusFilter;
  frames: FramesFilter;
  sort: SortOption;
}

const DEFAULT_FILTERS: ListFilters = { categoryId: "", tagId: "", status: "", frames: "", sort: "newest" };

const SORTS: Record<SortOption, Pick<PaintingQuery, "sortBy" | "sortDir">> = {
  newest: { sortBy: "created", sortDir: "desc" },
  oldest: { sortBy: "created", sortDir: "asc" },
  updated: { sortBy: "updated", sortDir: "desc" },
  name: { sortBy: "name", sortDir: "asc" },
  code: { sortBy: "code", sortDir: "asc" },
  views: { sortBy: "views", sortDir: "desc" },
};

function toQuery(f: ListFilters): Partial<PaintingQuery> {
  return {
    categoryId: f.categoryId ? Number(f.categoryId) : undefined,
    tagId: f.tagId ? Number(f.tagId) : undefined,
    isPublished: f.status === "published" ? true : f.status === "draft" ? false : undefined,
    isFeatured: f.status === "featured" ? true : undefined,
    hasFrames: f.frames === "with" ? true : f.frames === "without" ? false : undefined,
    ...SORTS[f.sort],
  };
}

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
  const { t, i18n } = useTranslation(["admin", "common"]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const { data, isLoading, isError, refetch } = useManagePaintings({
    page,
    pageSize: 25,
    search: search || undefined,
    ...toQuery(filters),
  });
  const filtersActive = (Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]).some((k) => filters[k] !== DEFAULT_FILTERS[k]);
  const setFilter = <K extends keyof ListFilters>(key: K, value: ListFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
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
        name: detail.name ?? "",
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
    if (!validate(form, { categoryId: v.required })) return;

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
      name: form.name.trim() || null,
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
      label: "",
      render: (row) => {
        const url = resolveMediaUrl(row.thumbnailPath);
        return (
          <Box
            sx={{
              width: 40,
              height: 52,
              borderRadius: 1,
              overflow: "hidden",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: palette.ivoryDeep,
              boxShadow: `inset 0 0 0 1px ${alpha(palette.charcoal, 0.08)}`,
              color: alpha(palette.textSecondary, 0.5),
            }}
          >
            {url ? (
              <Box component="img" src={url} alt="" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <ImageNotSupportedOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </Box>
        );
      },
    },
    {
      key: "painting",
      label: t("table.painting"),
      render: (row) => (
        <Box sx={{ minWidth: 180, maxWidth: 280 }}>
          <Typography
            noWrap
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.3,
              color: row.name ? "text.primary" : alpha(palette.textSecondary, 0.6),
              fontStyle: row.name ? "normal" : "italic",
            }}
          >
            {row.name ?? t("table.untitled")}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.5, minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: 11,
                letterSpacing: "0.02em",
                color: palette.textSecondary,
                bgcolor: alpha(palette.charcoal, 0.04),
                px: 0.75,
                py: 0.25,
                borderRadius: 0.75,
                whiteSpace: "nowrap",
              }}
            >
              {row.code}
            </Box>
            {row.categoryName && (
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                {row.categoryName}
              </Typography>
            )}
          </Stack>
        </Box>
      ),
    },
    { key: "tags", label: t("table.tags"), render: (row) => <PaintingTagsCell id={row.id} /> },
    {
      key: "sizes",
      label: t("table.sizes"),
      render: (row) => <PaintingSizesCell id={row.id} />,
    },
    {
      key: "frames",
      label: t("table.frames"),
      render: (row) => <PaintingFramesCell id={row.id} />,
    },
    {
      key: "images",
      label: t("table.images"),
      align: "center",
      render: (row) => <PaintingImagesCell id={row.id} fallback={row.imageCount} />,
    },
    {
      key: "views",
      label: t("table.views"),
      align: "right",
      render: (row) => (
        <Typography sx={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: row.viewCount ? "text.primary" : "text.disabled" }}>
          {row.viewCount?.toLocaleString(i18n.language) ?? "—"}
        </Typography>
      ),
    },
    {
      key: "price",
      label: t("table.price"),
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", fontVariantNumeric: "tabular-nums" }}>
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
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          {row.isPublished ? (
            <Pill tone="success" dot>{t("filters.published")}</Pill>
          ) : (
            <Pill tone="neutral" dot>{t("filters.draft")}</Pill>
          )}
          {row.isFeatured && (
            <Pill tone="gold" icon={<StarRoundedIcon />} tooltip={t("filters.featured")}>
              {t("filters.featured")}
            </Pill>
          )}
        </Stack>
      ),
    },
    {
      key: "dates",
      label: `${t("table.createdAt")} / ${t("table.updatedAt")}`,
      render: (row) => <PaintingDatesCell id={row.id} createdAt={row.createdAt} updatedAt={row.updatedAt} />,
    },
  ];

  // Rendered inline on the table toolbar, next to search.
  const filterBar = (
    <>
      <TextField
        select
        size="small"
        label={t("table.category")}
        value={filters.categoryId}
        onChange={(e) => setFilter("categoryId", e.target.value)}
        sx={filterFieldSx(Boolean(filters.categoryId), 150)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        {categories?.map((c) => (
          <MenuItem key={c.id} value={String(c.id)}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t("table.tags")}
        value={filters.tagId}
        onChange={(e) => setFilter("tagId", e.target.value)}
        sx={filterFieldSx(Boolean(filters.tagId), 120)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        {tags?.map((tag) => (
          <MenuItem key={tag.id} value={String(tag.id)}>
            {tag.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t("table.status")}
        value={filters.status}
        onChange={(e) => setFilter("status", e.target.value as StatusFilter)}
        sx={filterFieldSx(Boolean(filters.status), 130)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        <MenuItem value="published">{t("filters.published")}</MenuItem>
        <MenuItem value="draft">{t("filters.draft")}</MenuItem>
        <MenuItem value="featured">{t("filters.featured")}</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label={t("table.frames")}
        value={filters.frames}
        onChange={(e) => setFilter("frames", e.target.value as FramesFilter)}
        sx={filterFieldSx(Boolean(filters.frames), 130)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        <MenuItem value="with">{t("filters.withFrames")}</MenuItem>
        <MenuItem value="without">{t("filters.withoutFrames")}</MenuItem>
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
            {t(`filters.sorts.${key}`)}
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
            // Appears only when a filter is set — fade/scale in rather than pop.
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
      <PageMeta title={t("nav.paintings")} />
      <AdminDataTable
        fillHeight
        filters={filterBar}
        titleExtra={data && <Pill tone={data.totalCount ? "gold" : "neutral"}>{t("filters.count", { count: data.totalCount })}</Pill>}
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
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  helperText="Optional"
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
              helperText="Optional"
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
/** Per-row painting detail, shared (one cached request) by the tags/sizes/frames/images cells. */
function usePaintingRowDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.paintings.manageById(id),
    queryFn: () => paintingService.manageById(id),
    staleTime: 5 * 60_000,
    meta: { suppressErrorToast: true },
  });
}

/** Count badge on top, the actual items (truncated) underneath, full list on hover. */
function CountCell({
  count,
  label,
  emptyLabel,
  emptyTone,
  icon,
  summary,
  details,
}: {
  count: number;
  label: string;
  emptyLabel: string;
  emptyTone: "neutral" | "danger";
  icon: ReactNode;
  summary: string;
  details: ReactNode;
}) {
  if (count === 0) return <Pill tone={emptyTone} icon={icon}>{emptyLabel}</Pill>;
  return (
    <Tooltip title={details} placement="top-start" arrow>
      <Box sx={{ maxWidth: 170, cursor: "default" }}>
        <Pill tone="gold" icon={icon}>{label}</Pill>
        <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.5 }}>
          {summary}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function PaintingSizesCell({ id }: { id: number }) {
  const { t, i18n } = useTranslation("admin");
  const { data, isLoading } = usePaintingRowDetail(id);
  if (isLoading) return <Skeleton width={80} height={22} sx={{ borderRadius: 999 }} />;

  const sizes = (data?.sizes ?? []).filter((s) => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <CountCell
      count={sizes.length}
      label={t("table.sizesCount", { count: sizes.length })}
      emptyLabel={t("table.noSizes")}
      emptyTone="danger"
      icon={<StraightenOutlinedIcon />}
      summary={sizes.map((s) => s.label).join(" · ")}
      details={
        <Box component="table" sx={{ borderSpacing: "12px 2px", mx: -1.5, fontVariantNumeric: "tabular-nums" }}>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>
                  {s.label}
                  {s.isDefault && " ★"}
                </td>
                <td>
                  {s.widthCm}×{s.heightCm} cm
                </td>
                <td style={{ textAlign: "right" }}>{formatPrice(s.finalPrice, i18n.language)}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      }
    />
  );
}

function PaintingFramesCell({ id }: { id: number }) {
  const { t } = useTranslation("admin");
  const { data, isLoading } = usePaintingRowDetail(id);
  if (isLoading) return <Skeleton width={80} height={22} sx={{ borderRadius: 999 }} />;

  const frames = data?.compatibleFrames ?? [];
  return (
    <CountCell
      count={frames.length}
      label={t("table.framesCount", { count: frames.length })}
      emptyLabel={t("filters.withoutFrames")}
      emptyTone="neutral"
      icon={<FilterFramesOutlinedIcon />}
      summary={frames.map((f) => f.name).join(" · ")}
      details={
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {frames.map((f) => (
            <li key={f.id}>
              <strong>{f.name}</strong> — {f.material}, {f.color}
            </li>
          ))}
        </Box>
      }
    />
  );
}

/** Created date, with the last update underneath (relative; exact time on hover). */
function PaintingDatesCell({ id, createdAt, updatedAt }: { id: number; createdAt: string; updatedAt?: string }) {
  const { t, i18n } = useTranslation("admin");
  const { data } = usePaintingRowDetail(id);
  // The list only carries updatedAt on newer APIs; the row detail always has it.
  const updated = updatedAt ?? data?.updatedAt;
  return (
    <Box sx={{ whiteSpace: "nowrap" }}>
      <Typography sx={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{formatDate(createdAt, i18n.language)}</Typography>
      {updated && (
        <Tooltip title={new Date(updated).toLocaleString(i18n.language)} placement="bottom-start">
          <Typography component="span" sx={{ fontSize: 11.5, color: "text.secondary", cursor: "default" }}>
            {t("table.updatedRel", { when: formatRelative(updated, i18n.language) })}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
}

function PaintingImagesCell({ id, fallback }: { id: number; fallback?: number }) {
  const { t } = useTranslation("admin");
  const { data } = usePaintingRowDetail(id);
  const count = data ? data.images.length : fallback;
  return (
    <Metric
      icon={<PhotoLibraryOutlinedIcon />}
      value={count}
      tooltip={count === 0 ? t("table.noImages") : t("table.images")}
      warnWhenZero
    />
  );
}

function PaintingTagsCell({ id }: { id: number }) {
  const { data, isLoading } = usePaintingRowDetail(id);

  if (isLoading) return <Skeleton width={90} height={22} sx={{ borderRadius: 999 }} />;

  const tags = data?.tags ?? [];
  if (tags.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  }

  // Keep rows one line tall: show two tags, fold the rest into a "+N" pill.
  const visible = tags.slice(0, 2);
  const hidden = tags.slice(2);
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", maxWidth: 240 }}>
      {visible.map((tag) => (
        <Pill key={tag.id}>{tag.name}</Pill>
      ))}
      {hidden.length > 0 && <Pill tooltip={hidden.map((tag) => tag.name).join(", ")}>+{hidden.length}</Pill>}
    </Stack>
  );
}
