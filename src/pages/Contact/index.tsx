import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { PageMeta } from "../../components/common/PageMeta";
import { FadeInSection } from "../../components/animations/FadeInSection";
import { ContactForm } from "../../components/forms/ContactForm";
import { useSettings } from "../../hooks/useContent";

const INFO_ROWS = [
  { key: "address" as const, settingKey: "contact.address", fallback: "123 Gallery Avenue, Skopje", icon: PlaceOutlinedIcon },
  { key: "phone" as const, settingKey: "contact.phone", fallback: "+389 2 123 456", icon: PhoneOutlinedIcon },
  { key: "email" as const, settingKey: "contact.email", fallback: "info@canvasarts.mk", icon: EmailOutlinedIcon },
  { key: "hours" as const, settingKey: "contact.hours", fallback: "Mon–Fri, 9:00–18:00", icon: AccessTimeOutlinedIcon },
];

export default function ContactPage() {
  const { t } = useTranslation("contact");
  const { data: settings } = useSettings("Contact");

  const settingValue = (key: string, fallback: string) =>
    settings?.find((s) => s.key === key)?.value || fallback;

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 12 }}>
      <PageMeta title={t("title")} description={t("subtitle")} />
      <Container>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2">{t("title")}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1.5 }}>
            {t("subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 5 }}>
            <FadeInSection>
              <Stack spacing={3}>
                {INFO_ROWS.map(({ key, settingKey, fallback, icon: Icon }) => (
                  <Stack key={key} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                    <Icon sx={{ color: "primary.main", mt: 0.25 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.25 }}>
                        {t(`info.${key}`)}
                      </Typography>
                      <Typography variant="body1">{settingValue(settingKey, fallback)}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </FadeInSection>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <FadeInSection delay={0.1}>
              <ContactForm />
            </FadeInSection>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
