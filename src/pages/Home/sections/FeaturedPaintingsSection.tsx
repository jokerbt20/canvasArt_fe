import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { SectionHeading } from "../../../components/common/SectionHeading";
import { PaintingCard } from "../../../components/gallery/PaintingCard";
import { useFeaturedPaintings } from "../../../hooks/usePaintings";
import { useLocale, localizedPath } from "../../../hooks/useLocale";

export function FeaturedPaintingsSection() {
  const { t } = useTranslation(["home", "common"]);
  const { locale } = useLocale();
  const { data: result, isLoading } = useFeaturedPaintings();
  const paintings = result?.items;

  if (!isLoading && (!paintings || paintings.length === 0)) return null;

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <SectionHeading
        eyebrow={t("home:featured.eyebrow")}
        title={t("home:featured.title")}
        subtitle={t("home:featured.subtitle")}
      />
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                <Skeleton width="60%" sx={{ mt: 2 }} />
                <Skeleton width="40%" />
              </Grid>
            ))
          : paintings?.slice(0, 8).map((painting, i) => (
              <Grid key={painting.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <PaintingCard painting={painting} index={i} />
              </Grid>
            ))}
      </Grid>
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Button component={RouterLink} to={localizedPath(locale, "/gallery")} variant="outlined" size="large">
          {t("common:actions.viewAll")}
        </Button>
      </Box>
    </Container>
  );
}
