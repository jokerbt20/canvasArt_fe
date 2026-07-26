// Runtime configuration for the deployed app.
//
// This file is copied as-is into the build output (dist/config.js) and loaded via a
// plain <script> tag before the app bundle — so you can edit it directly on the server
// after a deploy to change the API URL, with no rebuild required. Just save and refresh.
//
// Leave API_BASE_URL blank/unset for local development — it falls back to the
// VITE_API_BASE_URL value in .env instead.
window.__APP_CONFIG__ = {
  API_BASE_URL: "",
};
