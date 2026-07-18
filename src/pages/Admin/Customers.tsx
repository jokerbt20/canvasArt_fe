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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { ImageDropzone } from "../../components/admin/ImageDropzone";
import {
  useCreateTestimonial,
  useDeleteTestimonial,
  useManageTestimonials,
  useUpdateTestimonial,
} from "../../hooks/useTestimonials";
import { resolveMediaUrl } from "../../utils/media";
import type { Testimonial } from "../../types";

interface TestimonialFormState {
  customerName: string;
  comment: string;
  rating: number | null;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: TestimonialFormState = {
  customerName: "",
  comment: "",
  rating: null,
  displayOrder: "0",
  isActive: true,
};

export default function AdminCustomersPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data: testimonials, isLoading } = useManageTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialFormState>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setDialogOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm({
      customerName: testimonial.customerName,
      comment: testimonial.comment,
      rating: testimonial.rating,
      displayOrder: String(testimonial.displayOrder),
      isActive: testimonial.isActive,
    });
    setImageFiles([]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      customerName: form.customerName,
      comment: form.comment,
      rating: form.rating ?? undefined,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };

    if (editing) {
      await updateTestimonial.mutateAsync({ id: editing.id, payload, file: imageFiles[0] });
    } else {
      await createTestimonial.mutateAsync({ payload, file: imageFiles[0] });
    }
    setDialogOpen(false);
  };

  const columns: AdminColumn<Testimonial>[] = [
    {
      key: "image",
      label: "",
      render: (row) => (
        <Avatar src={resolveMediaUrl(row.thumbnailPath ?? row.imagePath)} alt={row.customerName} />
      ),
    },
    { key: "customerName", label: t("table.name"), render: (row) => row.customerName },
    {
      key: "comment",
      label: "Comment",
      render: (row) => (row.comment.length > 80 ? `${row.comment.slice(0, 80)}…` : row.comment),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => (row.rating ? <Rating value={row.rating} size="small" readOnly /> : "-"),
    },
    { key: "order", label: "Order", render: (row) => row.displayOrder, align: "right" },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.customers")} />
      <AdminDataTable
        title={t("nav.customers")}
        columns={columns}
        rows={testimonials ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onAddNew={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t("form.editItem") : t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Customer Name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Testimonial"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
            <Box>
              <Box sx={{ mb: 0.5, fontSize: "0.8rem", color: "text.secondary" }}>Rating</Box>
              <Rating
                value={form.rating}
                onChange={(_, value) => setForm({ ...form, rating: value })}
              />
            </Box>
            <TextField
              label="Sort Order"
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
            <ImageDropzone
              files={imageFiles}
              onChange={setImageFiles}
              existingPreviewUrls={
                editing?.imagePath ? [resolveMediaUrl(editing.imagePath) ?? ""] : []
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={createTestimonial.isPending || updateTestimonial.isPending}
          >
            {t("common:actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteTestimonial.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteTestimonial.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
