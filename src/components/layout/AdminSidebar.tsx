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

interface NavItem {
  key: string;
  path: string;
  end?: boolean;
  icon: typeof DashboardOutlinedIcon;
}

/** Sidebar sections, grouped by what the admin is working on. `group: null` renders without a heading. */
const NAV_GROUPS: { group: string | null; items: NavItem[] }[] = [
  { group: null, items: [{ key: "dashboard", path: "/admin", end: true, icon: DashboardOutlinedIcon }] },
  {
    group: "catalog",
    items: [
      { key: "paintings", path: "/admin/paintings", icon: ImageOutlinedIcon },
      { key: "frames", path: "/admin/frames", icon: CropOriginalOutlinedIcon },
      { key: "categories", path: "/admin/categories", icon: CategoryOutlinedIcon },
      { key: "tags", path: "/admin/tags", icon: SellOutlinedIcon },
    ],
  },
  {
    group: "sales",
    items: [
      { key: "orders", path: "/admin/orders", icon: ReceiptLongOutlinedIcon },
      { key: "customers", path: "/admin/customers", icon: PeopleAltOutlinedIcon },
      { key: "promotions", path: "/admin/promotions", icon: LocalOfferOutlinedIcon },
      { key: "distributors", path: "/admin/distributors", icon: StorefrontOutlinedIcon },
    ],
  },
  {
    group: "website",
    items: [
      { key: "homepage", path: "/admin/homepage", icon: HomeOutlinedIcon },
      { key: "slideshow", path: "/admin/slideshow", icon: ViewCarouselOutlinedIcon },
      { key: "translations", path: "/admin/translations", icon: TranslateOutlinedIcon },
      { key: "settings", path: "/admin/settings", icon: SettingsOutlinedIcon },
      { key: "users", path: "/admin/users", icon: GroupOutlinedIcon },
    ],
  },
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
      <Stack sx={{ px: 3, pt: 2.5, pb: 2 }}>
        {/* logoTrim.png is logo.png cropped to the artwork — the original square file is ~50% empty
            space above and below. Width-driven so it keeps its aspect ratio (never stretched). */}
        <Box
          component="img"
          src="/logoTrim.png"
          alt="CanvasArts"
          sx={{ width: "100%", maxWidth: 200, height: "auto", alignSelf: "flex-start", display: "block" }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          Admin
        </Typography>
      </Stack>

      {/* Scrolls on its own if the window is short; logo stays put. */}
      <Box component="nav" sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.5, pb: 2 }}>
        {NAV_GROUPS.map(({ group, items }) => (
          <List
            key={group ?? "root"}
            disablePadding
            sx={{ mb: 1 }}
            subheader={
              group ? (
                <Typography
                  component="div"
                  sx={{
                    px: 1.5,
                    pt: 1.5,
                    pb: 0.75,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  {t(`nav.groups.${group}`)}
                </Typography>
              ) : undefined
            }
          >
            {items.map(({ key, path, end, icon: Icon }) => (
              <ListItemButton
                key={key}
                component={NavLink}
                to={path}
                end={end}
                sx={{
                  borderRadius: 1,
                  mb: 0.25,
                  py: 0.75,
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
        ))}
      </Box>
    </Box>
  );
}
