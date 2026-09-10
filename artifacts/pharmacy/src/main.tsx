import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://medi-saas-suite-production.up.railway.app" : "");

if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem("pharmacy_token"));

createRoot(document.getElementById("root")!).render(<App />);
