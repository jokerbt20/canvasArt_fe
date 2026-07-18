import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FadeInSection } from "../../../components/animations/FadeInSection";
import { useLocale, localizedPath } from "../../../hooks/useLocale";

export function ContactBanner() {
  const { t } = useTranslation("home");
  const { locale } = useLocale();

  return (
    <Container sx={{ py: { xs: 8, md: 10 } }}>
      <FadeInSection>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 5, md: 8 },
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            {t("contactBanner.title")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
            {t("contactBanner.subtitle")}
          </Typography>
          <Button component={RouterLink} to={localizedPath(locale, "/contact")} variant="contained" size="large">
            {t("contactBanner.cta")}
          </Button>
        </Box>
      </FadeInSection>
    </Container>
  );
}
