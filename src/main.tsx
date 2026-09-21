import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorCapture } from "./lib/devDiagnostics";
import { initPreloadRecovery } from "./lib/preloadRecovery";

// Initialize preload recovery first so window listeners catch any asset loading errors
initPreloadRecovery();
initGlobalErrorCapture();

createRoot(document.getElementById("root")!).render(<App />);
