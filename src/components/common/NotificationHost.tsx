import { useEffect, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { subscribeToNotifications, type AppNotification } from "../../utils/notify";

// Errors stay long enough to read the message; success/info clear quickly.
const AUTO_HIDE_MS: Record<AppNotification["severity"], number> = {
  error: 8000,
  warning: 6000,
  success: 4000,
  info: 4000,
};

/**
 * Renders app-wide toast notifications published through `notify.*`.
 * Mount once near the root. Stacks multiple messages, each auto-dismissing on its own timer.
 */
export function NotificationHost() {
  const [items, setItems] = useState<AppNotification[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    return subscribeToNotifications((notification) => {
      // Cap the stack so a burst of errors can't cover the screen.
      setItems((prev) => [...prev.slice(-2), notification]);
      window.setTimeout(() => dismiss(notification.id), AUTO_HIDE_MS[notification.severity]);
    });
  }, [dismiss]);

  return (
    <Snackbar
      open={items.length > 0}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ maxWidth: 420 }}
    >
      <Stack spacing={1} sx={{ width: "100%" }}>
        {items.map((item) => (
          <Alert
            key={item.id}
            severity={item.severity}
            variant="filled"
            onClose={() => dismiss(item.id)}
            sx={{ width: "100%", boxShadow: 3 }}
          >
            {item.message}
          </Alert>
        ))}
      </Stack>
    </Snackbar>
  );
}
