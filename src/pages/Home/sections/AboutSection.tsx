import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FadeInSection } from "../../../components/animations/FadeInSection";
import { useLocale, localizedPath } from "../../../hooks/useLocale";

export function AboutSection() {
  const { t } = useTranslation("home");
  const { locale } = useLocale();

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Grid container spacing={{ xs: 4, md: 10 }} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FadeInSection>
            <Box sx={{ aspectRatio: "6 / 5", bgcolor: "#EFE9DF" }} />
          </FadeInSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FadeInSection delay={0.1}>
            <Typography variant="overline" color="primary.dark" sx={{ display: "block", mb: 1.5 }}>
              {t("about.eyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 3 }}>
              {t("about.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t("about.body")}
            </Typography>
            <Button component={RouterLink} to={localizedPath(locale, "/customers")} variant="text" size="large">
              {t("about.cta")}
            </Button>
          </FadeInSection>
        </Grid>
      </Grid>
    </Container>
  );
}
