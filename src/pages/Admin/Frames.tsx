import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CropOriginalOutlinedIcon from "@mui/icons-material/CropOriginalOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { AdminDialog, DialogIconTile, SettingRow } from "../../components/admin/AdminDialog";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import { EASE_OUT, Pill } from "../../components/admin/TableBadges";
import { filterFieldSx } from "../../components/admin/adminFormat";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useCreateFrame, useDeleteFrame, useManageFrames, useUpdateFrame, useUploadFrameImage } from "../../hooks/useFrames";
import { frameService } from "../../services/frameService";
import { useFieldErrors, v } from "../../utils/validation";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import { palette } from "../../theme/palette";
import type { FrameListItem } from "../../types";

interface FrameFormState {
  code: string;
  name: string;
  material: string;
  color: string;
  description: string;
  basePrice: string;
  isActive: boolean;
}

const EMPTY_FORM: FrameFormState = {
  code: "",
  name: "",
  material: "",
  color: "",
  description: "",
  basePrice: "",
  isActive: true,
};

type ImageFilter = "" | "with" | "without";
type SortOption = "name" | "priceHigh" | "priceLow" | "mostUsed" | "newest";

interface ListFilters {
  image: ImageFilter;
  status: "" | "active" | "inactive";
  material: string;
  sort: SortOption;
}

const DEFAULT_FILTERS: ListFilters = { image: "", status: "", material: "", sort: "name" };
const SORTS: SortOption[] = ["name", "priceHigh", "priceLow", "mostUsed", "newest"];
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Best-effort swatch for free-text colour names (EN + MK). Unknown names get no swatch. */
const SWATCHES: [RegExp, string][] = [
  [/black|црн/i, "#1d1b18"],
  [/white|бел/i, "#f4f1ea"],
  [/gold|злат/i, "#c9a54c"],
  [/silver|сребр/i, "#b8bcc2"],
  [/walnut|орев/i, "#5c4033"],
  [/oak|даб|natural|природ/i, "#c8a574"],
  [/brown|кафе/i, "#6b4423"],
  [/beige|беж|cream|крем/i, "#dccbaa"],
  [/copper|бакар/i, "#b87333"],
  [/bronze|бронз/i, "#8c6a3b"],
  [/gr[ae]y|сив/i, "#8a8a8a"],
  [/red|црв/i, "#a63a32"],
  [/blue|син|плав/i, "#2f5f8a"],
  [/green|зел/i, "#3f6b4a"],
];
const swatchFor = (color: string) => SWATCHES.find(([re]) => re.test(color))?.[1];

function Swatch({ color, size = 12 }: { color: string; size?: number }) {
  const hex = swatchFor(color);
  if (!hex) return null;
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        bgcolor: hex,
        boxShadow: `inset 0 0 0 1px ${alpha(palette.charcoal, 0.18)}`,
      }}
    />
  );
}

/** Frame artwork on a soft ivory tile (frame PNGs keep their transparency). */
function FrameThumb({ path, size = 48 }: { path: string | null; size?: number }) {
  const url = resolveMediaUrl(path);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.25,
        flexShrink: 0,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        bgcolor: palette.ivoryDeep,
        boxShadow: `inset 0 0 0 1px ${url ? alpha(palette.charcoal, 0.08) : alpha("#B4691F", 0.35)}`,
        color: alpha("#B4691F", 0.8),
      }}
    >
      {url ? (
        <Box component="img" src={url} alt="" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <ImageNotSupportedOutlinedIcon sx={{ fontSize: size * 0.4 }} />
      )}
    </Box>
  );
}

