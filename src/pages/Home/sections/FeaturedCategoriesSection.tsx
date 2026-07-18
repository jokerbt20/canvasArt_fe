import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { SectionHeading } from "../../../components/common/SectionHeading";
import { CategoryCard } from "../../../components/gallery/CategoryCard";
import { useCategories } from "../../../hooks/useCategories";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FeaturedCategoriesSection() {
  const { t } = useTranslation("home");
  const { data: categories, isLoading } = useCategories();
  const shuffled = useMemo(() => (categories ? shuffle(categories) : []), [categories]);

  if (!isLoading && (!categories || categories.length === 0)) return null;

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <SectionHeading
        eyebrow={t("categories.eyebrow")}
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
      />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, md: 3 }}>
                <Skeleton variant="rectangular" height={280} />
              </Grid>
            ))
          : shuffled.slice(0, 4).map((category, i) => (
              <Grid key={category.id} size={{ xs: 6, md: 3 }}>
                <CategoryCard category={category} index={i} />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
}
