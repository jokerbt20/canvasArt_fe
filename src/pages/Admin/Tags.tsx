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
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useTags, useCreateTag, useDeleteTag, useUpdateTag } from "../../hooks/useTags";
import { useFieldErrors, v } from "../../utils/validation";
import type { Tag } from "../../types";

interface TagFormState {
  name: string;
  slug: string;
}

const EMPTY_FORM: TagFormState = { name: "", slug: "" };

export default function AdminTagsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data: tags, isLoading, isError, refetch } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const { errors, validate, clearError, reset } = useFieldErrors<TagFormState>();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState<TagFormState>(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const isSaving = createTag.isPending || updateTag.isPending;
  const filtered = tags?.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    reset();
    setDialogOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setForm({ name: tag.name, slug: tag.slug });
    reset();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form, { name: v.required })) return;
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
    };
    try {
      if (editing) {
        await updateTag.mutateAsync({ id: editing.id, payload });
      } else {
        await createTag.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const columns: AdminColumn<Tag>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "slug", label: "Slug", render: (row) => row.slug },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.tags")} />
      <AdminDataTable
        title={t("nav.tags")}
        columns={columns}
        rows={filtered ?? []}
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
            <TextField label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} fullWidth />
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
        loading={deleteTag.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteTag.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}
