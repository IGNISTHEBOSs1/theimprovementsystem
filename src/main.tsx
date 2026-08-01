import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorCapture } from "./lib/devDiagnostics";

initGlobalErrorCapture();

createRoot(document.getElementById("root")!).render(<App />);
