import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FadeInSection } from "../animations/FadeInSection";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }: SectionHeadingProps) {
  return (
    <FadeInSection>
      <Box sx={{ textAlign: align, maxWidth: align === "center" ? 640 : "none", mx: align === "center" ? "auto" : 0, mb: { xs: 5, md: 7 } }}>
        {eyebrow && (
          <Typography variant="overline" color="primary.dark" sx={{ display: "block", mb: 1.5 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </FadeInSection>
  );
}
