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
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "../../hooks/useCategories";
import type { Category } from "../../types";

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CategoryFormState = { name: "", slug: "", description: "", displayOrder: "0", isActive: true };

export default function AdminCategoriesPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const filtered = categories?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || undefined,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const columns: AdminColumn<Category>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "slug", label: "Slug", render: (row) => row.slug },
    { key: "count", label: "Paintings", render: (row) => row.paintingCount, align: "right" },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.categories")} />
      <AdminDataTable
        title={t("nav.categories")}
        columns={columns}
        rows={filtered ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
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
            <TextField label={t("table.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} fullWidth />
            <TextField label="Display Order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={3} />
            <FormControlLabel control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createCategory.isPending || updateCategory.isPending}>
            {t("common:actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteCategory.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteCategory.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
