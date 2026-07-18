import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { AnimatePresence, motion } from "framer-motion";
import { useActiveSlides } from "../../../hooks/useContent";
import { useLocale, localizedPath } from "../../../hooks/useLocale";
import { resolveMediaUrl } from "../../../utils/media";

const AUTOPLAY_MS = 6500;

export function HeroSlideshow() {
  const { t } = useTranslation("home");
  const { locale } = useLocale();
  const { data: slides } = useActiveSlides();
  const [active, setActive] = useState(0);

  const hasSlides = Boolean(slides && slides.length > 0);

  useEffect(() => {
    if (!hasSlides) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % (slides?.length ?? 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hasSlides, slides?.length]);

  const slide = hasSlides ? slides?.[active] : undefined;
  const slideImageUrl = resolveMediaUrl(slide?.imagePath);

  return (
    <Box sx={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden", bgcolor: "secondary.main" }}>
      <AnimatePresence mode="sync">
        {slideImageUrl && (
          <motion.div
            key={slide?.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Box
              component="img"
              src={slideImageUrl}
              alt={slide?.title ?? ""}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(21,19,15,0.35) 0%, rgba(21,19,15,0.55) 100%)" }} />

      <Stack
        sx={{ position: "relative", height: "100%", px: { xs: 3, md: 10 }, justifyContent: "center", maxWidth: 780 }}
        spacing={3}
      >
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <Typography variant="overline" sx={{ color: "primary.light" }}>
            {t("hero.eyebrow")}
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.9 }}>
          <Typography variant="h1" sx={{ color: "#F7F4EF" }}>
            {slide?.title ?? `${t("hero.titleLine1")} ${t("hero.titleLine2")}`}
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}>
          <Typography variant="subtitle1" sx={{ color: "rgba(247,244,239,0.85)", maxWidth: 520 }}>
            {slide?.subtitle ?? t("hero.subtitle")}
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.9 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
            <Button
              component={RouterLink}
              to={localizedPath(locale, slide?.linkUrl ?? "/gallery")}
              variant="contained"
              size="large"
              color="primary"
            >
              {slide?.buttonText ?? t("hero.ctaPrimary")}
            </Button>
            <Button
              component={RouterLink}
              to={localizedPath(locale, "/offers")}
              variant="outlined"
              size="large"
              sx={{ color: "#F7F4EF", borderColor: "rgba(247,244,239,0.5)" }}
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Stack>
        </motion.div>
      </Stack>

      {hasSlides && slides && slides.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ position: "absolute", bottom: 32, left: { xs: 24, md: 80 } }}>
          {slides.map((s, i) => (
            <Box
              key={s.id}
              onClick={() => setActive(i)}
              sx={{
                width: i === active ? 32 : 10,
                height: 3,
                bgcolor: i === active ? "primary.main" : "rgba(247,244,239,0.4)",
                cursor: "pointer",
                transition: "width 300ms ease",
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
