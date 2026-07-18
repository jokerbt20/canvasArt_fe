import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useLocale, localizedPath } from "../hooks/useLocale";

export function NotFoundPage() {
  const { t } = useTranslation("common");
  const { locale } = useLocale();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", px: 3 }}>
      <Typography variant="h1" sx={{ fontSize: "6rem" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 4 }}>
        {t("status.notFound")}
      </Typography>
      <Button component={RouterLink} to={localizedPath(locale, "/")} variant="contained">
        {t("nav.home")}
      </Button>
    </Box>
  );
}
