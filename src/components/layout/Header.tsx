import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { useCart } from "../../contexts/CartContext";
import { supportedLanguages, type SupportedLanguage } from "../../i18n";

const NAV_ITEMS: { key: string; path: string }[] = [
  { key: "home", path: "/" },
  { key: "gallery", path: "/gallery" },
  { key: "customers", path: "/customers" },
  { key: "offers", path: "/offers" },
  { key: "contact", path: "/contact" },
];

export function Header() {
  const { t } = useTranslation("common");
  const { locale, changeLocale } = useLocale();
  const { itemCount } = useCart();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState<HTMLElement | null>(null);

  const isHome = location.pathname === `/${locale}` || location.pathname === `/${locale}/`;
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const textColor = transparent ? "#F7F4EF" : "text.primary";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: transparent ? "transparent" : "rgba(247,244,239,0.92)",
        backdropFilter: transparent ? "none" : "blur(10px)",
        borderBottom: transparent ? "none" : "1px solid",
        borderColor: "divider",
        transition: "all 320ms ease",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 108, md: 116 }, justifyContent: "space-between" }}>
          <Box
            component={RouterLink}
            to={localizedPath(locale, "/")}
            sx={{ display: "inline-grid", alignItems: "center", textDecoration: "none" }}
          >
            {/* Both logos share one grid cell and crossfade, so the swap follows the
                header's own 320ms transition instead of popping. */}
            {[
              { src: "/logoBlack.png", visible: transparent },
              { src: "/logo.png", visible: !transparent },
            ].map(({ src, visible }) => (
              <Box
                key={src}
                component="img"
                src={src}
                alt={visible ? t("brand.name") : ""}
                aria-hidden={!visible}
                sx={{
                  gridArea: "1 / 1",
                  height: { xs: 108, md: 116 },
                  width: "auto",
                  display: "block",
                  opacity: visible ? 1 : 0,
                  transition: "opacity 320ms ease",
                }}
              />
            ))}
          </Box>

          <Stack
            direction="row"
            spacing={4}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {NAV_ITEMS.map((item) => (
              <Typography
                key={item.key}
                component={RouterLink}
                to={localizedPath(locale, item.path)}
                variant="subtitle2"
                sx={{
                  color: textColor,
                  textDecoration: "none",
                  position: "relative",
                  transition: "color 320ms ease, opacity 200ms ease",
                  opacity: 0.9,
                  "&:hover": { opacity: 1 },
                }}
              >
                {t(`nav.${item.key}`)}
              </Typography>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton
              onClick={(e) => setLangAnchor(e.currentTarget)}
              sx={{ color: textColor, display: { xs: "none", sm: "inline-flex" } }}
              aria-label={t("language.select")}
            >
              <LanguageIcon fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
                {locale.toUpperCase()}
              </Typography>
            </IconButton>
            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={() => setLangAnchor(null)}
            >
              {supportedLanguages.map((lng) => (
                <MenuItem
                  key={lng}
                  selected={lng === locale}
                  onClick={() => {
                    changeLocale(lng as SupportedLanguage);
                    setLangAnchor(null);
                  }}
                >
                  {t(`language.${lng}`)}
                </MenuItem>
              ))}
            </Menu>

            <IconButton
              component={RouterLink}
              to={localizedPath(locale, "/cart")}
              sx={{ color: textColor }}
              aria-label={t("nav.cart")}
            >
              <Badge badgeContent={itemCount} color="primary" invisible={itemCount === 0}>
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: textColor, display: { xs: "inline-flex", md: "none" } }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <Drawer anchor="right" open onClose={() => setMobileOpen(false)}>
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{ width: 300, height: "100%", bgcolor: "background.default", p: 4 }}
            >
              <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                <IconButton onClick={() => setMobileOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Stack spacing={3} sx={{ mt: 4 }}>
                {NAV_ITEMS.map((item) => (
                  <Typography
                    key={item.key}
                    component={RouterLink}
                    to={localizedPath(locale, item.path)}
                    variant="h5"
                    sx={{ color: "text.primary", textDecoration: "none" }}
                  >
                    {t(`nav.${item.key}`)}
                  </Typography>
                ))}
                <Divider />
                <Stack direction="row" spacing={2}>
                  {supportedLanguages.map((lng) => (
                    <Typography
                      key={lng}
                      onClick={() => changeLocale(lng as SupportedLanguage)}
                      sx={{
                        cursor: "pointer",
                        fontWeight: lng === locale ? 700 : 400,
                        textDecoration: "underline",
                      }}
                    >
                      {t(`language.${lng}`)}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Drawer>
        )}
      </AnimatePresence>
    </AppBar>
  );
}
