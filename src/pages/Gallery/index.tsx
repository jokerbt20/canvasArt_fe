import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import { PageMeta } from "../../components/common/PageMeta";
import { EmptyState } from "../../components/common/EmptyState";
import { PaintingCard } from "../../components/gallery/PaintingCard";
import { FrameCard } from "../../components/gallery/FrameCard";
import { usePaintings } from "../../hooks/usePaintings";
import { useFrames } from "../../hooks/useFrames";
import { useCategories } from "../../hooks/useCategories";
import type { PaintingQuery } from "../../types";

const PAGE_SIZE = 12;
const FRAMES_FILTER_VALUE = "frames";

type SortOption = "newest" | "priceAsc" | "priceDesc";

const SORT_MAP: Record<SortOption, { sortBy: string; sortDir: "asc" | "desc" }> = {
  newest: { sortBy: "createdAt", sortDir: "desc" },
  priceAsc: { sortBy: "price", sortDir: "asc" },
  priceDesc: { sortBy: "price", sortDir: "desc" },
};

export default function GalleryPage() {
  const { t } = useTranslation("gallery");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const sortOption = (searchParams.get("sort") as SortOption) ?? "newest";
  const categoryParam = searchParams.get("category");
  const isFramesView = categoryParam === FRAMES_FILTER_VALUE;
  const categoryId = !isFramesView ? categoryParam : null;

  const query: PaintingQuery = useMemo(
    () => ({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: PAGE_SIZE,
      search: searchParams.get("search") ?? undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      isPublished: true,
      ...SORT_MAP[sortOption],
    }),
    [searchParams, categoryId, sortOption],
  );

  const frameQuery = useMemo(
    () => ({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: PAGE_SIZE,
      search: searchParams.get("search") ?? undefined,
      isActive: true,
      ...SORT_MAP[sortOption],
    }),
    [searchParams, sortOption],
  );

  const { data: paintingsData, isLoading: paintingsLoading, isFetching: paintingsFetching } = usePaintings(query, {
    enabled: !isFramesView,
  });
  const { data: framesData, isLoading: framesLoading, isFetching: framesFetching } = useFrames(frameQuery, {
    enabled: isFramesView,
  });
  const { data: categories } = useCategories();

  const data = isFramesView ? framesData : paintingsData;
  const isLoading = isFramesView ? framesLoading : paintingsLoading;
  const isFetching = isFramesView ? framesFetching : paintingsFetching;

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput || undefined);
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    updateParam("sort", e.target.value);
  };

  const handlePageChange = (_: unknown, page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ pt: { xs: 14, md: 18 }, pb: 10 }}>
      <PageMeta title={t("title")} description={t("subtitle")} />
      <Container>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="h2">{t("title")}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1.5 }}>
            {t("subtitle")}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 4 }}
        >
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: "100%", md: 340 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("search.placeholder") ?? ""}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Select
              size="small"
              value={categoryParam ?? ""}
              onChange={(e) => updateParam("category", e.target.value || undefined)}
              displayEmpty
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">{t("filters.allCategories")}</MenuItem>
              {categories?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
              <MenuItem value={FRAMES_FILTER_VALUE}>{t("filters.frames")}</MenuItem>
            </Select>

            <Select size="small" value={sortOption} onChange={handleSortChange} sx={{ minWidth: 180 }}>
              <MenuItem value="newest">{t("sort.newest")}</MenuItem>
              <MenuItem value="priceAsc">{t("sort.priceAsc")}</MenuItem>
              <MenuItem value="priceDesc">{t("sort.priceDesc")}</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {!isLoading && data && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t(isFramesView ? "results.countFrames" : "results.count", { count: data.totalCount })}
          </Typography>
        )}

        {isLoading ? (
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5" }} />
                <Skeleton width="60%" sx={{ mt: 2 }} />
                <Skeleton width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : data && data.items.length > 0 ? (
          <>
            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 200ms ease" }}>
              {isFramesView
                ? framesData!.items.map((frame, i) => (
                    <Grid key={frame.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <FrameCard frame={frame} index={i % 8} />
                    </Grid>
                  ))
                : paintingsData!.items.map((painting, i) => (
                    <Grid key={painting.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <PaintingCard painting={painting} index={i % 8} />
                    </Grid>
                  ))}
            </Grid>

            {data.totalPages > 1 && (
              <Stack sx={{ alignItems: "center", mt: 8 }}>
                <Pagination
                  count={data.totalPages}
                  page={data.page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            )}
          </>
        ) : (
          <EmptyState title={t(isFramesView ? "results.emptyFrames" : "results.empty")} />
        )}
      </Container>
    </Box>
  );
}
