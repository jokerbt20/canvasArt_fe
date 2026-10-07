import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { palette } from "../../theme/palette";
import { resolveMediaUrl } from "../../utils/media";
import { formatPrice } from "../../utils/format";
import { EASE_OUT } from "./TableBadges";
import { formatDate, formatRelative, promoProgress, type PromoPhase } from "./adminFormat";

const PHASE_COLOR: Record<PromoPhase, string> = {
  live: palette.success,
  scheduled: "#3F6E8C",
  expired: palette.textSecondary,
  paused: palette.textSecondary,
};

/** Live / Scheduled / Expired / Paused. Live gets a slow pulse: it is the state shoppers see right now. */
export function PromoPhasePill({ phase }: { phase: PromoPhase }) {
  const { t } = useTranslation("admin");
  const color = PHASE_COLOR[phase];
  const faded = phase === "expired" || phase === "paused";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        height: 24,
        px: 1.1,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color,
        bgcolor: alpha(color, faded ? 0.06 : 0.1),
        boxShadow: `inset 0 0 0 1px ${alpha(color, faded ? 0.14 : 0.24)}`,
        opacity: faded ? 0.85 : 1,
        "& svg": { fontSize: 14 },
      }}
    >
      {phase === "paused" ? (
        <PauseRoundedIcon />
      ) : phase === "scheduled" ? (
        <ScheduleRoundedIcon />
      ) : (
        <Box
          component="span"
          sx={{
            position: "relative",
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: color,
            ...(phase === "live" && {
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                bgcolor: color,
                animation: `promoPulse 1.8s ${EASE_OUT} infinite`,
              },
              "@keyframes promoPulse": {
                from: { transform: "scale(1)", opacity: 0.5 },
                to: { transform: "scale(2.6)", opacity: 0 },
              },
              "@media (prefers-reduced-motion: reduce)": { "&::after": { animation: "none" } },
            }),
          }}
        />
      )}
      {t(`promotionsTable.phase.${phase}`)}
    </Box>
  );
}

/** Start → end dates, a slim progress bar through the window, and a human "ends in 5 days". */
export function PromoPeriodCell({ startDate, endDate, phase }: { startDate: string; endDate: string; phase: PromoPhase }) {
  const { t, i18n } = useTranslation("admin");
  const locale = i18n.language;
  const progress = promoProgress({ startDate, endDate });
  const color = PHASE_COLOR[phase];

  const hint =
    phase === "scheduled"
      ? t("promotionsTable.startsRel", { when: formatRelative(startDate, locale) })
      : phase === "expired"
        ? t("promotionsTable.endedRel", { when: formatRelative(endDate, locale) })
        : phase === "live"
          ? t("promotionsTable.endsRel", { when: formatRelative(endDate, locale) })
          : null;

  return (
    <Box sx={{ minWidth: 190 }}>
      <Typography sx={{ fontSize: 13, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {formatDate(startDate, locale)}
        <Box component="span" sx={{ color: "text.disabled", mx: 0.75 }}>
          →
        </Box>
        {formatDate(endDate, locale)}
      </Typography>
      <Tooltip title={`${Math.round(progress * 100)}%`} placement="bottom-start">
        <Box
          sx={{
            mt: 0.75,
            height: 4,
            width: 150,
            borderRadius: 999,
            bgcolor: alpha(palette.charcoal, 0.07),
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              borderRadius: 999,
              bgcolor: phase === "live" ? color : alpha(color, 0.45),
              transformOrigin: "left",
              transform: `scaleX(${progress})`,
              // Fills once on mount, then retargets smoothly if the data changes.
              transition: `transform 500ms ${EASE_OUT}`,
              animation: `promoFill 600ms ${EASE_OUT}`,
              "@keyframes promoFill": { from: { transform: "scaleX(0)" } },
              "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
            }}
          />
        </Box>
      </Tooltip>
      {hint && (
        <Typography sx={{ fontSize: 11.5, color: phase === "live" ? color : "text.secondary", mt: 0.5, fontWeight: phase === "live" ? 600 : 400 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

/** "−20%" or "−500 ден" as a gold badge. */
export function DiscountPill({ discountType, discountValue }: { discountType: "Percentage" | "FixedAmount"; discountValue: number }) {
  const { i18n } = useTranslation();
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 26,
        px: 1.25,
        borderRadius: 1,
        fontSize: 14,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        color: palette.goldDark,
        bgcolor: alpha(palette.gold, 0.14),
        boxShadow: `inset 0 0 0 1px ${alpha(palette.gold, 0.3)}`,
      }}
    >
      −{discountType === "Percentage" ? `${discountValue}%` : formatPrice(discountValue, i18n.language)}
    </Box>
  );
}

/** Small square thumbnail with a graceful placeholder. */
export function Thumb({ path, size = 34 }: { path: string | null | undefined; size?: number }) {
  const url = resolveMediaUrl(path);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1,
        overflow: "hidden",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: palette.ivoryDeep,
        boxShadow: `inset 0 0 0 1px ${alpha(palette.charcoal, 0.08)}`,
        color: alpha(palette.textSecondary, 0.5),
      }}
    >
      {url ? (
        <Box component="img" src={url} alt="" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <ImageOutlinedIcon sx={{ fontSize: 16 }} />
      )}
    </Box>
  );
}

/** Thumbnail + name + a type label underneath. */
export function TargetCell({ thumb, name, caption }: { thumb: string | null | undefined; name: string; caption?: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0, maxWidth: 260 }}>
      <Thumb path={thumb} />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>
          {name}
        </Typography>
        {caption && (
          <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

