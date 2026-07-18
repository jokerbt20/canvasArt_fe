import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { PageMeta } from "../../components/common/PageMeta";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { FadeInSection } from "../../components/animations/FadeInSection";
import { useTestimonials } from "../../hooks/useTestimonials";
import { resolveMediaUrl } from "../../utils/media";
import type { Testimonial } from "../../types";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const image = resolveMediaUrl(testimonial.imagePath ?? testimonial.thumbnailPath ?? undefined);

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {image && (
        <Box sx={{ aspectRatio: "4 / 3", overflow: "hidden", bgcolor: "#EFE9DF" }}>
          <Box
            component="img"
            src={image}
            alt={testimonial.customerName}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>
      )}
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <Typography variant="subtitle1">{testimonial.customerName}</Typography>
        {testimonial.rating && <Rating value={testimonial.rating} size="small" readOnly />}
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          &ldquo;{testimonial.comment}&rdquo;
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CustomersPage() {
  const { t } = useTranslation("customers");
  const { data: testimonials, isLoading } = useTestimonials();
  const items = testimonials ?? [];

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 12, minHeight: "60vh" }}>
      <PageMeta title={t("title")} description={t("subtitle")} />
      <Container>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2">{t("title")}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1.5 }}>
            {t("subtitle")}
          </Typography>
        </Box>

        {!isLoading && items.length === 0 && <EmptyState title={t("empty")} />}

        {(isLoading || items.length > 0) && (
          <Box>
            <SectionHeading title={t("testimonialsTitle")} align="left" />
            <Grid container spacing={3}>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6 }}>
                      <Skeleton variant="rectangular" height={360} />
                    </Grid>
                  ))
                : items.map((testimonial) => (
                    <Grid key={testimonial.id} size={{ xs: 12, sm: 6 }}>
                      <FadeInSection>
                        <TestimonialCard testimonial={testimonial} />
                      </FadeInSection>
                    </Grid>
                  ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
