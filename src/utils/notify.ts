/**
 * Tiny app-wide notification bus.
 *
 * Decoupled from React so it can be called from anywhere — React components, React Query
 * cache callbacks, axios interceptors — via `notify.*`. A single <NotificationHost /> mounted
 * near the app root subscribes and renders the toasts.
 */
export type NotificationSeverity = "success" | "error" | "info" | "warning";

export interface AppNotification {
  id: number;
  message: string;
  severity: NotificationSeverity;
}

type Listener = (notification: AppNotification) => void;

const listeners = new Set<Listener>();
let nextId = 1;

function emit(message: string, severity: NotificationSeverity) {
  const trimmed = message?.trim();
  if (!trimmed) return;
  const notification: AppNotification = { id: nextId++, message: trimmed, severity };
  listeners.forEach((listener) => listener(notification));
}

export function subscribeToNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const notify = {
  success: (message: string) => emit(message, "success"),
  error: (message: string) => emit(message, "error"),
  info: (message: string) => emit(message, "info"),
  warning: (message: string) => emit(message, "warning"),
};
