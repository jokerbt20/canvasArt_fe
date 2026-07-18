import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, loading }: ConfirmDialogProps) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("common:actions.delete")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{t("table.confirmDelete")}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common:actions.cancel")}</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {t("common:actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
