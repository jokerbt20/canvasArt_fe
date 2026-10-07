import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { AdminTopbar } from "../components/layout/AdminTopbar";

export function AdminLayout() {
  return (
    // Viewport-height shell: the window never scrolls, only the content area below the
    // topbar does — so full-height pages (e.g. AdminDataTable with fillHeight) can scroll
    // just their own body.
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "#F7F4EF" }}>
      <AdminSidebar />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminTopbar />
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", p: { xs: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
