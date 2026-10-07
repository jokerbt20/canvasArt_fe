import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { palette } from "../../theme/palette";
import { EASE_OUT } from "./TableBadges";
import { orderStatuses, type OrderStatus } from "../../types";

/** Muted, palette-friendly hue per status (the lifecycle reads warm → cool → green). */
const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  Pending: "#B4691F",
  Contacted: "#5B6B8C",
  Confirmed: "#3F6E8C",
  Processing: "#7A5BA6",
  Shipped: "#2F7F86",
  Delivered: palette.success,
  Cancelled: palette.error,
};

/** Status dot; Pending gets a slow ring pulse because it is the state that needs action. */
export function StatusDot({ status, size = 7 }: { status: OrderStatus; size?: number }) {
  const color = ORDER_STATUS_COLOR[status];
  const pulse = status === "Pending";
  return (
    <Box
      component="span"
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
        transition: "background-color 200ms ease",
        ...(pulse && {
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            bgcolor: color,
            animation: `statusPulse 1.8s ${EASE_OUT} infinite`,
          },
          "@keyframes statusPulse": {
            from: { transform: "scale(1)", opacity: 0.55 },
            to: { transform: "scale(2.6)", opacity: 0 },
          },
          "@media (prefers-reduced-motion: reduce)": { "&::after": { animation: "none" } },
        }),
      }}
    />
  );
}

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  saving?: boolean;
}

/** The status pill *is* the control: click it to open the status menu. */
export function OrderStatusSelect({ value, onChange, saving }: OrderStatusSelectProps) {
  const { t } = useTranslation("admin");
  const color = ORDER_STATUS_COLOR[value];

  return (
    <Select
      variant="standard"
      disableUnderline
      value={value}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      IconComponent={KeyboardArrowDownRoundedIcon}
      MenuProps={{
        onClick: (e) => e.stopPropagation(),
        transitionDuration: { enter: 180, exit: 120 },
        slotProps: { paper: { sx: { mt: 0.5, minWidth: 180, boxShadow: `0 8px 28px ${alpha(palette.charcoal, 0.14)}` } } },
      }}
      renderValue={(v) => (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
          {saving ? <CircularProgress size={10} thickness={6} sx={{ color }} /> : <StatusDot status={v as OrderStatus} />}
          {t(`orders.status.${(v as string).toLowerCase()}`)}
        </Box>
      )}
      sx={{
        height: 26,
        pl: 1.25,
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        color,
        bgcolor: alpha(color, 0.1),
        boxShadow: `inset 0 0 0 1px ${alpha(color, 0.24)}`,
        // Colour retints smoothly when the status changes instead of snapping.
        transition: `background-color 200ms ease, color 200ms ease, box-shadow 200ms ease, transform 140ms ${EASE_OUT}`,
        "&:active": { transform: "scale(0.97)" },
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": { bgcolor: alpha(color, 0.16) },
        },
        "& .MuiSelect-select": { py: 0, pr: "26px !important", display: "flex", alignItems: "center", bgcolor: "transparent !important" },
        "& .MuiSelect-icon": { color, fontSize: 18, right: 4, transition: `transform 180ms ${EASE_OUT}` },
        "& .MuiSelect-iconOpen": { transform: "rotate(180deg)" },
        "&.Mui-disabled": { opacity: 0.75 },
        "& .MuiSelect-select.Mui-disabled": { WebkitTextFillColor: color },
      }}
    >
      {orderStatuses.map((status) => (
        <MenuItem key={status} value={status} sx={{ gap: 1.25, fontSize: 14 }}>
          <StatusDot status={status} />
          {t(`orders.status.${status.toLowerCase()}`)}
        </MenuItem>
      ))}
    </Select>
  );
}
