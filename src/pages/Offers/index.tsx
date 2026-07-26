import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { PageMeta } from "../../components/common/PageMeta";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { FadeInSection } from "../../components/animations/FadeInSection";
import { PriceTag } from "../../components/common/PriceTag";
import { usePromotions, useCombinationPromotions } from "../../hooks/usePromotions";
import { usePaintings, usePainting } from "../../hooks/usePaintings";
import { useFrames } from "../../hooks/useFrames";
import { useCart } from "../../contexts/CartContext";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { SupportedLanguage } from "../../i18n";
import type { CombinationPromotion, Promotion, PaintingListItem, FrameListItem } from "../../types";

function discountLabel(discountType: Promotion["discountType"], discountValue: number, locale: string) {
  return discountType === "Percentage" ? `-${discountValue}%` : `-${formatPrice(discountValue, locale)}`;
}

function applyDiscount(base: number, discountType: Promotion["discountType"], discountValue: number) {
  const result = discountType === "Percentage" ? base * (1 - discountValue / 100) : base - discountValue;
  return Math.max(0, result);
}

function CardImage({
  src,
  alt,
  badge,
  loading,
}: {
  src: string | undefined;
  alt: string;
  badge?: string;
  loading?: boolean;
}) {
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
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(239,233,223,0.55)",
          }}
        >
          <CircularProgress size={24} />
        </Box>
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
  onAddedToCart,
}: {
  promotion: Promotion;
  locale: SupportedLanguage;
  painting?: PaintingListItem;
  frame?: FrameListItem;
  onAddedToCart: () => void;
}) {
  const { t } = useTranslation("offers");
  const { addItem } = useCart();
  const image = resolveMediaUrl(painting?.thumbnailPath ?? frame?.thumbnailPath);
  const badge = discountLabel(promotion.discountType, promotion.discountValue, locale);

  const { data: paintingDetail } = usePainting(painting?.slug);
  const defaultSize =
    paintingDetail?.sizes?.find((s) => s.isDefault && s.isActive) ?? paintingDetail?.sizes?.find((s) => s.isActive);
  const canAddPainting = Boolean(painting && defaultSize);

  const handleAddPainting = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!painting || !defaultSize) return;
    addItem({
      paintingId: painting.id,
      paintingSizeId: defaultSize.id,
      frameId: null,
      quantity: 1,
      paintingName: painting.name,
      paintingSlug: painting.slug,
      thumbnailPath: painting.thumbnailPath,
      sizeLabel: defaultSize.label,
      frameName: null,
      unitPrice: defaultSize.finalPrice,
      unitOriginalPrice: defaultSize.price,
    });
    onAddedToCart();
  };

  const content = (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardImage src={image} alt={promotion.name} badge={badge} />
      <CardContent sx={{ flexGrow: 1 }}>
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
      <Box sx={{ p: 2, pt: 0 }}>
        {painting ? (
          <Button fullWidth variant="contained" disabled={!canAddPainting} onClick={handleAddPainting}>
            {t("card.addToCart")}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to={localizedPath(locale, "/gallery?category=frames")}
          >
            {t("card.shopNow")}
          </Button>
        )}
      </Box>
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
  frame,
  onAddedToCart,
}: {
  promotion: CombinationPromotion;
  locale: SupportedLanguage;
  painting?: PaintingListItem;
  frame?: FrameListItem;
  onAddedToCart: () => void;
}) {
  const { t } = useTranslation("offers");
  const { addItem } = useCart();
  const image = resolveMediaUrl(painting?.thumbnailPath);
  const frameThumbnail = resolveMediaUrl(frame?.thumbnailPath);
  const badge = discountLabel(promotion.discountType, promotion.discountValue, locale);

  const paintingBase = painting?.fromPrice ?? 0;
  const frameBase = frame?.basePrice ?? 0;
  const combinedBase = paintingBase + frameBase;
  const finalPrice = applyDiscount(combinedBase, promotion.discountType, promotion.discountValue);

  const { data: paintingDetail } = usePainting(painting?.slug);
  const defaultPaintingSize =
    paintingDetail?.sizes?.find((s) => s.isDefault && s.isActive) ?? paintingDetail?.sizes?.find((s) => s.isActive);
  const canAdd = Boolean(painting && frame && defaultPaintingSize);

  const handleAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!painting || !frame || !defaultPaintingSize) return;
    addItem({
      paintingId: painting.id,
      paintingSizeId: defaultPaintingSize.id,
      frameId: frame.id,
      quantity: 1,
      paintingName: painting.name,
      paintingSlug: painting.slug,
      thumbnailPath: painting.thumbnailPath,
      sizeLabel: defaultPaintingSize.label,
      frameName: frame.name,
      unitPrice: finalPrice,
      unitOriginalPrice: combinedBase,
    });
    onAddedToCart();
  };

  const content = (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardImage src={image} alt={promotion.name} badge={badge} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {promotion.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
          {frameThumbnail && (
            <Box
              component="img"
              src={frameThumbnail}
              alt={promotion.frameName ?? ""}
              sx={{ width: 32, height: 32, objectFit: "cover", flexShrink: 0, border: "1px solid", borderColor: "divider" }}
            />
          )}
          <Typography variant="body2" color="text.secondary">
            {promotion.paintingName} + {promotion.frameName}
          </Typography>
        </Stack>
        {promotion.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {promotion.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {t("card.paintingBase")}: {formatPrice(paintingBase, locale)} + {t("card.frameBase")}: {formatPrice(frameBase, locale)}
        </Typography>

        <Box sx={{ mt: 1, mb: 1.5 }}>
          <PriceTag price={finalPrice} originalPrice={combinedBase} size="medium" />
        </Box>

        <Typography variant="caption" color="text.secondary">
          {t("card.endsIn", { date: new Date(promotion.endDate).toLocaleDateString(locale) })}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button fullWidth variant="contained" disabled={!canAdd} onClick={handleAdd}>
          {t("card.addToCart")}
        </Button>
      </Box>
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
  const { t } = useTranslation("offers");
  const { locale } = useLocale();
  const [confirmationOpen, setConfirmationOpen] = useState(false);

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
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                    </Grid>
                  ))
                : promotions.map((promotion) => (
                    <Grid key={promotion.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <FadeInSection>
                        <PromotionCard
                          promotion={promotion}
                          locale={locale}
                          painting={promotion.targetPaintingId ? paintingsById.get(promotion.targetPaintingId) : undefined}
                          frame={promotion.targetFrameId ? framesById.get(promotion.targetFrameId) : undefined}
                          onAddedToCart={() => setConfirmationOpen(true)}
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
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                    </Grid>
                  ))
                : bundles.map((promotion) => (
                    <Grid key={promotion.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <FadeInSection>
                        <CombinationPromotionCard
                          promotion={promotion}
                          locale={locale}
                          painting={paintingsById.get(promotion.paintingId)}
                          frame={framesById.get(promotion.frameId)}
                          onAddedToCart={() => setConfirmationOpen(true)}
                        />
                      </FadeInSection>
                    </Grid>
                  ))}
            </Grid>
          </Box>
        )}
      </Container>

      <Snackbar
        open={confirmationOpen}
        autoHideDuration={2800}
        onClose={() => setConfirmationOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setConfirmationOpen(false)}>
          {t("card.addedToCart")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
