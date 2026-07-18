import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { AdminTopbar } from "../components/layout/AdminTopbar";

export function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F4EF" }}>
      <AdminSidebar />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AdminTopbar />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
