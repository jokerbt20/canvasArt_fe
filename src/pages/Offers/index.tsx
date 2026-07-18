import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { PageMeta } from "../../components/common/PageMeta";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { FadeInSection } from "../../components/animations/FadeInSection";
import { usePromotions, useCombinationPromotions } from "../../hooks/usePromotions";
import { usePaintings } from "../../hooks/usePaintings";
import { useFrames } from "../../hooks/useFrames";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { CombinationPromotion, Promotion, PaintingListItem, FrameListItem } from "../../types";

function discountLabel(discountType: Promotion["discountType"], discountValue: number, locale: string) {
  return discountType === "Percentage" ? `-${discountValue}%` : `-${formatPrice(discountValue, locale)}`;
}

function CardImage({ src, alt, badge }: { src: string | undefined; alt: string; badge?: string }) {
  return (
    <Box sx={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", bgcolor: "#EFE9DF" }}>
      {src && (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {badge && (
        <Chip
          label={badge}
          color="primary"
          size="small"
          sx={{ position: "absolute", top: 12, left: 12, fontWeight: 700 }}
        />
      )}
    </Box>
  );
}

function PromotionCard({
  promotion,
  locale,
  painting,
  frame,
}: {
  promotion: Promotion;
  locale: string;
  painting?: PaintingListItem;
  frame?: FrameListItem;
}) {
  const { t } = useTranslation("offers");
  const image = resolveMediaUrl(painting?.thumbnailPath ?? frame?.thumbnailPath);
  const badge = discountLabel(promotion.discountType, promotion.discountValue, locale);

  const content = (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardImage src={image} alt={promotion.name} badge={badge} />
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {promotion.name}
        </Typography>
        {promotion.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {promotion.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {t("card.endsIn", { date: new Date(promotion.endDate).toLocaleDateString(locale) })}
        </Typography>
      </CardContent>
    </Card>
  );

  if (painting) {
    return (
      <Box component={RouterLink} to={localizedPath(locale, `/gallery/${painting.slug}`)} sx={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {content}
      </Box>
    );
  }
  return content;
}

function CombinationPromotionCard({
  promotion,
  locale,
  painting,
}: {
  promotion: CombinationPromotion;
  locale: string;
  painting?: PaintingListItem;
}) {
  const { t } = useTranslation("offers");
  const image = resolveMediaUrl(painting?.thumbnailPath);
  const badge = discountLabel(promotion.discountType, promotion.discountValue, locale);

  const content = (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardImage src={image} alt={promotion.name} badge={badge} />
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {promotion.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {promotion.paintingName} + {promotion.frameName}
        </Typography>
        {promotion.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {promotion.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {t("card.endsIn", { date: new Date(promotion.endDate).toLocaleDateString(locale) })}
        </Typography>
      </CardContent>
    </Card>
  );

  if (painting) {
    return (
      <Box component={RouterLink} to={localizedPath(locale, `/gallery/${painting.slug}`)} sx={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {content}
      </Box>
    );
  }
  return content;
}

export default function OffersPage() {
  const { t, i18n } = useTranslation("offers");
  const { locale } = useLocale();
  const displayLocale = i18n.language;

  const { data: promotionsResult, isLoading: loadingPromotions } = usePromotions({
    page: 1,
    pageSize: 50,
    onlyCurrentlyActive: true,
  });
  const { data: bundlesResult, isLoading: loadingBundles } = useCombinationPromotions({
    page: 1,
    pageSize: 50,
    onlyCurrentlyActive: true,
  });
  const { data: paintingsResult } = usePaintings({ page: 1, pageSize: 100, isPublished: true });
  const { data: framesResult } = useFrames({ page: 1, pageSize: 100, isActive: true });

  const promotions = promotionsResult?.items ?? [];
  const bundles = bundlesResult?.items ?? [];
  const paintingsById = new Map((paintingsResult?.items ?? []).map((p) => [p.id, p]));
  const framesById = new Map((framesResult?.items ?? []).map((f) => [f.id, f]));

  const isLoading = loadingPromotions || loadingBundles;
  const isEmpty = !isLoading && promotions.length === 0 && bundles.length === 0;

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

        {isEmpty && <EmptyState title={t("empty")} />}

        {(isLoading || promotions.length > 0) && (
          <Box sx={{ mb: 10 }}>
            <SectionHeading title={t("sections.individual")} align="left" />
            <Grid container spacing={3}>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                    </Grid>
                  ))
                : promotions.map((promotion) => (
                    <Grid key={promotion.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <FadeInSection>
                        <PromotionCard
                          promotion={promotion}
                          locale={displayLocale}
                          painting={promotion.targetPaintingId ? paintingsById.get(promotion.targetPaintingId) : undefined}
                          frame={promotion.targetFrameId ? framesById.get(promotion.targetFrameId) : undefined}
                        />
                      </FadeInSection>
                    </Grid>
                  ))}
            </Grid>
          </Box>
        )}

        {(isLoading || bundles.length > 0) && (
          <Box>
            <SectionHeading title={t("sections.bundles")} align="left" />
            <Grid container spacing={3}>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                    </Grid>
                  ))
                : bundles.map((promotion) => (
                    <Grid key={promotion.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <FadeInSection>
                        <CombinationPromotionCard
                          promotion={promotion}
                          locale={displayLocale}
                          painting={paintingsById.get(promotion.paintingId)}
                        />
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
