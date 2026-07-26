import type { ApiClientError } from "../api/axios";

/**
 * Pull a human-readable message out of whatever an API call rejected with.
 *
 * The axios response interceptor attaches a normalized `clientError` (message + field errors)
 * to every rejected request, so that is the primary source. Falls back gracefully for
 * non-axios errors and validation-detail arrays.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  const clientError = (error as { clientError?: ApiClientError }).clientError;
  if (clientError) {
    if (clientError.errors?.length) return clientError.errors.join(" ");
    if (clientError.message) return clientError.message;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;

  return fallback;
}
