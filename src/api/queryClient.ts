import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { notify } from "../utils/notify";
import { getApiErrorMessage } from "../utils/apiError";

/**
 * Optional per-mutation metadata read by the global cache callbacks.
 *   meta: { successMessage: "Saved", errorMessage?: "…", suppressErrorToast?: true }
 */
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string;
      /** Set when the page shows the error itself and a global toast would duplicate it. */
      suppressErrorToast?: boolean;
    };
    queryMeta: {
      /** Set to skip the automatic "failed to load" toast for a query. */
      suppressErrorToast?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  // Surface background fetch failures so a page never silently shows an empty/loading state.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressErrorToast) return;
      notify.error(getApiErrorMessage(error, "Failed to load data. Please try again."));
    },
  }),
  // Every create/update/delete surfaces its real error message, and an optional success toast.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;
      notify.error(mutation.meta?.errorMessage || getApiErrorMessage(error));
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      if (mutation.meta?.successMessage) notify.success(mutation.meta.successMessage);
    },
  }),
});
