import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import { palette } from "../../theme/palette";

/** Shared easing for admin micro-interactions: strong ease-out, quick to respond. */
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type Tone = "success" | "neutral" | "gold" | "danger";

const TONES: Record<Tone, { fg: string; bg: string; ring: string }> = {
  success: { fg: palette.success, bg: alpha(palette.success, 0.1), ring: alpha(palette.success, 0.22) },
  neutral: { fg: palette.textSecondary, bg: alpha(palette.textSecondary, 0.07), ring: alpha(palette.textSecondary, 0.16) },
  gold: { fg: palette.goldDark, bg: alpha(palette.gold, 0.14), ring: alpha(palette.gold, 0.32) },
  danger: { fg: palette.error, bg: alpha(palette.error, 0.09), ring: alpha(palette.error, 0.22) },
};

interface PillProps {
  tone?: Tone;
  icon?: ReactNode;
  /** Leading status dot instead of an icon. */
  dot?: boolean;
  children: ReactNode;
  tooltip?: ReactNode;
}

/** Compact status pill: soft tinted fill + hairline ring, tabular numerals. */
export function Pill({ tone = "neutral", icon, dot, children, tooltip }: PillProps) {
  const c = TONES[tone];
  const pill = (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 22,
        px: 1,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        color: c.fg,
        bgcolor: c.bg,
        boxShadow: `inset 0 0 0 1px ${c.ring}`,
        "& svg": { fontSize: 14 },
      }}
    >
      {dot && <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: c.fg, flexShrink: 0 }} />}
      {icon}
      {children}
    </Box>
  );
  return tooltip ? (
    <Tooltip title={tooltip} placement="top" arrow>
      {pill}
    </Tooltip>
  ) : (
    pill
  );
}

/** Icon + number metric used in dense table cells; dims itself when the value is zero. */
export function Metric({ icon, value, tooltip, warnWhenZero }: { icon: ReactNode; value: number | undefined; tooltip: ReactNode; warnWhenZero?: boolean }) {
  const empty = !value;
  const color = empty ? (warnWhenZero ? palette.error : alpha(palette.textSecondary, 0.45)) : palette.textPrimary;
  return (
    <Tooltip title={tooltip} placement="top" arrow>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          minWidth: 36,
          fontSize: 13,
          fontWeight: empty ? 500 : 600,
          fontVariantNumeric: "tabular-nums",
          color,
          "& svg": { fontSize: 16, color: empty ? color : alpha(palette.textSecondary, 0.7) },
        }}
      >
        {icon}
        {value ?? "—"}
      </Box>
    </Tooltip>
  );
}

/** Deterministic, muted tint per name so the same person/partner always gets the same colour. */
const AVATAR_TINTS = [palette.gold, "#5B6B8C", "#2F7F86", "#7A5BA6", palette.success, "#B4691F"];
function avatarTint(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** Initials in a soft tinted circle. */
export function InitialsAvatar({ name, size = 30, muted }: { name: string; size?: number; muted?: boolean }) {
  const tint = muted ? palette.textSecondary : avatarTint(name);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: tint,
        bgcolor: alpha(tint, 0.12),
        boxShadow: `inset 0 0 0 1px ${alpha(tint, 0.25)}`,
        transition: "color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      {initials(name)}
    </Box>
  );
}
