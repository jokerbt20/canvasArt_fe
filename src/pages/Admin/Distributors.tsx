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
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LoyaltyOutlinedIcon from "@mui/icons-material/LoyaltyOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { AdminDataTable, type AdminColumn } from "../../components/admin/AdminDataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SubmitButton } from "../../components/common/SubmitButton";
import { useFieldErrors, v } from "../../utils/validation";
import {
  useCreateDistributor,
  useCreatePromoCode,
  useDeleteDistributor,
  useDeletePromoCode,
  useDistributors,
  usePromoCodes,
  useUpdateDistributor,
  useUpdatePromoCode,
} from "../../hooks/useDistributors";
import type { Distributor, PromoCode } from "../../types";

interface DistributorFormState {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

const EMPTY_DISTRIBUTOR: DistributorFormState = { name: "", email: "", phone: "", isActive: true };

interface PromoCodeFormState {
  code: string;
  discountPercentage: string;
  isActive: boolean;
}

const EMPTY_PROMO: PromoCodeFormState = { code: "", discountPercentage: "", isActive: true };

export default function AdminDistributorsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useDistributors({ page, pageSize: 10, search: search || undefined });

  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();
  const deleteDistributor = useDeleteDistributor();
  const { errors, validate, clearError, reset } = useFieldErrors<DistributorFormState>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);
  const [form, setForm] = useState<DistributorFormState>(EMPTY_DISTRIBUTOR);
  const [pendingDelete, setPendingDelete] = useState<Distributor | null>(null);

  // Promo-code management, scoped to one distributor.
  const [codesFor, setCodesFor] = useState<Distributor | null>(null);

  const isSaving = createDistributor.isPending || updateDistributor.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_DISTRIBUTOR);
    reset();
    setDialogOpen(true);
  };

  const openEdit = (distributor: Distributor) => {
    setEditing(distributor);
    setForm({
      name: distributor.name,
      email: distributor.email ?? "",
      phone: distributor.phone ?? "",
      isActive: distributor.isActive,
    });
    reset();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form, { name: v.required, email: v.email })) return;
    const payload = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await updateDistributor.mutateAsync({ id: editing.id, payload });
      } else {
        await createDistributor.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      // Error toast is shown globally; keep the dialog open so the user can retry.
    }
  };

  const columns: AdminColumn<Distributor>[] = [
    { key: "name", label: t("table.name"), render: (row) => row.name },
    { key: "email", label: t("distributors.contact"), render: (row) => row.email ?? row.phone ?? "—" },
    {
      key: "codes",
      label: t("distributors.codes"),
      render: (row) => (
        <Button size="small" variant="outlined" startIcon={<LoyaltyOutlinedIcon fontSize="small" />} onClick={() => setCodesFor(row)}>
          {row.promoCodeCount} · {t("distributors.manageCodes")}
        </Button>
      ),
    },
    {
      key: "active",
      label: t("table.status"),
      render: (row) => (
        <Chip size="small" color={row.isActive ? "success" : "default"} label={row.isActive ? t("distributors.active") : t("distributors.inactive")} />
      ),
    },
  ];

  return (
    <Box>
      <PageMeta title={t("nav.distributors")} />
      <AdminDataTable
        title={t("nav.distributors")}
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t("distributors.email")}
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    clearError("email");
                  }}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t("distributors.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
              </Grid>
            </Grid>
            <FormControlLabel
              control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label={t("distributors.active")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("common:actions.cancel")}</Button>
          <SubmitButton variant="contained" onClick={handleSave} loading={isSaving}>
            {t("common:actions.save")}
          </SubmitButton>
        </DialogActions>
      </Dialog>

      <PromoCodesDialog distributor={codesFor} onClose={() => setCodesFor(null)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteDistributor.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteDistributor.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Box>
  );
}

function PromoCodesDialog({ distributor, onClose }: { distributor: Distributor | null; onClose: () => void }) {
  const { t } = useTranslation(["admin", "common"]);
  const { data: codes, isLoading } = usePromoCodes(distributor?.id);
  const createCode = useCreatePromoCode();
  const updateCode = useUpdatePromoCode();
  const deleteCode = useDeletePromoCode();
  const { errors, validate, clearError, reset } = useFieldErrors<PromoCodeFormState>();

  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoCodeFormState>(EMPTY_PROMO);
  const [pendingDelete, setPendingDelete] = useState<PromoCode | null>(null);

  const isSavingCode = createCode.isPending || updateCode.isPending;

  const resetForm = () => {
    setEditingCode(null);
    setForm(EMPTY_PROMO);
    reset();
  };

  const startEdit = (code: PromoCode) => {
    setEditingCode(code);
    setForm({ code: code.code, discountPercentage: String(code.discountPercentage), isActive: code.isActive });
    reset();
  };

  const handleSave = async () => {
    if (!distributor) return;
    if (!validate(form, { code: v.required, discountPercentage: v.positiveNumber })) return;
    const percentage = Number(form.discountPercentage) || 0;
    try {
      if (editingCode) {
        await updateCode.mutateAsync({
          id: editingCode.id,
          payload: { code: form.code, discountPercentage: percentage, isActive: form.isActive },
        });
      } else {
        await createCode.mutateAsync({
          distributorId: distributor.id,
          code: form.code,
          discountPercentage: percentage,
          isActive: form.isActive,
        });
      }
      resetForm();
    } catch {
      // Error toast is shown globally; keep the form open so the user can retry.
    }
  };

  return (
    <Dialog
      open={Boolean(distributor)}
      onClose={() => {
        resetForm();
        onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t("distributors.codesFor", { name: distributor?.name ?? "" })}
      </DialogTitle>
      <DialogContent>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t("distributors.code")}</TableCell>
              <TableCell align="right">{t("distributors.discount")}</TableCell>
              <TableCell>{t("table.status")}</TableCell>
              <TableCell align="right">{t("table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || !codes ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    …
                  </Typography>
                </TableCell>
              </TableRow>
            ) : codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t("distributors.noCodes")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => (
                <TableRow key={code.id} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>{code.code}</TableCell>
                  <TableCell align="right">{code.discountPercentage}%</TableCell>
                  <TableCell>
                    <Chip size="small" color={code.isActive ? "success" : "default"} label={code.isActive ? t("distributors.active") : t("distributors.inactive")} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => startEdit(code)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setPendingDelete(code)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {editingCode ? t("distributors.editCode") : t("distributors.addCode")}
        </Typography>
        <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
          <Grid size={5}>
            <TextField
              size="small"
              label={t("distributors.code")}
              value={form.code}
              onChange={(e) => {
                setForm({ ...form, code: e.target.value.toUpperCase() });
                clearError("code");
              }}
              error={Boolean(errors.code)}
              helperText={errors.code}
              fullWidth
            />
          </Grid>
          <Grid size={3}>
            <TextField
              size="small"
              label={t("distributors.discount")}
              type="number"
              value={form.discountPercentage}
              onChange={(e) => {
                setForm({ ...form, discountPercentage: e.target.value });
                clearError("discountPercentage");
              }}
              error={Boolean(errors.discountPercentage)}
              helperText={errors.discountPercentage}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <FormControlLabel
              control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label={t("distributors.active")}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <SubmitButton
            variant="contained"
            startIcon={editingCode ? undefined : <AddIcon />}
            onClick={handleSave}
            loading={isSavingCode}
          >
            {editingCode ? t("common:actions.save") : t("distributors.addCode")}
          </SubmitButton>
          {editingCode && (
            <Button onClick={resetForm}>{t("common:actions.cancel")}</Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          {t("common:actions.close")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleteCode.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteCode.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Dialog>
  );
}
