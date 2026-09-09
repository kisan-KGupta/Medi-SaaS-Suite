import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// In production (Vercel), point API calls at the Railway backend.
// In development, Vite's proxy forwards /api/* to localhost:5000.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem("pharmacy_token"));

createRoot(document.getElementById("root")!).render(<App />);
