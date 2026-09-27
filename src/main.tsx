import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorCapture } from "./lib/devDiagnostics";
import { initPreloadRecovery } from "./lib/preloadRecovery";
import { bind } from "cuelume";

// Initialize preload recovery first so window listeners catch any asset loading errors
initPreloadRecovery();
initGlobalErrorCapture();

// Initialize sound interaction bindings once at startup
try {
  bind();
} catch (e) {
  console.warn("Cuelume sound bind deferred:", e);
}

createRoot(document.getElementById("root")!).render(<App />);
