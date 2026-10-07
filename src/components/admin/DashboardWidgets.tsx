import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { palette } from "../../theme/palette";
import { EASE_OUT } from "./TableBadges";
import { enterSx } from "./adminFormat";

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Counts from 0 to `target` once (dashboard load is rare, so a little delight is fine). */
function useCountUp(target: number | undefined, duration = 700) {
  const [value, setValue] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (target === undefined) return;
    if (done.current || reducedMotion()) {
      setValue(target);
      return;
    }
    done.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // strong ease-out
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Hover lift for clickable cards — pointer devices only; press scales down slightly. */
const liftSx = {
  transition: `transform 200ms ${EASE_OUT}, box-shadow 200ms ${EASE_OUT}, border-color 150ms ease`,
  "@media (hover: hover) and (pointer: fine)": {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 10px 30px ${alpha(palette.charcoal, 0.08)}`,
      borderColor: alpha(palette.gold, 0.45),
    },
    "&:hover .card-arrow": { transform: "translateX(3px)", opacity: 1 },
  },
  "&:active": { transform: "scale(0.99)" },
};

/* ------------------------------------------------------------------ */
/* Containers                                                          */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  subtitle,
  action,
  children,
  index = 0,
  sx,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  index?: number;
  sx?: object;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${palette.line}`,
        borderRadius: 2,
        p: { xs: 2.25, md: 2.75 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...enterSx(index),
        ...sx,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 650 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

/** "View all →" link used in panel headers. */
export function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        flexShrink: 0,
        fontSize: 12.5,
        fontWeight: 600,
        color: palette.goldDark,
        textDecoration: "none",
        borderRadius: 0.5,
        "& svg": { fontSize: 15, transition: `transform 160ms ${EASE_OUT}` },
        "@media (hover: hover) and (pointer: fine)": { "&:hover svg": { transform: "translateX(3px)" } },
        "&:active": { opacity: 0.7 },
        "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2 },
      }}
    >
      {children}
      <ArrowForwardRoundedIcon />
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* KPI tile                                                            */
/* ------------------------------------------------------------------ */

export function KpiCard({
  to,
  icon,
  color,
  label,
  value,
  format,
  sub,
  spark,
  index,
}: {
  to: string;
  icon: ReactNode;
  color: string;
  label: string;
  value: number | undefined;
  format: (n: number) => string;
  sub?: ReactNode;
  spark?: number[];
  index: number;
}) {
  const animated = useCountUp(value);
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        position: "relative",
        display: "block",
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        bgcolor: "background.paper",
        border: `1px solid ${palette.line}`,
        borderRadius: 2,
        p: 2.25,
        overflow: "hidden",
        ...liftSx,
        ...enterSx(index),
        "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2 },
        // Soft colour wash in the corner gives each tile its identity.
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "auto -40px -60px auto",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(color, 0.14)}, transparent 70%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: alpha(color, 0.12),
            boxShadow: `inset 0 0 0 1px ${alpha(color, 0.22)}`,
            "& svg": { fontSize: 19 },
          }}
        >
          {icon}
        </Box>
        <ArrowForwardRoundedIcon
          className="card-arrow"
          sx={{ fontSize: 17, color: "text.disabled", opacity: 0.6, transition: `transform 180ms ${EASE_OUT}, opacity 150ms ease` }}
        />
      </Stack>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary", mt: 1.75 }}>{label}</Typography>
      {value === undefined ? (
        <Skeleton width={120} height={38} />
      ) : (
        <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, fontVariantNumeric: "tabular-nums" }}>
          {format(animated)}
        </Typography>
      )}
      <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between", gap: 1, mt: 0.75, minHeight: 26 }}>
        <Box sx={{ fontSize: 12, color: "text.secondary", minWidth: 0 }}>{sub}</Box>
        {spark && spark.length > 1 && <Sparkline values={spark} color={color} />}
      </Stack>
    </Box>
  );
}

