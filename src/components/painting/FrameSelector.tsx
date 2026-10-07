import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatPrice } from "../../utils/format";
import { resolveMediaUrl } from "../../utils/media";
import type { CompatibleFrame } from "../../types";

interface FrameSelectorProps {
  frames: CompatibleFrame[];
  selectedFrameId: number | null;
  onSelectFrame: (id: number | null) => void;
}

export function FrameSelector({ frames, selectedFrameId, onSelectFrame }: FrameSelectorProps) {
  const { t, i18n } = useTranslation("gallery");

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
        {t("details.frame")}
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Box
          onClick={() => onSelectFrame(null)}
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
              onClick={() => onSelectFrame(frame.id)}
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
    </Box>
  );
}
