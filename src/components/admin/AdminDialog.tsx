import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { palette } from "../../theme/palette";
import { EASE_OUT } from "./TableBadges";

interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Leading visual in the header (avatar, icon tile). */
  media?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
}

/**
 * Admin modal: header with media + title + subtitle, scrollable body, sticky action bar.
 * Enters with a short scale-and-fade from 0.96 (never from 0); exit is quicker than entry.
 * Modals stay centred, so the transform origin is the default centre.
 */
export function AdminDialog({ open, onClose, title, subtitle, media, children, actions, maxWidth = "sm" }: AdminDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      transitionDuration={{ enter: 220, exit: 140 }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
            boxShadow: `0 24px 60px ${alpha(palette.charcoal, 0.22)}, 0 0 0 1px ${alpha(palette.charcoal, 0.06)}`,
            animation: `adminDialogIn 220ms ${EASE_OUT}`,
            "@keyframes adminDialogIn": {
              from: { opacity: 0, transform: "scale(0.96) translateY(6px)" },
            },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          },
        },
        backdrop: { sx: { bgcolor: alpha(palette.charcoal, 0.4), backdropFilter: "blur(2px)" } },
      }}
    >
      <Stack direction="row" spacing={1.75} sx={{ alignItems: "center", px: 3, pt: 2.75, pb: 2 }}>
        {media}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 650, lineHeight: 1.3 }} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>{subtitle}</Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{
            alignSelf: "flex-start",
            color: "text.secondary",
            transition: `transform 140ms ${EASE_OUT}, background-color 120ms ease`,
            "&:active": { transform: "scale(0.9)" },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ px: 3, pt: 0.5, pb: 2.5 }}>{children}</DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 1.75,
            gap: 1,
            bgcolor: alpha(palette.ivory, 0.7),
            borderTop: `1px solid ${palette.line}`,
            "& .MuiButton-root": {
              transition: `transform 140ms ${EASE_OUT}, background-color 120ms ease, box-shadow 120ms ease`,
              "&:active": { transform: "scale(0.97)" },
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

/** Rounded icon tile for dialog headers. */
export function DialogIconTile({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        color: palette.goldDark,
        bgcolor: alpha(palette.gold, 0.14),
        boxShadow: `inset 0 0 0 1px ${alpha(palette.gold, 0.28)}`,
        "& svg": { fontSize: 20 },
      }}
    >
      {children}
    </Box>
  );
}

/** A setting row with a label, helper text and a control on the right (e.g. a Switch). */
export function SettingRow({ title, hint, control, tone }: { title: ReactNode; hint?: ReactNode; control: ReactNode; tone?: "on" | "off" }) {
  const on = tone !== "off";
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        px: 2,
        py: 1.5,
        borderRadius: 1.5,
        bgcolor: on ? alpha(palette.success, 0.06) : alpha(palette.textSecondary, 0.05),
        boxShadow: `inset 0 0 0 1px ${on ? alpha(palette.success, 0.18) : alpha(palette.textSecondary, 0.12)}`,
        transition: "background-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
        {hint && <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>{hint}</Typography>}
      </Box>
      {control}
    </Stack>
  );
}
