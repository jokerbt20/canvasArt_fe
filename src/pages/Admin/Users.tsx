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
import Alert from "@mui/material/Alert";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useAdminUsers, useCreateAdminUser } from "../../hooks/useAdmin";
import { useFieldErrors, v } from "../../utils/validation";
import type { ApiClientError } from "../../api/axios";
import type { AdminUser } from "../../types/auth";

type UserFormState = typeof EMPTY_FORM;

const EMPTY_FORM = { email: "", password: "", firstName: "", lastName: "", role: "Administrator" };

export default function AdminUsersPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { data, isLoading, isError, refetch } = useAdminUsers({ page: 1, pageSize: 50 });
  const createUser = useCreateAdminUser();
  const { errors, validate, clearError, reset } = useFieldErrors<UserFormState>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    createUser.reset();
    setForm(EMPTY_FORM);
    reset();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !validate(form, {
        firstName: v.required,
        lastName: v.required,
        email: v.compose(v.required, v.email),
        password: v.compose(v.required, v.minLength(6)),
      })
    )
      return;
    try {
      await createUser.mutateAsync(form);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
    } catch {
      // Error is surfaced via createUser.error in the dialog below.
    }
  };

  const errorMessage = createUser.isError ? (createUser.error as unknown as { clientError?: ApiClientError }).clientError?.message : undefined;

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
        isError={isError}
        onRetry={() => refetch()}
        onAddNew={openCreate}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("form.addNew")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={(e) => {
                setForm({ ...form, firstName: e.target.value });
                clearError("firstName");
              }}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={(e) => {
                setForm({ ...form, lastName: e.target.value });
                clearError("lastName");
              }}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                clearError("email");
              }}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                clearError("password");
              }}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSave} loading={createUser.isPending}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
