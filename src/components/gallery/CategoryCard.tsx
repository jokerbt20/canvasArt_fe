import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, localizedPath } from "../../hooks/useLocale";
import { resolveMediaUrl } from "../../utils/media";
import { usePaintings } from "../../hooks/usePaintings";
import type { Category } from "../../types";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const ROTATE_INTERVAL_MS = 3500;

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const { locale } = useLocale();
  const { data: paintings } = usePaintings({
    categoryId: category.id,
    pageSize: 6,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const images = useMemo(() => {
    const urls = (paintings?.items ?? [])
      .map((p) => resolveMediaUrl(p.thumbnailPath))
      .filter((url): url is string => Boolean(url));
    if (urls.length) return urls;
    const fallback = resolveMediaUrl(category.imagePath);
    return fallback ? [fallback] : [];
  }, [paintings, category.imagePath]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  const imageUrl = images[activeIndex];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Box
        component={RouterLink}
        to={localizedPath(locale, `/gallery?category=${category.id}`)}
        sx={{
          position: "relative",
          display: "block",
          height: { xs: 240, md: 340 },
          overflow: "hidden",
          textDecoration: "none",
          bgcolor: "#EFE9DF",
        }}
      >
        <AnimatePresence mode="sync">
          {imageUrl && (
            <Box
              key={imageUrl}
              component={motion.img}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              src={imageUrl}
              alt={category.name}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 700ms ease",
                "&:hover": { transform: "scale(1.06)" },
              }}
            />
          )}
        </AnimatePresence>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(21,19,15,0) 40%, rgba(21,19,15,0.65) 100%)",
          }}
        />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, p: 3 }}>
          <Typography variant="h5" sx={{ color: "#F7F4EF" }}>
            {category.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(247,244,239,0.8)" }}>
            {category.paintingCount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
