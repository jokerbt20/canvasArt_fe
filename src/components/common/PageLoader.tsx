import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <CircularProgress size={28} sx={{ color: "primary.main" }} />
    </Box>
  );
}
