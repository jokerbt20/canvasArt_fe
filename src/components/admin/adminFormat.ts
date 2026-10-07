import { alpha } from "@mui/material/styles";
import { palette } from "../../theme/palette";
import { EASE_OUT } from "./TableBadges";

/** "07 Oct 2026" in the active locale; "—" when missing. */
export const formatDate = (value: string | undefined, locale: string) =>
  value ? new Date(value).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** "14:32" in the active locale. */
export const formatTime = (value: string, locale: string) =>
  new Date(value).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "3 days ago" / "пред 3 дена" — falls back to "now" under a minute. */
export function formatRelative(value: string, locale: string) {
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "second");
}

/** Filter selects: a set filter gets a gold tint so the active criteria read at a glance. */
export const filterFieldSx = (active: boolean, minWidth: number) => ({
  minWidth,
  "& .MuiOutlinedInput-root": {
    bgcolor: active ? alpha(palette.gold, 0.08) : "transparent",
    transition: "background-color 150ms ease",
    "& fieldset": { borderColor: active ? alpha(palette.gold, 0.6) : undefined, transition: "border-color 150ms ease" },
  },
  "& .MuiInputLabel-root": { color: active ? palette.goldDark : undefined },
});

export type PromoPhase = "live" | "scheduled" | "expired" | "paused";

/**
 * Where a promotion stands. "live" mirrors the server's isCurrentlyActive, so the table
 * never disagrees with what checkout actually applies.
 */
export function promoPhase(
  p: { isActive: boolean; isCurrentlyActive: boolean; startDate: string },
  now = Date.now(),
): PromoPhase {
  if (!p.isActive) return "paused";
  if (p.isCurrentlyActive) return "live";
  return new Date(p.startDate).getTime() > now ? "scheduled" : "expired";
}

/** 0..1 share of the promo window already elapsed (clamped). */
export function promoProgress(p: { startDate: string; endDate: string }, now = Date.now()) {
  const start = new Date(p.startDate).getTime();
  const end = new Date(p.endDate).getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

/**
 * Promo-code state. "live" mirrors the server's isCurrentlyValid (what checkout accepts);
 * the rest explain *why* a code isn't usable. End dates are inclusive calendar days.
 */
export function promoCodePhase(
  c: { isActive: boolean; isCurrentlyValid?: boolean; startsAt: string | null; endsAt: string | null },
  now = Date.now(),
): PromoPhase {
  if (c.isCurrentlyValid) return "live";
  if (!c.isActive) return "paused";
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return "scheduled";
  if (c.endsAt && new Date(c.endsAt).getTime() + 86_400_000 <= now) return "expired";
  // Older APIs don't send isCurrentlyValid: an active code inside its window is live.
  // Otherwise it's an active code whose distributor is switched off.
  return c.isCurrentlyValid === undefined ? "live" : "paused";
}

/** Staggered entrance for dashboard blocks: fade + 8px rise, ~50ms apart. */
export const enterSx = (index: number) => ({
  animation: `dashIn 360ms ${EASE_OUT} both`,
  animationDelay: `${index * 50}ms`,
  "@keyframes dashIn": { from: { opacity: 0, transform: "translateY(8px)" } },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});
