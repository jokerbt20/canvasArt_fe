import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useFrame } from "../../hooks/useFrames";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { CompatibleFrame } from "../../types";

interface FrameSelectorProps {
  frames: CompatibleFrame[];
  selectedFrameId: number | null;
  onSelectFrame: (id: number | null) => void;
  selectedFrameSizeId: number | null;
  onSelectFrameSize: (id: number | null) => void;
}

export function FrameSelector({
  frames,
  selectedFrameId,
  onSelectFrame,
  selectedFrameSizeId,
  onSelectFrameSize,
}: FrameSelectorProps) {
  const { t, i18n } = useTranslation("gallery");
  const { data: frameDetail, isLoading: loadingSizes } = useFrame(selectedFrameId ?? undefined);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
        {t("details.frame")}
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Box
          onClick={() => {
            onSelectFrame(null);
            onSelectFrameSize(null);
          }}
          sx={{
            px: 2.5,
            py: 1.5,
            border: "1px solid",
            borderColor: selectedFrameId === null ? "primary.main" : "divider",
            bgcolor: selectedFrameId === null ? "primary.main" : "transparent",
            color: selectedFrameId === null ? "primary.contrastText" : "text.primary",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 200ms ease",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t("details.frameNone")}
          </Typography>
        </Box>
        {frames.map((frame) => {
          const selected = frame.id === selectedFrameId;
          const thumbnailUrl = resolveMediaUrl(frame.thumbnailPath);
          return (
            <Box
              key={frame.id}
              onClick={() => {
                onSelectFrame(frame.id);
                onSelectFrameSize(null);
              }}
              sx={{
                px: 2,
                py: 1.5,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "primary.main" : "transparent",
                color: selected ? "primary.contrastText" : "text.primary",
                cursor: "pointer",
                minWidth: 130,
                textAlign: "center",
                transition: "all 200ms ease",
              }}
            >
              {thumbnailUrl && (
                <Box
                  component="img"
                  src={thumbnailUrl}
                  alt={frame.name}
                  sx={{ width: 32, height: 32, objectFit: "cover", mx: "auto", mb: 0.5 }}
                />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {frame.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
                {frame.material} · {frame.color}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                +{formatPrice(frame.finalPrice, i18n.language)}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {selectedFrameId !== null && (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
            {t("details.frameSize")}
          </Typography>
          {loadingSizes ? (
            <Stack direction="row" spacing={1.5}>
              <Skeleton width={90} height={56} />
              <Skeleton width={90} height={56} />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
              {frameDetail?.sizes.map((size) => {
                const selected = size.id === selectedFrameSizeId;
                return (
                  <Box
                    key={size.id}
                    onClick={() => onSelectFrameSize(size.id)}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      border: "1px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "primary.main" : "transparent",
                      color: selected ? "primary.contrastText" : "text.primary",
                      cursor: size.stock > 0 ? "pointer" : "not-allowed",
                      opacity: size.stock > 0 ? 1 : 0.4,
                      minWidth: 92,
                      textAlign: "center",
                      transition: "all 200ms ease",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {size.label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      +{formatPrice(size.finalPrice, i18n.language)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
