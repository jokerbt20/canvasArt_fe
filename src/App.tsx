import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { LocaleLayout } from "./components/layout/LocaleLayout";
import { RootRedirect } from "./components/layout/RootRedirect";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { NotFoundPage } from "./pages/NotFoundPage";

const HomePage = lazy(() => import("./pages/Home"));
const GalleryPage = lazy(() => import("./pages/Gallery"));
const PaintingDetailsPage = lazy(() => import("./pages/PaintingDetails"));
const CustomersPage = lazy(() => import("./pages/Customers"));
const OffersPage = lazy(() => import("./pages/Offers"));
const ContactPage = lazy(() => import("./pages/Contact"));
const CartPage = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const OrderSuccessPage = lazy(() => import("./pages/Checkout/OrderSuccess"));

const AdminLoginPage = lazy(() => import("./pages/Admin/Login"));
const AdminDashboardPage = lazy(() => import("./pages/Admin/Dashboard"));
const AdminPaintingsPage = lazy(() => import("./pages/Admin/Paintings"));
const AdminCategoriesPage = lazy(() => import("./pages/Admin/Categories"));
const AdminTagsPage = lazy(() => import("./pages/Admin/Tags"));
const AdminFramesPage = lazy(() => import("./pages/Admin/Frames"));
const AdminOrdersPage = lazy(() => import("./pages/Admin/Orders"));
const AdminPromotionsPage = lazy(() => import("./pages/Admin/Promotions"));
const AdminDistributorsPage = lazy(() => import("./pages/Admin/Distributors"));
const AdminHomepagePage = lazy(() => import("./pages/Admin/Homepage"));
const AdminSlideshowPage = lazy(() => import("./pages/Admin/Slideshow"));
const AdminCustomersPage = lazy(() => import("./pages/Admin/Customers"));
const AdminUsersPage = lazy(() => import("./pages/Admin/Users"));
const AdminTranslationsPage = lazy(() => import("./pages/Admin/Translations"));
const AdminSettingsPage = lazy(() => import("./pages/Admin/Settings"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/:lang" element={<LocaleLayout />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="gallery/:slug" element={<PaintingDetailsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/success/:orderNumber" element={<OrderSuccessPage />} />
          </Route>
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="paintings" element={<AdminPaintingsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tags" element={<AdminTagsPage />} />
            <Route path="frames" element={<AdminFramesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="distributors" element={<AdminDistributorsPage />} />
            <Route path="homepage" element={<AdminHomepagePage />} />
            <Route path="slideshow" element={<AdminSlideshowPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="translations" element={<AdminTranslationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AnimatePresence>
    </>
  );
}
