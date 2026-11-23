import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorCapture } from "./lib/devDiagnostics";
import { initPreloadRecovery } from "./lib/preloadRecovery";
import { notifyBundleHealthy } from "./services/otaUpdateService";
import { bind } from "cuelume";

// Immediately signal to native container that the web bundle is loaded and healthy.
// Releases the native Capgo update semaphore instantly (<10ms) instead of waiting for a 30s timeout.
void notifyBundleHealthy();

// Initialize preload recovery first so window listeners catch any asset loading errors
initPreloadRecovery();
initGlobalErrorCapture();

// Defensive polyfill for MediaQueryList across all browser/webview versions.
// Prevents libraries like Framer Motion from throwing "motionMediaQuery.addEventListener is not a function".
if (typeof window !== "undefined") {
  if (typeof window.MediaQueryList !== "undefined" && !window.MediaQueryList.prototype.addEventListener) {
    window.MediaQueryList.prototype.addEventListener = function (
      _event: string,
      cb: EventListenerOrEventListenerObject
    ) {
      if (typeof this.addListener === "function") {
        this.addListener(cb as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      }
    };
    window.MediaQueryList.prototype.removeEventListener = function (
      _event: string,
      cb: EventListenerOrEventListenerObject
    ) {
      if (typeof this.removeListener === "function") {
        this.removeListener(cb as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      }
    };
  }

  if (typeof window.matchMedia === "function") {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function (query: string): MediaQueryList {
      try {
        const mql = originalMatchMedia.call(window, query);
        if (mql && typeof mql === "object") {
          if (typeof mql.addEventListener !== "function" && typeof mql.addListener === "function") {
            mql.addEventListener = function (
              _ev: string,
              cb: EventListenerOrEventListenerObject
            ) {
              mql.addListener(cb as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
            };
          }
          if (typeof mql.removeEventListener !== "function" && typeof mql.removeListener === "function") {
            mql.removeEventListener = function (
              _ev: string,
              cb: EventListenerOrEventListenerObject
            ) {
              mql.removeListener(cb as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
            };
          }
        }
        return mql;
      } catch {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as unknown as MediaQueryList;
      }
    };
  }
}

// Initialize sound interaction bindings once at startup
try {
  bind();
} catch (e) {
  console.warn("Cuelume sound bind deferred:", e);
}

createRoot(document.getElementById("root")!).render(<App />);
