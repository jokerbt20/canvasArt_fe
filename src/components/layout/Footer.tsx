import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { useSettings } from "../../hooks/useContent";

const FOOTER_LINKS = ["home", "gallery", "customers", "offers", "contact"] as const;

const SOCIAL_NETWORKS = [
  { key: "social.instagram", label: "Instagram", host: "instagram.com", Icon: InstagramIcon },
  { key: "social.facebook", label: "Facebook", host: "facebook.com", Icon: FacebookIcon },
] as const;

/**
 * Accepts what an admin is likely to type: a full URL, "instagram.com/name", or "@name"/"name".
 * Returns null for anything that can't be turned into an http(s) link.
 */
function toSocialUrl(value: string, host: string): string | null {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(value)) return `https://${value}`;
  const handle = value.replace(/^@/, "");
  return /^[\w.]+$/.test(handle) ? `https://${host}/${handle}` : null;
}

export function Footer() {
  const { t } = useTranslation("common");
  const { locale } = useLocale();
  const { data: settings } = useSettings("Contact");

  const { data: social } = useSettings("Social");

  const settingValue = (key: string, fallback: string) =>
    settings?.find((s) => s.key === key)?.value || fallback;

  // Social links are configured in Admin → Settings → Social networks; empty ones are hidden.
  const socialLinks = SOCIAL_NETWORKS.flatMap(({ key, label, host, Icon }) => {
    const raw = social?.find((s) => s.key === key)?.value?.trim();
    const href = raw ? toSocialUrl(raw, host) : null;
    return href ? [{ key, label, href, Icon }] : [];
  });

  return (
    <Box component="footer" sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", mt: 12 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              component="img"
              src="/logoRound.webp"
              alt="CanvasArts"
              sx={{
                height: 200,
                width: "auto",
                display: "block",
                mb: 2,
                filter:
                  "drop-shadow(0 0 1.5px rgba(255,255,255,0.2)) drop-shadow(0 0 3.5px rgba(255,255,255,0.2)) drop-shadow(0 0 6px rgba(255,255,255,0.2))",
              }}
            />
            <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 360 }}>
              {t("footer.description")}
            </Typography>
            {socialLinks.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                {socialLinks.map(({ key, label, href, Icon }) => (
                  <IconButton
                    key={key}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    size="small"
                    sx={{
                      color: "inherit",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), border-color 150ms ease, background-color 150ms ease",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.08)" },
                      },
                      "&:active": { transform: "scale(0.94)" },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            )}
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.6 }}>
              {t("footer.navigationTitle")}
            </Typography>
            <Stack spacing={1.5}>
              {FOOTER_LINKS.map((key) => (
                <Typography
                  key={key}
                  component={RouterLink}
                  to={localizedPath(locale, key === "home" ? "/" : `/${key}`)}
                  variant="body2"
                  sx={{ color: "inherit", textDecoration: "none", opacity: 0.85, "&:hover": { opacity: 1 } }}
                >
                  {t(`nav.${key}`)}
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.6 }}>
              {t("footer.contactTitle")}
            </Typography>
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {settingValue("contact.address", "123 Gallery Avenue, Skopje")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {settingValue("contact.phone", "+389 2 123 456")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {settingValue("contact.email", "info@canvasarts.mk")}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.15)" }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" sx={{ opacity: 0.6, cursor: "pointer" }}>
              {t("footer.privacy")}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, cursor: "pointer" }}>
              {t("footer.terms")}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
