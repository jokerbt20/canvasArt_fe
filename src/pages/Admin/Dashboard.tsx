import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { PageMeta } from "../../components/common/PageMeta";
import { StatCard } from "../../components/admin/StatCard";
import { useOrderStats, useOrders } from "../../hooks/useOrders";
import { useDistributorDashboard } from "../../hooks/useDistributors";
import { formatPrice } from "../../utils/format";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
  const { data: stats, isLoading } = useOrderStats();
  const { data: recentOrders } = useOrders({ page: 1, pageSize: 8, sortBy: "createdAt", sortDir: "desc" });
  const { data: topDistributors } = useDistributorDashboard({});
  const rankedDistributors = (topDistributors ?? []).filter((d) => d.orderCount > 0).slice(0, 8);

  return (
    <Box>
      <PageMeta title={t("dashboard.title")} />
      <Typography variant="h4" sx={{ mb: 4, textTransform: "none", fontFamily: "inherit" }}>
        {t("dashboard.title")}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={t("dashboard.totalRevenue")} value={stats ? formatPrice(stats.revenueDelivered) : undefined} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={t("dashboard.totalOrders")} value={stats?.total.toString()} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={t("orders.status.pending")} value={stats?.pending.toString()} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={t("orders.status.processing")} value={stats?.processing.toString()} loading={isLoading} />
        </Grid>
      </Grid>

      <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {t("dashboard.recentOrders")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>{t("table.name")}</TableCell>
              <TableCell>{t("table.status")}</TableCell>
              <TableCell align="right">{t("table.price")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders?.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Chip size="small" label={t(`orders.status.${order.status.toLowerCase()}`)} />
                </TableCell>
                <TableCell align="right">{formatPrice(order.grandTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: 3, mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {t("dashboard.topDistributors")}
        </Typography>
        {rankedDistributors.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("dashboard.distributor")}</TableCell>
                <TableCell align="right">{t("dashboard.orders")}</TableCell>
                <TableCell align="right">{t("dashboard.sales")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rankedDistributors.map((row) => (
                <TableRow key={row.distributorId}>
                  <TableCell>{row.distributorName}</TableCell>
                  <TableCell align="right">{row.orderCount}</TableCell>
                  <TableCell align="right">{formatPrice(row.totalSales)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t("dashboard.noDistributorSales")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
