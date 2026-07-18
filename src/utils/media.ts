import { API_ORIGIN } from "../api/axios";

/** Resolves a host-relative path like "/media/paintings/x_thumb.jpg" to a full URL. */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

/** Downloads an already-hosted image and wraps it as a File, so it can be re-submitted through a multipart upload endpoint without the user picking a file from disk. */
export async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
