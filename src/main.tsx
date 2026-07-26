import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./i18n";
import { theme } from "./theme/theme";
import { queryClient } from "./api/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import App from "./App";
import { PageLoader } from "./components/common/PageLoader";
import { NotificationHost } from "./components/common/NotificationHost";
import { loadI18nOverrides } from "./utils/i18nOverrides";

async function bootstrap() {
  // Merge admin-authored translation overrides before first paint so visitors never
  // see the bundled default flash through. Resilient: never blocks the app on failure.
  await loadI18nOverrides();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <Suspense fallback={<PageLoader />}>
                  <App />
                </Suspense>
                <NotificationHost />
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
