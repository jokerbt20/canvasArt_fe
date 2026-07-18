import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

interface StatCardProps {
  label: string;
  value?: string;
  loading?: boolean;
}

export function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {label}
      </Typography>
      {loading ? <Skeleton width={100} height={36} /> : <Typography variant="h4">{value}</Typography>}
    </Box>
  );
}