export default function AdminFramesPage() {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const locale = i18n.language;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const hasImage = filters.image === "" ? undefined : filters.image === "with";
  // Frames are a small catalogue: load all and search/sort client-side for instant feedback.
  const { data: result, isLoading, isError, refetch } = useManageFrames({ page: 1, pageSize: 100, hasImage });
  const frames = result?.items ?? [];

  const createFrame = useCreateFrame();
  const updateFrame = useUpdateFrame();
  const deleteFrame = useDeleteFrame();
  const uploadImage = useUploadFrameImage();
  const { errors, validate, clearError, reset } = useFieldErrors<FrameFormState>();
  const isSaving = createFrame.isPending || updateFrame.isPending || uploadImage.isPending;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FrameListItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState<FrameFormState>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = useState<FrameListItem | null>(null);

  const filtersActive = (Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]).some((k) => filters[k] !== DEFAULT_FILTERS[k]);
  const materials = [...new Set(frames.map((f) => f.material).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));
  const colors = [...new Set(frames.map((f) => f.color).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));

  const q = search.trim().toLowerCase();
  const rows = frames
    .filter((f) => (filters.status === "active" ? f.isActive : filters.status === "inactive" ? !f.isActive : true))
    .filter((f) => !filters.material || f.material === filters.material)
    .filter((f) => !q || [f.name, f.code, f.material, f.color].some((s) => s?.toLowerCase().includes(q)))
    .sort((a, b) => {
      switch (filters.sort) {
        case "priceHigh":
          return b.finalPrice - a.finalPrice;
        case "priceLow":
          return a.finalPrice - b.finalPrice;
        case "mostUsed":
          return (b.paintingCount ?? 0) - (a.paintingCount ?? 0);
        case "newest":
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || b.id - a.id;
        default:
          return a.name.localeCompare(b.name, locale);
      }
    });

  const missingImages = frames.filter((f) => !f.thumbnailPath).length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    reset();
    setDialogOpen(true);
  };

  const openEdit = async (frame: FrameListItem) => {
    setEditing(frame);
    setForm({
      code: frame.code,
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
    // The list has no description — load it so saving doesn't wipe it.
    setLoadingDetail(true);
    try {
      const detail = await frameService.getById(frame.id);
      setForm((prev) => ({ ...prev, description: detail.description ?? "" }));
    } catch {
      // Global toast covers the error; the form stays usable.
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSave = async () => {
    if (!validate(form, { name: v.required, material: v.required, color: v.required, basePrice: v.positiveNumber })) return;

    const base = {
      name: form.name.trim(),
      material: form.material.trim(),
      color: form.color.trim(),
      description: form.description.trim() || undefined,
      basePrice: Number(form.basePrice) || 0,
      isActive: form.isActive,
    };

    try {
      const saved = editing
        ? await updateFrame.mutateAsync({ id: editing.id, payload: base })
        : await createFrame.mutateAsync({ ...base, code: form.code.trim() || undefined });
      if (imageFiles[0]) await uploadImage.mutateAsync({ id: saved.id, file: imageFiles[0] });
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const columns: AdminColumn<FrameListItem>[] = [
    {
      key: "frame",
      label: t("framesTable.frame"),
      render: (row) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, maxWidth: 300, opacity: row.isActive ? 1 : 0.65 }}>
          <FrameThumb path={row.thumbnailPath} />
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
              {row.name}
            </Typography>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                mt: 0.5,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.02em",
                color: palette.textSecondary,
                bgcolor: alpha(palette.charcoal, 0.04),
                px: 0.75,
                py: 0.25,
                borderRadius: 0.75,
              }}
            >
              {row.code}
            </Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "finish",
      label: t("framesTable.finish"),
      render: (row) => (
        <Box sx={{ minWidth: 0, maxWidth: 200 }}>
          <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 500 }}>
            {row.material}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.25 }}>
            <Swatch color={row.color} />
            <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
              {row.color}
            </Typography>
          </Stack>
        </Box>
      ),
    },
    {
      key: "used",
      label: t("framesTable.usedOn"),
      render: (row) =>
        row.paintingCount === undefined ? (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        ) : row.paintingCount > 0 ? (
          <Pill tone="gold" icon={<LinkRoundedIcon />}>
            {t("framesTable.paintings", { count: row.paintingCount })}
          </Pill>
        ) : (
          <Pill tone="neutral" icon={<LinkOffRoundedIcon />} tooltip={t("framesTable.notLinkedHint")}>
            {t("framesTable.notLinked")}
          </Pill>
        ),
    },
    {
      key: "image",
      label: t("frames.image"),
      render: (row) =>
        row.thumbnailPath ? (
          <Pill tone="success" icon={<CheckCircleRoundedIcon />}>
            {t("frames.hasImage")}
          </Pill>
        ) : (
          <Pill tone="danger" icon={<ErrorOutlineRoundedIcon />} tooltip={t("framesTable.missingHint")}>
            {t("frames.missingImage")}
          </Pill>
        ),
    },
    {
      key: "price",
      label: t("table.price"),
      align: "right",
      render: (row) => (
        <Box sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(row.finalPrice, locale)}</Typography>
          {row.finalPrice < row.basePrice && (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", textDecoration: "line-through" }}>{formatPrice(row.basePrice, locale)}</Typography>
          )}
        </Box>
      ),
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
        label={t("frames.image")}
        value={filters.image}
        onChange={(e) => setFilters((f) => ({ ...f, image: e.target.value as ImageFilter }))}
        sx={filterFieldSx(Boolean(filters.image), 140)}
      >
        <MenuItem value="">{t("frames.filterAll")}</MenuItem>
        <MenuItem value="with">{t("frames.filterWithImage")}</MenuItem>
        <MenuItem value="without">{t("frames.filterWithoutImage")}</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label={t("framesTable.material")}
        value={filters.material}
        onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))}
        sx={filterFieldSx(Boolean(filters.material), 140)}
      >
        <MenuItem value="">{t("filters.all")}</MenuItem>
        {materials.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        ))}
      </TextField>
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
        label={t("filters.sort")}
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))}
        sx={filterFieldSx(filters.sort !== DEFAULT_FILTERS.sort, 160)}
      >
        {SORTS.map((key) => (
          <MenuItem key={key} value={key}>
            {t(`framesTable.sorts.${key}`)}
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

  const titleExtra = result && (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <Pill tone={rows.length ? "gold" : "neutral"}>{t("framesTable.count", { count: rows.length })}</Pill>
      {missingImages > 0 && !filters.image && (
        <Box
          component="button"
          type="button"
          onClick={() => setFilters((f) => ({ ...f, image: "without" }))}
          sx={{
            all: "unset",
            cursor: "pointer",
            borderRadius: 999,
            transition: `transform 140ms ${EASE_OUT}`,
            "&:active": { transform: "scale(0.96)" },
            "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2 },
          }}
        >
          <Pill tone="danger" icon={<ErrorOutlineRoundedIcon />} tooltip={t("framesTable.showMissing")}>
            {t("framesTable.missingCount", { count: missingImages })}
          </Pill>
        </Box>
      )}
    </Stack>
  );

  const previewUrl = imageFiles[0] ? undefined : resolveMediaUrl(editing?.thumbnailPath);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <PageMeta title={t("nav.frames")} />
      <AdminDataTable
        fillHeight
        title={t("nav.frames")}
        titleExtra={titleExtra}
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
        maxWidth="md"
        media={
          editing ? (
            <FrameThumb path={editing.thumbnailPath} size={40} />
          ) : (
            <DialogIconTile>
              <CropOriginalOutlinedIcon />
            </DialogIconTile>
          )
        }
        title={editing ? editing.name : t("framesTable.newTitle")}
        subtitle={
          editing ? (
            <Box component="span" sx={{ fontFamily: MONO, fontSize: 12 }}>
              {editing.code}
            </Box>
          ) : (
            t("framesTable.newSubtitle")
          )
        }
        actions={
          <>
            <Button color="inherit" onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>
              {t("common:actions.cancel")}
            </Button>
            <SubmitButton variant="contained" onClick={handleSave} loading={isSaving}>
              {editing ? t("common:actions.save") : t("framesTable.create")}
            </SubmitButton>
          </>
        }
      >
        {loadingDetail && <LinearProgress sx={{ mb: 1.5, height: 2, borderRadius: 1 }} />}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ pt: 1 }}>
          {/* Image */}
          <Box sx={{ width: { md: 260 }, flexShrink: 0 }}>
            <Typography sx={sectionLabelSx}>{t("frames.image")}</Typography>
            <ImageDropzone files={imageFiles} onChange={setImageFiles} existingPreviewUrls={previewUrl ? [previewUrl] : []} />
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 1, lineHeight: 1.5 }}>{t("framesTable.imageHint")}</Typography>
          </Box>

          {/* Details */}
          <Stack spacing={2.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...sectionLabelSx, mb: -1 }}>{t("framesTable.details")}</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                autoFocus={!editing}
                label={t("table.name")}
                placeholder={t("framesTable.namePlaceholder")}
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  clearError("name");
                }}
                error={Boolean(errors.name)}
                helperText={errors.name}
                sx={{ flex: 2 }}
              />
              {!editing && (
                <TextField
                  label={t("table.code")}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  helperText={t("framesTable.codeHint")}
                  sx={{ flex: 1, "& input": { fontFamily: MONO } }}
                />
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Autocomplete
                freeSolo
                options={materials}
                inputValue={form.material}
                onInputChange={(_, value) => {
                  setForm((f) => ({ ...f, material: value }));
                  clearError("material");
                }}
                sx={{ flex: 1 }}
                renderInput={(params) => (
                  <TextField {...params} label={t("framesTable.material")} placeholder={t("framesTable.materialPlaceholder")} error={Boolean(errors.material)} helperText={errors.material} />
                )}
              />
              <Autocomplete
                freeSolo
                options={colors}
                inputValue={form.color}
                onInputChange={(_, value) => {
                  setForm((f) => ({ ...f, color: value }));
                  clearError("color");
                }}
                sx={{ flex: 1 }}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <li key={key} {...rest}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Swatch color={option} />
                        <span>{option}</span>
                      </Stack>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("framesTable.color")}
                    placeholder={t("framesTable.colorPlaceholder")}
                    error={Boolean(errors.color)}
                    helperText={errors.color}
                    slotProps={{
                      input: {
                        ...params.slotProps.input,
                        startAdornment: swatchFor(form.color) ? (
                          <InputAdornment position="start" sx={{ ml: 0.5 }}>
                            <Swatch color={form.color} size={14} />
                          </InputAdornment>
                        ) : undefined,
                      },
                    }}
                  />
                )}
              />
            </Stack>
            <TextField
              label={t("framesTable.basePrice")}
              type="number"
              value={form.basePrice}
              onChange={(e) => {
                setForm({ ...form, basePrice: e.target.value });
                clearError("basePrice");
              }}
              error={Boolean(errors.basePrice)}
              helperText={errors.basePrice ?? t("framesTable.basePriceHint")}
              sx={{ maxWidth: { sm: 240 } }}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">ден</InputAdornment> } }}
            />
            <TextField
              label={t("framesTable.description")}
              placeholder={t("framesTable.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loadingDetail}
              multiline
              minRows={3}
              fullWidth
            />
            <SettingRow
              tone={form.isActive ? "on" : "off"}
              title={form.isActive ? t("distributors.active") : t("distributors.inactive")}
              hint={form.isActive ? t("framesTable.activeHint") : t("framesTable.inactiveHint")}
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} color="success" />}
            />
            {editing && editing.paintingCount !== undefined && (
              <Tooltip title={t("framesTable.linkHint")} placement="top-start">
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.secondary", width: "fit-content", "& svg": { fontSize: 16 } }}>
                  {editing.paintingCount ? <LinkRoundedIcon /> : <LinkOffRoundedIcon />}
                  <Typography sx={{ fontSize: 12.5 }}>
                    {editing.paintingCount ? t("framesTable.linkedTo", { count: editing.paintingCount }) : t("framesTable.notLinkedHint")}
                  </Typography>
                </Stack>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </AdminDialog>

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

const sectionLabelSx = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.secondary",
  mb: 1,
} as const;
