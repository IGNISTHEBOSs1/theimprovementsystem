import { Component, ReactNode, ErrorInfo } from "react";
import { logError } from "@/lib/devDiagnostics";
import { isChunkLoadError, shouldAutoReloadOnChunkError, triggerGuardedReload, clearReloadGuard } from "@/lib/preloadRecovery";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global root error boundary.
 *
 * Catches fatal application crashes and unhandled root errors.
 * Automatically recovers from stale chunk preload errors if permitted by the reload guard.
 * Provides a dev-only diagnostic inspector in development and an accessible,
 * branded recovery screen in production.
 */
export class DevErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, {
      component: info.componentStack?.trim().split("\n")[0]?.trim() || "Unknown component",
      componentStack: info.componentStack,
    });

    // If this is a chunk or CSS preload failure (common on new deployments), attempt guarded reload
    if (isChunkLoadError(error) && shouldAutoReloadOnChunkError()) {
      triggerGuardedReload();
    }
  }

  handleReload = () => {
    clearReloadGuard();
    window.location.reload();
  };

  handleGoHome = () => {
    clearReloadGuard();
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (import.meta.env.DEV) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", background: "#1a0a0a", color: "#ff8080", minHeight: "100vh" }}>
          <h1 style={{ color: "#ff4d4d", marginBottom: 12 }}>❌ Render crashed (dev-only detail)</h1>
          <p style={{ marginBottom: 12 }}>{this.state.error?.message}</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.8 }}>{this.state.error?.stack}</pre>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={this.handleReload}
              style={{ padding: "8px 16px", cursor: "pointer", background: "#331111", color: "#ff8080", border: "1px solid #ff4d4d", borderRadius: 6 }}
            >
              Reload
            </button>
            <button
              onClick={this.handleGoHome}
              style={{ padding: "8px 16px", cursor: "pointer", background: "#222", color: "#ccc", border: "1px solid #555", borderRadius: 6 }}
            >
              Go to Home
            </button>
          </div>
          <p style={{ marginTop: 16, opacity: 0.6 }}>Full diagnostics logged to the console.</p>
        </div>
      );
    }

    const isChunk = isChunkLoadError(this.state.error);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 text-center shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isChunk ? "System Update Available" : "Something went wrong"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isChunk
              ? "A fresh deployment of The Improvement System is ready. Reloading will sync the latest assets."
              : "An unexpected condition occurred. Reloading the system will restore your session."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] shadow-sm"
            >
              Reload System
            </button>

            <button
              onClick={this.handleGoHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/40 active:scale-[0.98]"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
