import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export function MainLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
