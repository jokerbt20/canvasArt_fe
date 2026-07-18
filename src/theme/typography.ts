import type { TypographyVariantsOptions } from "@mui/material/styles";

// "Fraunces"-style serif for display headings paired with a clean sans body.
// Fonts are loaded via index.html <link> tags (see public fonts) with system fallbacks.
const displayFont = '"Fraunces", "Playfair Display", Georgia, serif';
const bodyFont = '"Inter", "Helvetica Neue", Arial, sans-serif';

export const typography: TypographyVariantsOptions = {
  fontFamily: bodyFont,
  h1: {
    fontFamily: displayFont,
    fontWeight: 500,
    fontSize: "clamp(2.75rem, 5vw, 5rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
  },
  h2: {
    fontFamily: displayFont,
    fontWeight: 500,
    fontSize: "clamp(2.1rem, 3.4vw, 3.25rem)",
    lineHeight: 1.12,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontFamily: displayFont,
    fontWeight: 500,
    fontSize: "clamp(1.6rem, 2.4vw, 2.25rem)",
    lineHeight: 1.18,
  },
  h4: {
    fontFamily: displayFont,
    fontWeight: 500,
    fontSize: "1.5rem",
    lineHeight: 1.25,
  },
  h5: {
    fontFamily: displayFont,
    fontWeight: 500,
    fontSize: "1.25rem",
    lineHeight: 1.3,
  },
  h6: {
    fontFamily: bodyFont,
    fontWeight: 600,
    fontSize: "1rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  subtitle1: {
    fontFamily: bodyFont,
    fontWeight: 500,
    fontSize: "1.05rem",
    letterSpacing: "0.01em",
  },
  subtitle2: {
    fontFamily: bodyFont,
    fontWeight: 600,
    fontSize: "0.8rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  body1: {
    fontFamily: bodyFont,
    fontSize: "1rem",
    lineHeight: 1.7,
    fontWeight: 400,
  },
  body2: {
    fontFamily: bodyFont,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    fontWeight: 400,
  },
  button: {
    fontFamily: bodyFont,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "0.8rem",
  },
  caption: {
    fontFamily: bodyFont,
    fontSize: "0.75rem",
    letterSpacing: "0.02em",
    color: undefined,
  },
  overline: {
    fontFamily: bodyFont,
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
};
