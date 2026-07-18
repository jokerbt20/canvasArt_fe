import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { motion } from "framer-motion";
import { PageMeta } from "../../components/common/PageMeta";
import { useLocale, localizedPath } from "../../hooks/useLocale";

export default function OrderSuccessPage() {
  const { t } = useTranslation("cart");
  const { locale } = useLocale();
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <PageMeta title={t("success.title")} />
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 72, color: "success.main", mb: 3 }} />
        </motion.div>
        <Typography variant="h2" sx={{ mb: 2 }}>
          {t("success.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          {t("success.subtitle", { orderNumber })}
        </Typography>
        <Button component={RouterLink} to={localizedPath(locale, "/gallery")} variant="contained" size="large">
          {t("success.cta")}
        </Button>
      </Container>
    </Box>
  );
}
