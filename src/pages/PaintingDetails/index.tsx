import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { PageMeta } from "../../components/common/PageMeta";
import { PriceTag } from "../../components/common/PriceTag";
import { ImageViewer } from "../../components/painting/ImageViewer";
import { SizeSelector } from "../../components/painting/SizeSelector";
import { FrameSelector } from "../../components/painting/FrameSelector";
import { usePainting } from "../../hooks/usePaintings";
import { useCart } from "../../contexts/CartContext";
import { calculateDiscountPercent } from "../../utils/format";

export default function PaintingDetailsPage() {
  const { t } = useTranslation("gallery");
  const { slug } = useParams<{ slug: string }>();
  const { data: painting, isLoading } = usePainting(slug);
  const { addItem } = useCart();

  const [sizeId, setSizeId] = useState<number | null>(null);
  const [frameId, setFrameId] = useState<number | null>(null);
  const [frameSizeId, setFrameSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (painting?.sizes?.length) {
      const defaultSize = painting.sizes.find((s) => s.isDefault) ?? painting.sizes[0];
      setSizeId(defaultSize.id);
      setFrameId(null);
      setFrameSizeId(null);
      setQuantity(1);
    }
  }, [painting?.id]);

  const selectedSize = painting?.sizes.find((s) => s.id === sizeId);
  const selectedFrame = painting?.compatibleFrames.find((f) => f.id === frameId);

  const estimatedUnitPrice = useMemo(() => {
    if (!selectedSize) return 0;
    return selectedSize.finalPrice + (selectedFrame?.finalPrice ?? 0);
  }, [selectedSize, selectedFrame]);

  const estimatedOriginalPrice = useMemo(() => {
    if (!selectedSize) return undefined;
    const originalBase = selectedSize.price + (selectedFrame?.basePrice ?? 0);
    return originalBase > estimatedUnitPrice ? originalBase : undefined;
  }, [selectedSize, selectedFrame, estimatedUnitPrice]);

  const canAddToCart = Boolean(selectedSize) && (frameId === null || frameSizeId !== null);

  const handleAddToCart = () => {
    if (!painting || !selectedSize) return;
    addItem({
      paintingId: painting.id,
      paintingSizeId: selectedSize.id,
      frameId,
      frameSizeId,
      quantity,
      paintingName: painting.name,
      paintingSlug: painting.slug,
      thumbnailPath: painting.images[0]?.thumbnailPath ?? null,
      sizeLabel: selectedSize.label,
      frameName: selectedFrame?.name ?? null,
      frameSizeLabel: null,
    });
    setConfirmationOpen(true);
  };

  if (isLoading) {
    return (
      <Container sx={{ pt: { xs: 14, md: 18 }, pb: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton width="70%" height={48} />
            <Skeleton width="40%" />
            <Skeleton height={120} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!painting) return null;

  const discountPercent =
    estimatedOriginalPrice && estimatedOriginalPrice > estimatedUnitPrice
      ? calculateDiscountPercent(estimatedOriginalPrice, estimatedUnitPrice)
      : 0;

  const soldOut = painting.sizes.every((s) => s.stock <= 0);

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 12 }}>
      <PageMeta title={painting.name} description={painting.description ?? undefined} />
      <Container>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ImageViewer images={painting.images} alt={painting.name} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" color="text.secondary">
              {painting.categoryName}
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, mb: 2 }}>
              {painting.name}
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
              <PriceTag price={estimatedUnitPrice} originalPrice={estimatedOriginalPrice} size="large" />
              {discountPercent > 0 && (
                <Chip size="small" color="error" label={t("details.discount", { percent: discountPercent })} />
              )}
            </Stack>

            {painting.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {painting.description}
              </Typography>
            )}

            <Stack spacing={3}>
              {painting.sizes.length > 0 && (
                <SizeSelector sizes={painting.sizes} selectedId={sizeId} onSelect={setSizeId} />
              )}
              {painting.compatibleFrames.length > 0 && (
                <FrameSelector
                  frames={painting.compatibleFrames}
                  selectedFrameId={frameId}
                  onSelectFrame={setFrameId}
                  selectedFrameSizeId={frameSizeId}
                  onSelectFrameSize={setFrameSizeId}
                />
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
                  {t("details.quantity")}
                </Typography>
                <Stack direction="row" sx={{ alignItems: "center", border: "1px solid", borderColor: "divider", width: "fit-content" }}>
                  <IconButton size="small" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ width: 40, textAlign: "center" }}>{quantity}</Typography>
                  <IconButton size="small" onClick={() => setQuantity((q) => q + 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>

            <Button
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 4 }}
              disabled={soldOut || !canAddToCart}
              onClick={handleAddToCart}
            >
              {soldOut ? t("badges.soldOut") : t("details.addToCart")}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              {t("details.shippingInfo")}
            </Typography>

            {painting.tags.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 4 }}>
                {painting.tags.map((tag) => (
                  <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={confirmationOpen} autoHideDuration={2800} onClose={() => setConfirmationOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setConfirmationOpen(false)}>
          {t("details.addedToCart")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
