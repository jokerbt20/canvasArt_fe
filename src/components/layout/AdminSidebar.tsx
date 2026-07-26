import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import CropOriginalOutlinedIcon from "@mui/icons-material/CropOriginalOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";

const NAV_ITEMS: {
  key: string;
  path: string;
  end?: boolean;
  icon: typeof DashboardOutlinedIcon;
}[] = [
  { key: "dashboard", path: "/admin", end: true, icon: DashboardOutlinedIcon },
  { key: "paintings", path: "/admin/paintings", icon: ImageOutlinedIcon },
  { key: "categories", path: "/admin/categories", icon: CategoryOutlinedIcon },
  { key: "tags", path: "/admin/tags", icon: SellOutlinedIcon },
  { key: "frames", path: "/admin/frames", icon: CropOriginalOutlinedIcon },
  { key: "orders", path: "/admin/orders", icon: ReceiptLongOutlinedIcon },
  { key: "promotions", path: "/admin/promotions", icon: LocalOfferOutlinedIcon },
  { key: "distributors", path: "/admin/distributors", icon: StorefrontOutlinedIcon },
  { key: "homepage", path: "/admin/homepage", icon: HomeOutlinedIcon },
  { key: "slideshow", path: "/admin/slideshow", icon: ViewCarouselOutlinedIcon },
  { key: "customers", path: "/admin/customers", icon: PeopleAltOutlinedIcon },
  { key: "users", path: "/admin/users", icon: GroupOutlinedIcon },
  { key: "translations", path: "/admin/translations", icon: TranslateOutlinedIcon },
  { key: "settings", path: "/admin/settings", icon: SettingsOutlinedIcon },
];

export const ADMIN_SIDEBAR_WIDTH = 264;

export function AdminSidebar() {
  const { t } = useTranslation("admin");

  return (
    <Box
      sx={{
        width: ADMIN_SIDEBAR_WIDTH,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
      }}
    >
      <Stack sx={{ px: 3, py: 3.5 }}>
        <Box component="img" src="/logo.png" alt="CanvasArts" sx={{ height: 100, width: "auto", display: "block" }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Admin
        </Typography>
      </Stack>

      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(({ key, path, end, icon: Icon }) => (
          <ListItemButton
            key={key}
            component={NavLink}
            to={path}
            end={end}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "& .MuiListItemIcon-root": { color: "primary.contrastText" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t(`nav.${key}`)} slotProps={{ primary: { variant: "body2" } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
