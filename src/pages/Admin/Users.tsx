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
import Chip from "@mui/material/Chip";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { useAdminUsers, useCreateAdminUser } from "../../hooks/useAdmin";
import type { AdminUser } from "../../types/auth";

const EMPTY_FORM = { email: "", password: "", firstName: "", lastName: "", role: "Administrator" };

export default function AdminUsersPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data, isLoading } = useAdminUsers({ page: 1, pageSize: 50 });
  const createUser = useCreateAdminUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSave = async () => {
    await createUser.mutateAsync(form);
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  };

  const columns: AdminColumn<AdminUser>[] = [
    { key: "name", label: t("table.name"), render: (row) => `${row.firstName} ${row.lastName}` },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "role", label: "Role", render: (row) => <Chip size="small" label={row.role} /> },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.users")} />
      <AdminDataTable
        title={t("nav.users")}
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onAddNew={() => setDialogOpen(true)}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth />
            <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createUser.isPending}>
            {t("common:actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
