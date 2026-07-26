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
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { PaintingImagePicker } from "../../components/admin/PaintingImagePicker";
import { SubmitButton } from "../../components/common/SubmitButton";
import {
  useCreateSlideFromPaintingImage,
  useDeleteSlide,
  useManageSlides,
  useUpdateSlide,
  useUpdateSlideFromPaintingImage,
} from "../../hooks/useContent";
import { resolveMediaUrl } from "../../utils/media";
import type { PaintingDetail, PaintingImage, Slide } from "../../types";

interface Selection {
  painting: PaintingDetail;
  image: PaintingImage;
}

interface EditFormState {
  title: string;
  subtitle: string;
  linkUrl: string;
  buttonText: string;
  displayOrder: string;
  isActive: boolean;
}

export default function AdminSlideshowPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data: slides, isLoading, isError, refetch } = useManageSlides();
  const createSlideFromImage = useCreateSlideFromPaintingImage();
  const updateSlide = useUpdateSlide();
  const updateSlideFromImage = useUpdateSlideFromPaintingImage();
  const deleteSlide = useDeleteSlide();

  // Bulk "add from gallery" dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Single-slide edit dialog
  const [editing, setEditing] = useState<Slide | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editImage, setEditImage] = useState<Selection | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);

  const [pendingDelete, setPendingDelete] = useState<Slide | null>(null);

  const openBulkAdd = () => {
    setSelections([]);
    setBulkOpen(true);
  };

  const toggleSelection = (painting: PaintingDetail, image: PaintingImage) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.image.id === image.id);
      if (exists) return prev.filter((s) => s.image.id !== image.id);
      return [...prev, { painting, image }];
    });
  };

  const handleBulkSave = async () => {
    if (selections.length === 0) return;
    setBulkSaving(true);
    try {
      const baseOrder = slides?.length ?? 0;
      for (let i = 0; i < selections.length; i++) {
        const { painting, image } = selections[i];
        await createSlideFromImage.mutateAsync({
          paintingImageId: image.id,
          title: painting.name,
          subtitle: painting.description ? painting.description.slice(0, 160) : undefined,
          displayOrder: baseOrder + i,
          isActive: true,
        });
      }
      setSelections([]);
      setBulkOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    } finally {
      setBulkSaving(false);
    }
  };

  const openEdit = (slide: Slide) => {
    setEditing(slide);
    setTitleError(undefined);
    setEditForm({
      title: slide.title,
      subtitle: slide.subtitle ?? "",
      linkUrl: slide.linkUrl ?? "",
      buttonText: slide.buttonText ?? "",
      displayOrder: String(slide.displayOrder),
      isActive: slide.isActive,
    });
    setEditImage(null);
  };

  const handleEditSave = async () => {
    if (!editing || !editForm) return;
    if (!editForm.title.trim()) {
      setTitleError("Title is required.");
      return;
    }
    setEditSaving(true);
    try {
      const payload = {
        title: editForm.title,
        subtitle: editForm.subtitle || undefined,
        linkUrl: editForm.linkUrl || undefined,
        buttonText: editForm.buttonText || undefined,
        displayOrder: Number(editForm.displayOrder) || 0,
        isActive: editForm.isActive,
      };

      if (editImage) {
        await updateSlideFromImage.mutateAsync({
          id: editing.id,
          payload: { ...payload, paintingImageId: editImage.image.id },
        });
      } else {
        await updateSlide.mutateAsync({ id: editing.id, payload });
      }
      setEditing(null);
      setEditForm(null);
      setEditImage(null);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    } finally {
      setEditSaving(false);
    }
  };

  const columns: AdminColumn<Slide>[] = [
    { key: "title", label: t("table.name"), render: (row) => row.title },
    { key: "subtitle", label: "Subtitle", render: (row) => row.subtitle ?? "-" },
    { key: "order", label: "Order", render: (row) => row.displayOrder, align: "right" },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.slideshow")} />
      <AdminDataTable
        title={t("nav.slideshow")}
        columns={columns}
        rows={slides ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onAddNew={openBulkAdd}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      {/* Bulk add from gallery */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Slideshow from Gallery</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Click any images below to select them. Each selected image becomes a slide, using its painting's name
            and description automatically — nothing to type or upload.
          </Typography>
          <PaintingImagePicker
            selectedIds={selections.map((s) => s.image.id)}
            onToggle={toggleSelection}
          />

          {selections.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected ({selections.length})
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {selections.map((s) => (
                  <Chip
                    key={s.image.id}
                    label={s.painting.name}
                    onDelete={() => toggleSelection(s.painting, s.image)}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleBulkSave} loading={bulkSaving} disabled={selections.length === 0}>
            {`Create Slideshow${selections.length ? ` (${selections.length})` : ""}`}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      {/* Edit a single slide */}
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("form.editItem")}</DialogTitle>
        <DialogContent>
          {editForm && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Image
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                  <Box
                    component="img"
                    src={
                      editImage
                        ? resolveMediaUrl(editImage.image.resizedPath) ?? resolveMediaUrl(editImage.image.thumbnailPath)
                        : resolveMediaUrl(editing?.imagePath)
                    }
                    alt=""
                    sx={{ width: 72, height: 72, objectFit: "cover", display: "block" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {editImage ? "New image selected below" : "Current image — pick one below to replace it"}
                  </Typography>
                </Box>
                <PaintingImagePicker
                  selectedIds={editImage ? [editImage.image.id] : []}
                  onToggle={(painting, image) => setEditImage({ painting, image })}
                />
              </Box>
              <TextField
                label="Title"
                value={editForm.title}
                onChange={(e) => {
                  setEditForm({ ...editForm, title: e.target.value });
                  setTitleError(undefined);
                }}
                error={Boolean(titleError)}
                helperText={titleError}
                fullWidth
              />
              <TextField label="Subtitle" value={editForm.subtitle} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} fullWidth multiline minRows={2} />
              <TextField label="Link URL" value={editForm.linkUrl} onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })} fullWidth />
              <TextField label="Button Text" value={editForm.buttonText} onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })} fullWidth />
              <TextField label="Sort Order" type="number" value={editForm.displayOrder} onChange={(e) => setEditForm({ ...editForm, displayOrder: e.target.value })} fullWidth />
              <FormControlLabel control={<Checkbox checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleEditSave} loading={editSaving}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteSlide.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteSlide.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
