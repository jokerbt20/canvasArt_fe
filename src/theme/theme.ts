import { createTheme, alpha } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.gold,
      light: palette.goldLight,
      dark: palette.goldDark,
      contrastText: palette.charcoal,
    },
    secondary: {
      main: palette.charcoal,
      light: palette.charcoalSoft,
      dark: "#000000",
      contrastText: palette.ivory,
    },
    background: {
      default: palette.ivory,
      paper: "#FFFFFF",
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textSecondary,
    },
    divider: palette.line,
    success: { main: palette.success },
    error: { main: palette.error },
  },
  shape: {
    borderRadius: 2,
  },
  spacing: 8,
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body": {
          scrollBehavior: "smooth",
          overflowX: "hidden",
          maxWidth: "100%",
        },
        "#root": {
          overflowX: "hidden",
        },
        "::selection": {
          backgroundColor: alpha(palette.gold, 0.28),
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 2,
          paddingInline: "1.75rem",
          paddingBlock: "0.85rem",
          transition: "all 240ms ease",
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2, fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "xl" },
    },
  },
});
