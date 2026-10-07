import { Link as RouterLink } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { palette } from "../../theme/palette";

export interface Crumb {
  label: string;
  /** Omit for the current page (rendered as plain text). */
  to?: string;
}

/** Quiet breadcrumb trail: muted links, current page in primary ink, truncates on small screens. */
export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
      sx={{
        mb: { xs: 3, md: 4 },
        "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" },
        "& .MuiBreadcrumbs-li": { minWidth: 0 },
        "& .MuiBreadcrumbs-separator": { mx: 0.5 },
      }}
    >
      {items.map((item, i) =>
        item.to ? (
          <Box
            key={i}
            component={RouterLink}
            to={item.to}
            sx={{
              display: "block",
              fontSize: 13,
              color: "text.secondary",
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: 120, sm: 220 },
              transition: "color 150ms ease",
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": { color: palette.goldDark, textDecoration: "underline", textUnderlineOffset: "3px" },
              },
              "&:focus-visible": { outline: `2px solid ${palette.gold}`, outlineOffset: 2, borderRadius: 0.5 },
            }}
          >
            {item.label}
          </Box>
        ) : (
          <Typography
            key={i}
            aria-current="page"
            noWrap
            sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", maxWidth: { xs: 160, sm: 320 } }}
          >
            {item.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
