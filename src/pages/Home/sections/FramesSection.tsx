import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { FadeInSection } from "../../../components/animations/FadeInSection";
import { useFrames } from "../../../hooks/useFrames";
import { useLocale, localizedPath } from "../../../hooks/useLocale";
import { resolveMediaUrl } from "../../../utils/media";

export function FramesSection() {
  const { t } = useTranslation("home");
  const { locale } = useLocale();
  const { data: result, isLoading } = useFrames({ page: 1, pageSize: 4, isActive: true });
  const frames = result?.items;

  if (!isLoading && (!frames || frames.length === 0)) return null;

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <FadeInSection>
            <Typography variant="overline" color="primary.dark" sx={{ display: "block", mb: 1.5 }}>
              {t("frames.eyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {t("frames.title")}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              {t("frames.subtitle")}
            </Typography>
            <Button component={RouterLink} to={localizedPath(locale, "/gallery")} variant="outlined" size="large">
              {t("frames.cta")}
            </Button>
          </FadeInSection>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={6}>
                    <Skeleton variant="rectangular" height={180} />
                  </Grid>
                ))
              : frames?.slice(0, 4).map((frame, i) => (
                  <Grid key={frame.id} size={6}>
                    <FadeInSection delay={i * 0.06}>
                      <Box sx={{ width: "50%", mx: "auto" }}>
                        <Box sx={{ aspectRatio: "1 / 1", bgcolor: "#EFE9DF", overflow: "hidden" }}>
                          {resolveMediaUrl(frame.thumbnailPath) && (
                            <Box
                              component="img"
                              src={resolveMediaUrl(frame.thumbnailPath)}
                              alt={frame.name}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {frame.name}
                        </Typography>
                      </Box>
                    </FadeInSection>
                  </Grid>
                ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
