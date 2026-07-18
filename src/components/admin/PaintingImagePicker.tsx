import { useQueries } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { queryKeys } from "../../api/queryKeys";
import { paintingService } from "../../services/paintingService";
import { useManagePaintings } from "../../hooks/usePaintings";
import { resolveMediaUrl } from "../../utils/media";
import type { PaintingDetail, PaintingImage } from "../../types";

interface PaintingImagePickerProps {
  selectedIds: number[];
  onToggle: (painting: PaintingDetail, image: PaintingImage) => void;
}

export function PaintingImagePicker({ selectedIds, onToggle }: PaintingImagePickerProps) {
  const { data: paintings, isLoading: isLoadingList } = useManagePaintings({ page: 1, pageSize: 200 });

  const detailQueries = useQueries({
    queries: (paintings?.items ?? []).map((p) => ({
      queryKey: queryKeys.paintings.manageById(p.id),
      queryFn: () => paintingService.manageById(p.id),
    })),
  });

  const isLoading = isLoadingList || detailQueries.some((q) => q.isLoading);

  const entries: { painting: PaintingDetail; image: PaintingImage }[] = [];
  for (const q of detailQueries) {
    if (!q.data) continue;
    for (const image of q.data.images) {
      entries.push({ painting: q.data, image });
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        No painting images have been uploaded yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {entries.map(({ painting, image }) => {
        const url = resolveMediaUrl(image.resizedPath) ?? resolveMediaUrl(image.thumbnailPath);
        const selected = selectedIds.includes(image.id);
        return (
          <Box key={image.id} sx={{ width: 108 }}>
            <Box
              onClick={() => onToggle(painting, image)}
              sx={{
                position: "relative",
                width: 108,
                height: 108,
                cursor: "pointer",
                border: "3px solid",
                borderColor: selected ? "primary.main" : "transparent",
                outline: "1px solid",
                outlineColor: "divider",
                transition: "border-color 150ms ease",
              }}
            >
              <Box component="img" src={url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {selected && (
                <CheckCircleIcon
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    color: "primary.main",
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                    fontSize: 20,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {painting.name}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
