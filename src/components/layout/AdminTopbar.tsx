import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { useAuth } from "../../contexts/AuthContext";

export function AdminTopbar() {
  const { t } = useTranslation("common");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
            {user?.firstName?.charAt(0) ?? "A"}
          </Avatar>
          <Typography variant="body2">{user ? `${user.firstName} ${user.lastName}` : ""}</Typography>
        </Stack>
        <Button size="small" variant="outlined" onClick={handleLogout}>
          {t("actions.logout")}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
