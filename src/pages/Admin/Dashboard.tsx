import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { PageMeta } from "../../components/common/PageMeta";
import { EASE_OUT, InitialsAvatar } from "../../components/admin/TableBadges";
import { StatusDot } from "../../components/admin/OrderStatusSelect";
import { enterSx, formatRelative, promoPhase } from "../../components/admin/adminFormat";
import {
  Delta,
  KpiCard,
  Panel,
  PanelLink,
  RankBars,
  RevenueChart,
  StageBreakdown,
  type DayPoint,
  type StageSlice,
} from "../../components/admin/DashboardWidgets";
import { useOrderStats, useOrders } from "../../hooks/useOrders";
import { useDistributorDashboard } from "../../hooks/useDistributors";
import { useCombinationPromotions, usePromotions } from "../../hooks/usePromotions";
import { useManagePaintings } from "../../hooks/usePaintings";
import { formatPrice } from "../../utils/format";
import { palette } from "../../theme/palette";

const DAY = 86_400_000;
const WINDOW_DAYS = 30;

/** Validated categorical slots (dataviz reference palette) for the four order stages. */
const STAGE_COLORS = { pending: "#eda100", progress: "#2a78d6", delivered: "#1baf7a", cancelled: "#e34948" };

/** KPI identity colours (decorative icon tiles, not chart series). */
const KPI = { revenue: palette.goldDark, orders: "#2a78d6", aov: "#1baf7a", promos: "#eb6834" };

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation("admin");
  const locale = i18n.language;
  const navigate = useNavigate();
  // Frozen at mount so render stays pure; the dashboard refetches on revisit anyway.
  const [now] = useState(() => Date.now());
  const money = (n: number) => formatPrice(n, locale);
  const compactMoney = (n: number) =>
    new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

  // Two windows (current 30d + previous 30d) for trend + comparison.
  const today = startOfDay(new Date());
  const windowStart = new Date(today.getTime() - (WINDOW_DAYS - 1) * DAY);
  const prevStart = new Date(windowStart.getTime() - WINDOW_DAYS * DAY);

  const { data: stats } = useOrderStats();
  const { data: windowOrders } = useOrders({
    page: 1,
    pageSize: 100,
    fromDate: prevStart.toISOString(),
    sortBy: "created",
    sortDir: "desc",
  });
  const { data: recent } = useOrders({ page: 1, pageSize: 6, sortBy: "created", sortDir: "desc" });
  const { data: distributors } = useDistributorDashboard({ fromDate: windowStart.toISOString() });
  const { data: promotions } = usePromotions({ page: 1, pageSize: 100 });
  const { data: bundles } = useCombinationPromotions({ page: 1, pageSize: 100 });
  const { data: allPaintings } = useManagePaintings({ page: 1, pageSize: 1 });
  const { data: draftPaintings } = useManagePaintings({ page: 1, pageSize: 1, isPublished: false });

  // ---- derived numbers ----
  const derived = useMemo(() => {
    if (!windowOrders) return undefined;
    const days: DayPoint[] = Array.from({ length: WINDOW_DAYS }, (_, i) => ({
      date: new Date(windowStart.getTime() + i * DAY),
      value: 0,
      orders: 0,
    }));
    let current = 0;
    let previous = 0;
    let currentCount = 0;
    let previousCount = 0;
    let weekCount = 0;
    const weekStart = today.getTime() - 6 * DAY;
    for (const o of windowOrders.items) {
      if (o.status === "Cancelled") continue;
      const ts = new Date(o.createdAt).getTime();
      if (ts >= windowStart.getTime()) {
        const idx = Math.floor((startOfDay(new Date(ts)).getTime() - windowStart.getTime()) / DAY);
        if (days[idx]) {
          days[idx].value += o.grandTotal;
          days[idx].orders += 1;
        }
        current += o.grandTotal;
        currentCount += 1;
        if (ts >= weekStart) weekCount += 1;
      } else {
        previous += o.grandTotal;
        previousCount += 1;
      }
    }
    return {
      days,
      current,
      previous,
      currentCount,
      previousCount,
      weekCount,
      aov: currentCount ? current / currentCount : 0,
      prevAov: previousCount ? previous / previousCount : 0,
      // The list is capped at 100; flag when the window may be incomplete.
      truncated: windowOrders.totalCount > windowOrders.items.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowOrders]);

  const allPromos = [...(promotions?.items ?? []), ...(bundles?.items ?? [])];
  const livePromos = allPromos.filter((p) => promoPhase(p) === "live");
  const endingSoon = livePromos.filter((p) => new Date(p.endDate).getTime() - now < 7 * DAY);

  const progress = stats ? Math.max(0, stats.total - stats.pending - stats.delivered - stats.cancelled) : 0;
  const stages: StageSlice[] = stats
    ? [
        { key: "pending", label: t("orders.status.pending"), value: stats.pending, color: STAGE_COLORS.pending, to: "/admin/orders" },
        { key: "progress", label: t("dashboard.inProgress"), value: progress, color: STAGE_COLORS.progress, to: "/admin/orders" },
        { key: "delivered", label: t("orders.status.delivered"), value: stats.delivered, color: STAGE_COLORS.delivered, to: "/admin/orders" },
        { key: "cancelled", label: t("orders.status.cancelled"), value: stats.cancelled, color: STAGE_COLORS.cancelled, to: "/admin/orders" },
      ]
    : [];

  const topDistributors = (distributors ?? [])
    .filter((d) => d.totalSales > 0)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dashboard.goodMorning") : hour < 18 ? t("dashboard.goodAfternoon") : t("dashboard.goodEvening");

  const attention = [
    {
      key: "pending",
      icon: <HourglassTopRoundedIcon />,
      color: STAGE_COLORS.pending,
      count: stats?.pending,
      label: t("dashboard.todo.pending", { count: stats?.pending ?? 0 }),
      to: "/admin/orders",
    },
    {
      key: "drafts",
      icon: <EditNoteRoundedIcon />,
      color: "#7A5BA6",
      count: draftPaintings?.totalCount,
      label: t("dashboard.todo.drafts", { count: draftPaintings?.totalCount ?? 0 }),
      to: "/admin/paintings",
    },
    {
      key: "ending",
      icon: <EventBusyRoundedIcon />,
      color: "#eb6834",
      count: promotions ? endingSoon.length : undefined,
      label: t("dashboard.todo.ending", { count: endingSoon.length }),
      to: "/admin/promotions",
    },
  ];
  const allClear = attention.every((a) => a.count === 0);

  return (
    <Box sx={{ maxWidth: 1400, width: "100%", mx: "auto" }}>
      <PageMeta title={t("dashboard.title")} />

      {/* ---------- Header ---------- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between", mb: 3.5, ...enterSx(0) }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: palette.goldDark, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
          </Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, mt: 0.5 }}>
            {greeting}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5 }}>
            {stats && stats.pending > 0
              ? t("dashboard.headlinePending", { count: stats.pending })
              : t("dashboard.headlineCalm")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {[
            { to: "/admin/paintings", icon: <AddPhotoAlternateOutlinedIcon />, label: t("dashboard.actions.painting"), primary: true },
            { to: "/admin/promotions", icon: <LocalOfferOutlinedIcon />, label: t("dashboard.actions.promotion") },
            { to: "/admin/distributors", icon: <StorefrontOutlinedIcon />, label: t("dashboard.actions.distributor") },
            { to: "/", icon: <OpenInNewRoundedIcon />, label: t("dashboard.actions.site"), external: true },
          ].map((a) => (
            <Button
              key={a.to}
              component={RouterLink}
              to={a.to}
              target={a.external ? "_blank" : undefined}
              variant={a.primary ? "contained" : "outlined"}
              size="small"
              startIcon={a.icon}
              sx={{
                borderRadius: 999,
                px: 1.75,
                transition: `transform 140ms ${EASE_OUT}, background-color 150ms ease, border-color 150ms ease`,
                "&:active": { transform: "scale(0.97)" },
                ...(a.primary ? {} : { bgcolor: "background.paper", borderColor: palette.line, color: "text.primary" }),
              }}
            >
              {a.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* ---------- KPI tiles ---------- */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            index={1}
            to="/admin/orders"
            icon={<PaymentsOutlinedIcon />}
            color={KPI.revenue}
            label={t("dashboard.kpi.revenue30")}
            value={derived?.current}
            format={money}
            sub={derived && <Delta current={derived.current} previous={derived.previous} suffix={t("dashboard.vsPrev")} />}
            spark={derived?.days.map((d) => d.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            index={2}
            to="/admin/orders"
            icon={<ReceiptLongOutlinedIcon />}
            color={KPI.orders}
            label={t("dashboard.kpi.orders30")}
            value={derived?.currentCount}
            format={(n) => Math.round(n).toLocaleString(locale)}
            sub={derived && t("dashboard.kpi.thisWeek", { count: derived.weekCount })}
            spark={derived?.days.map((d) => d.orders)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            index={3}
            to="/admin/orders"
            icon={<ShoppingBagOutlinedIcon />}
            color={KPI.aov}
            label={t("dashboard.kpi.aov")}
            value={derived?.aov}
            format={money}
            sub={derived && <Delta current={derived.aov} previous={derived.prevAov} suffix={t("dashboard.vsPrev")} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            index={4}
            to="/admin/promotions"
            icon={<LocalOfferOutlinedIcon />}
            color={KPI.promos}
            label={t("dashboard.kpi.livePromos")}
            value={promotions && bundles ? livePromos.length : undefined}
            format={(n) => Math.round(n).toString()}
            sub={promotions && (endingSoon.length ? t("dashboard.kpi.endingSoon", { count: endingSoon.length }) : t("dashboard.kpi.noneEnding"))}
          />
        </Grid>
      </Grid>

      {/* ---------- Revenue + stages ---------- */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel
            index={5}
            title={t("dashboard.revenueTitle")}
            subtitle={
              derived?.truncated ? t("dashboard.revenueSubtitleCapped") : t("dashboard.revenueSubtitle", { days: WINDOW_DAYS })
            }
            action={
              derived && (
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
                    {money(derived.current)}
                  </Typography>
                  <Delta current={derived.current} previous={derived.previous} />
                </Box>
              )
            }
          >
            {derived ? (
              <RevenueChart
                data={derived.days}
                formatValue={money}
                formatAxis={compactMoney}
                formatDay={(d) => d.toLocaleDateString(locale, { day: "numeric", month: "short" })}
                ordersLabel={(n) => t("dashboard.ordersCount", { count: n })}
              />
            ) : (
              <Skeleton variant="rounded" height={220} />
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Panel
            index={6}
            title={t("dashboard.stagesTitle")}
            subtitle={stats ? t("dashboard.stagesSubtitle", { count: stats.total }) : undefined}
            action={<PanelLink to="/admin/orders">{t("dashboard.viewAll")}</PanelLink>}
          >
            {stats ? <StageBreakdown slices={stages} total={stats.total} /> : <Skeleton variant="rounded" height={180} />}
          </Panel>
        </Grid>
      </Grid>

      {/* ---------- Recent orders · distributors · attention ---------- */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Panel index={7} title={t("dashboard.recentOrders")} action={<PanelLink to="/admin/orders">{t("dashboard.viewAll")}</PanelLink>}>
            <Stack spacing={0.25}>
              {!recent
                ? [0, 1, 2, 3].map((i) => <Skeleton key={i} height={48} />)
                : recent.items.length === 0
                  ? <Typography sx={{ fontSize: 13, color: "text.secondary", py: 2 }}>{t("dashboard.noOrders")}</Typography>
                  : recent.items.map((o) => (
                      <Stack
                        key={o.id}
                        direction="row"
                        spacing={1.25}
                        onClick={() => navigate("/admin/orders")}
                        sx={{
                          alignItems: "center",
                          px: 1,
                          py: 0.9,
                          mx: -1,
                          borderRadius: 1.25,
                          cursor: "pointer",
                          transition: "background-color 120ms ease",
                          "@media (hover: hover) and (pointer: fine)": { "&:hover": { bgcolor: alpha(palette.gold, 0.06) } },
                        }}
                      >
                        <InitialsAvatar name={o.customerName} size={32} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
                            {o.customerName}
                          </Typography>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                            <StatusDot status={o.status} size={6} />
                            <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                              {t(`orders.status.${o.status.toLowerCase()}`)} · {formatRelative(o.createdAt, locale)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {money(o.grandTotal)}
                        </Typography>
                      </Stack>
                    ))}
            </Stack>
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Panel
            index={8}
            title={t("dashboard.topDistributors")}
            subtitle={t("dashboard.last30")}
            action={<PanelLink to="/admin/distributors">{t("dashboard.viewAll")}</PanelLink>}
          >
            {!distributors ? (
              <Skeleton variant="rounded" height={160} />
            ) : topDistributors.length ? (
              <RankBars
                rows={topDistributors.map((d) => ({
                  key: d.distributorId,
                  label: d.distributorName,
                  value: d.totalSales,
                  caption: t("dashboard.ordersCount", { count: d.orderCount }),
                }))}
                formatValue={money}
              />
            ) : (
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{t("dashboard.noDistributorSales")}</Typography>
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Panel index={9} title={t("dashboard.attention")}>
            {allClear ? (
              <Stack sx={{ alignItems: "center", textAlign: "center", py: 3, color: palette.success }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 34, mb: 1 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>{t("dashboard.allClear")}</Typography>
              </Stack>
            ) : (
              <Stack spacing={1}>
                {attention.map((a) => (
                  <Stack
                    key={a.key}
                    component={RouterLink}
                    to={a.to}
                    direction="row"
                    spacing={1.25}
                    sx={{
                      alignItems: "center",
                      p: 1.25,
                      borderRadius: 1.5,
                      textDecoration: "none",
                      color: "inherit",
                      bgcolor: a.count ? alpha(a.color, 0.07) : "transparent",
                      boxShadow: `inset 0 0 0 1px ${a.count ? alpha(a.color, 0.2) : palette.line}`,
                      opacity: a.count ? 1 : 0.6,
                      transition: `transform 140ms ${EASE_OUT}, background-color 150ms ease`,
                      "@media (hover: hover) and (pointer: fine)": { "&:hover": { bgcolor: alpha(a.color, 0.12) } },
                      "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        color: a.color,
                        bgcolor: alpha(a.color, 0.14),
                        "& svg": { fontSize: 18 },
                      }}
                    >
                      {a.icon}
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.35 }}>
                      {a.count === undefined ? <Skeleton width={100} /> : a.label}
                    </Typography>
                  </Stack>
                ))}
                {allPaintings && (
                  <Typography sx={{ fontSize: 12, color: "text.secondary", pt: 0.5 }}>
                    {t("dashboard.catalogue", { count: allPaintings.totalCount })}
                  </Typography>
                )}
              </Stack>
            )}
          </Panel>
        </Grid>
      </Grid>
    </Box>
  );
}