/** Trend chip: ▲ 12% (green) / ▼ 8% (red) / — when no baseline. */
export function Delta({ current, previous, suffix }: { current: number; previous: number; suffix?: string }) {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const color = up ? palette.success : palette.error;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        fontSize: 12,
        fontWeight: 700,
        color,
        bgcolor: alpha(color, 0.1),
        px: 0.75,
        py: 0.125,
        borderRadius: 999,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}%{suffix ? <Box component="span" sx={{ fontWeight: 500, ml: 0.5, color: "text.secondary" }}>{suffix}</Box> : null}
    </Box>
  );
}

/** Tiny trend line (no axes) for KPI tiles. Decorative — the number beside it carries the value. */
function Sparkline({ values, color, width = 84, height = 26 }: { values: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => [i * step, height - 2 - (v / max) * (height - 4)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <Box component="svg" width={width} height={height} aria-hidden sx={{ flexShrink: 0, overflow: "visible" }}>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={alpha(color, 0.12)} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue area chart (single series → no legend; title names it)     */
/* ------------------------------------------------------------------ */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export interface DayPoint {
  date: Date;
  value: number;
  orders: number;
}

export function RevenueChart({
  data,
  formatValue,
  formatAxis,
  formatDay,
  ordersLabel,
  height = 220,
}: {
  data: DayPoint[];
  formatValue: (n: number) => string;
  formatAxis: (n: number) => string;
  formatDay: (d: Date) => string;
  ordersLabel: (n: number) => string;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);

  const padL = 44;
  const padR = 8;
  const padT = 10;
  const padB = 24;
  const w = Math.max(0, width - padL - padR);
  const h = height - padT - padB;

  // "Nice" y max so gridlines land on round numbers.
  const rawMax = Math.max(...data.map((d) => d.value), 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const yMax = Math.ceil(rawMax / mag / 2) * 2 * mag;
  const ticks = [0, yMax / 2, yMax];

  const x = (i: number) => padL + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
  const y = (v: number) => padT + h - (v / yMax) * h;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = data.length ? `${line} L${x(data.length - 1)},${padT + h} L${x(0)},${padT + h} Z` : "";

  useLayoutEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [line]);

  const xTickEvery = Math.max(1, Math.round(data.length / 5));
  const hovered = hover !== null ? data[hover] : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))));
  };

  return (
    <Box ref={ref} sx={{ position: "relative", width: "100%", height }}>
      {width > 0 && (
        <svg className="rev-chart" width={width} height={height} role="img" aria-label="Revenue per day" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={palette.gold} stopOpacity={0.28} />
              <stop offset="100%" stopColor={palette.gold} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Recessive grid + y labels */}
          {ticks.map((tv) => (
            <g key={tv}>
              <line x1={padL} x2={padL + w} y1={y(tv)} y2={y(tv)} stroke={palette.line} strokeDasharray={tv ? "3 4" : undefined} />
              <text x={padL - 8} y={y(tv)} dy="0.32em" textAnchor="end" fontSize={11} fill={palette.textSecondary}>
                {formatAxis(tv)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % xTickEvery === 0 || i === data.length - 1 ? (
              <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={11} fill={palette.textSecondary}>
                {formatDay(d.date)}
              </text>
            ) : null,
          )}

          <path d={area} fill="url(#revFill)" style={{ animation: `revFade 700ms ${EASE_OUT} both` }} />
          <path
            ref={pathRef}
            d={line}
            fill="none"
            stroke={palette.goldDark}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            // Draws itself in once on load.
            style={
              len
                ? ({
                    strokeDasharray: len,
                    strokeDashoffset: 0,
                    animation: `revDraw 900ms ${EASE_OUT} both`,
                    "--len": len,
                  } as React.CSSProperties)
                : undefined
            }
          />

          {hovered && hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + h} stroke={alpha(palette.charcoal, 0.25)} strokeDasharray="2 3" />
              <circle cx={x(hover)} cy={y(hovered.value)} r={5} fill={palette.goldDark} stroke="#fff" strokeWidth={2} />
            </g>
          )}

          {/* Hit area larger than the line */}
          <rect
            x={padL}
            y={padT}
            width={w}
            height={h}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            style={{ cursor: "crosshair" }}
          />
        </svg>
      )}

      <style>{`
        @keyframes revDraw { from { stroke-dashoffset: var(--len); } }
        @keyframes revFade { from { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .rev-chart path { animation: none !important; } }
      `}</style>

      {hovered && hover !== null && (
        <Box
          sx={{
            position: "absolute",
            top: Math.max(0, y(hovered.value) - 64),
            left: Math.min(Math.max(x(hover) + 12, 0), Math.max(0, width - 168)),
            width: 156,
            pointerEvents: "none",
            bgcolor: palette.charcoal,
            color: palette.ivory,
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            boxShadow: `0 8px 24px ${alpha(palette.charcoal, 0.25)}`,
            transition: `left 80ms linear, top 80ms linear`,
          }}
        >
          <Typography sx={{ fontSize: 11.5, opacity: 0.7 }}>{formatDay(hovered.date)}</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatValue(hovered.value)}</Typography>
          <Typography sx={{ fontSize: 11.5, opacity: 0.8 }}>{ordersLabel(hovered.orders)}</Typography>
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Part-to-whole bar with labelled legend (secondary encoding)         */
/* ------------------------------------------------------------------ */

export interface StageSlice {
  key: string;
  label: string;
  value: number;
  color: string;
  to: string;
}

export function StageBreakdown({ slices, total }: { slices: StageSlice[]; total: number }) {
  const nonZero = slices.filter((s) => s.value > 0);
  return (
    <Box>
      {/* 2px surface gaps between segments; reveals left→right once via clip-path. */}
      <Stack
        direction="row"
        sx={{
          gap: "2px",
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          bgcolor: alpha(palette.charcoal, 0.05),
          animation: `stageReveal 800ms ${EASE_OUT} both`,
          animationDelay: "150ms",
          "@keyframes stageReveal": { from: { clipPath: "inset(0 100% 0 0)" }, to: { clipPath: "inset(0 0 0 0)" } },
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {nonZero.map((s) => (
          <Tooltip key={s.key} title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`} placement="top" arrow>
            <Box sx={{ flexGrow: s.value, flexBasis: 0, bgcolor: s.color, minWidth: 6, transition: "flex-grow 400ms ease" }} />
          </Tooltip>
        ))}
      </Stack>

      <Stack spacing={0.25} sx={{ mt: 2 }}>
        {slices.map((s) => (
          <Stack
            key={s.key}
            component={RouterLink}
            to={s.to}
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
              px: 1,
              py: 0.9,
              mx: -1,
              borderRadius: 1,
              textDecoration: "none",
              color: "inherit",
              transition: "background-color 120ms ease",
              "@media (hover: hover) and (pointer: fine)": { "&:hover": { bgcolor: alpha(palette.charcoal, 0.035) } },
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: s.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13.5, flex: 1 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {total ? Math.round((s.value / total) * 100) : 0}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Ranked bars (single hue = magnitude)                                */
/* ------------------------------------------------------------------ */

export function RankBars({
  rows,
  formatValue,
}: {
  rows: { key: string | number; label: string; value: number; caption?: string }[];
  formatValue: (n: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Stack spacing={1.5}>
      {rows.map((r, i) => (
        <Box key={r.key}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled", width: 18, fontVariantNumeric: "tabular-nums" }}>{i + 1}</Typography>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, flex: 1, minWidth: 0 }}>
              {r.label}
            </Typography>
            {r.caption && <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>{r.caption}</Typography>}
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{formatValue(r.value)}</Typography>
          </Stack>
          <Box sx={{ ml: "26px", height: 6, borderRadius: 999, bgcolor: alpha(palette.gold, 0.12), overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                borderRadius: 999,
                bgcolor: i === 0 ? palette.goldDark : palette.gold,
                transformOrigin: "left",
                transform: `scaleX(${r.value / max})`,
                transition: `transform 500ms ${EASE_OUT}`,
                animation: `rankGrow 700ms ${EASE_OUT} both`,
                animationDelay: `${150 + i * 60}ms`,
                "@keyframes rankGrow": { from: { transform: "scaleX(0)" } },
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
