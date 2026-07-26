import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
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
import { EmptyState } from "../common/EmptyState";

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
}: AdminDataTableProps<T>) {
  const { t } = useTranslation("admin");
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, p: 3 }}
      >
        <Box component="span" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {title}
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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

      <Table>
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
            : rows.map((row) => (
                <TableRow key={rowKey(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align ?? "left"}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell align="right">
                      {onEdit && (
                        <IconButton size="small" onClick={() => onEdit(row)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton size="small" onClick={() => onDelete(row)}>
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

      {page !== undefined && totalPages !== undefined && totalPages > 1 && (
        <Stack sx={{ alignItems: "center", py: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => onPageChange?.(p)} color="primary" />
        </Stack>
      )}
    </Box>
  );
}
