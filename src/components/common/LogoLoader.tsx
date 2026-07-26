import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

interface LogoLoaderProps {
  /** Optional caption shown beneath the mark. */
  label?: string;
  /** Vertical space the loader occupies when centered on its own. */
  minHeight?: string | number;
  /** Width of the logo mark in px; height follows its aspect ratio. */
  size?: number;
}

export function LogoLoader({ label, minHeight = "60vh", size = 200 }: LogoLoaderProps) {
  return (
    <Stack spacing={2.5} sx={{ alignItems: "center", justifyContent: "center", minHeight, py: 4 }}>
      <Box sx={{ position: "relative", width: size, aspectRatio: "1 / 1" }}>
        {/* Soft ambient glow breathing behind the mark */}
        <Box
          component={motion.div}
          animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            inset: "-30%",
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(184,150,90,0.4), transparent 72%)",
            filter: "blur(4px)",
          }}
        />

        {/* The logo itself, gently breathing */}
        <Box
          component={motion.img}
          src="/logo.png"
          alt="CanvasArts"
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1, 0.97] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "relative",
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "50% 50%",
          }}
        />

        {/* A light sweep travelling across the mark, masked to its exact silhouette */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(100deg, transparent 32%, rgba(217,192,143,0.85) 47%, rgba(255,255,255,0.95) 50%, rgba(217,192,143,0.85) 53%, transparent 68%)",
            backgroundSize: "260% 100%",
            backgroundRepeat: "no-repeat",
            WebkitMaskImage: "url(/logo.png)",
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "50% 50%",
            WebkitMaskRepeat: "no-repeat",
            maskImage: "url(/logo.png)",
            maskSize: "contain",
            maskPosition: "50% 50%",
            maskRepeat: "no-repeat",
            mixBlendMode: "overlay",
            pointerEvents: "none",
            "@keyframes logoShimmerSweep": {
              "0%": { backgroundPositionX: "160%" },
              "100%": { backgroundPositionX: "-100%" },
            },
            animation: "logoShimmerSweep 1.9s linear infinite",
          }}
        />
      </Box>

      {/* A slim gold arc turning beneath, like a frame corner coming around */}
      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        sx={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "primary.main",
          borderRightColor: "primary.main",
        }}
      />

      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </Typography>
      )}
    </Stack>
  );
}
