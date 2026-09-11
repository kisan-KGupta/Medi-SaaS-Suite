import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Production backend. The generated API client already prefixes every path with
// `/api`, so this must be an origin only — no `/api` suffix.
const PRODUCTION_API_URL = "https://medi-saas-suite-production.up.railway.app";

/**
 * Resolve the API origin the client should talk to.
 *
 * In production the request must go straight to the backend: posting to a
 * relative `/api/...` path on Vercel falls through to the static SPA rewrite,
 * which answers non-GET requests with 405. So a relative or empty
 * `VITE_API_URL` is ignored in production builds.
 */
function resolveApiUrl(): string {
  const configured = (import.meta.env.VITE_API_URL ?? "").trim();

  // Drop trailing slashes and a trailing `/api` — the client adds `/api` itself,
  // so keeping it here would produce `/api/api/auth/login`.
  const normalized = configured.replace(/\/+$/, "").replace(/\/api$/, "");

  const isAbsolute = /^https?:\/\//i.test(normalized);

  if (import.meta.env.PROD && !isAbsolute) {
    return PRODUCTION_API_URL;
  }

  return normalized;
}

const apiUrl = resolveApiUrl();

if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem("pharmacy_token"));

createRoot(document.getElementById("root")!).render(<App />);
