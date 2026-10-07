import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import { EmptyState } from "../common/EmptyState";
import { EASE_OUT } from "./TableBadges";
import { palette } from "../../theme/palette";

const tableSx: SxProps<Theme> = {
  // Header: small caps label on an opaque ivory band so sticky rows don't show through.
  "& .MuiTableCell-head": {
    bgcolor: palette.ivory,
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    py: 1.25,
    borderBottom: `1px solid ${palette.line}`,
  },
  "& .MuiTableCell-body": {
    py: 1.25,
    borderBottom: `1px solid ${alpha(palette.line, 0.6)}`,
    fontVariantNumeric: "tabular-nums",
  },
  // New rows (page/filter change) fade up once; rows that stay mounted don't replay it.
  "& .MuiTableBody-root .MuiTableRow-root": {
    animation: `adminRowIn 220ms ${EASE_OUT} both`,
    animationDelay: "var(--row-delay, 0ms)",
    transition: "background-color 120ms ease",
  },
  "@keyframes adminRowIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& .MuiTableBody-root .MuiTableRow-root": { animation: "none" },
  },
  "@media (hover: hover) and (pointer: fine)": {
    "& .MuiTableRow-hover:hover": { bgcolor: alpha(palette.gold, 0.05) },
  },
  // Press feedback on row actions.
  "& .MuiIconButton-root": {
    transition: `transform 140ms ${EASE_OUT}, background-color 120ms ease, color 120ms ease`,
    "&:active": { transform: "scale(0.92)" },
  },
  "& .row-action-delete:hover": { color: palette.error, bgcolor: alpha(palette.error, 0.08) },
};

export interface AdminColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
}

interface AdminDataTableProps<T> {
  title: string;
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  onAddNew?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Extra controls (e.g. filters) placed on the toolbar line, before search. */
  filters?: ReactNode;
  /** Shown right after the title (e.g. a result-count badge). */
  titleExtra?: ReactNode;
  /** Makes whole rows clickable (e.g. open details). Interactive cells should stop propagation. */
  onRowClick?: (row: T) => void;
  /**
   * Stretch to the parent's height and scroll only the table body (header row stays put).
   * The parent must be a flex column with a bounded height, as AdminLayout's content area is.
   */
  fillHeight?: boolean;
}

export function AdminDataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  onRetry,
  onRefresh,
  isRefreshing,
  search,
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  filters,
  titleExtra,
  onRowClick,
  fillHeight,
}: AdminDataTableProps<T>) {
  const { t } = useTranslation("admin");
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        ...(fillHeight && { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }),
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { md: "center" }, px: 3, py: filters ? 2 : 3 }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", flexShrink: 0 }}>
          <Box component="span" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            {title}
          </Box>
          {titleExtra}
        </Stack>
        {/* Filters share the toolbar line with search/actions and wrap only when space runs out. */}
        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", rowGap: 1.5 }}
        >
          {filters}
          {onSearchChange && (
            <TextField
              size="small"
              placeholder={t("table.search") ?? ""}
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          )}
          {onRefresh && (
            <Tooltip title={t("table.refresh")}>
              <span>
                <IconButton onClick={onRefresh} disabled={isRefreshing}>
                  {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
          )}
          {onAddNew && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddNew}>
              {t("form.addNew")}
            </Button>
          )}
        </Stack>
      </Stack>

      {isError && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert
            severity="error"
            action={
              onRetry && (
                <Button color="inherit" size="small" onClick={onRetry}>
                  {t("table.retry")}
                </Button>
              )
            }
          >
            {t("table.loadError")}
          </Alert>
        </Box>
      )}

      <TableContainer sx={fillHeight ? { flex: 1, minHeight: 0, overflow: "auto" } : undefined}>
        <Table stickyHeader={fillHeight} sx={tableSx}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? "left"}>
                  {col.label}
                </TableCell>
              ))}
              {hasActions && <TableCell align="right">{t("table.actions")}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton />
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              : rows.map((row, i) => (
                  <TableRow
                    key={rowKey(row)}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={onRowClick ? { cursor: "pointer" } : undefined}
                    style={{ "--row-delay": `${Math.min(i, 10) * 18}ms` } as CSSProperties}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align ?? "left"}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell align="right">
                        {onEdit && (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton size="small" className="row-action-delete" onClick={(e) => { e.stopPropagation(); onDelete(row); }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && rows.length === 0 && <EmptyState title={t("table.noResults")} />}
      </TableContainer>

      {page !== undefined && totalPages !== undefined && totalPages > 1 && (
        <Stack sx={{ alignItems: "center", py: fillHeight ? 1.5 : 3, borderTop: fillHeight ? "1px solid" : undefined, borderColor: "divider" }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => onPageChange?.(p)} color="primary" />
        </Stack>
      )}
    </Box>
  );
}
