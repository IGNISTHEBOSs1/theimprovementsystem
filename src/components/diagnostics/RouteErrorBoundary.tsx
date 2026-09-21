import React, { Component, ReactNode, ErrorInfo } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/devDiagnostics";
import { isChunkLoadError, triggerGuardedReload, clearReloadGuard } from "@/lib/preloadRecovery";

interface InnerProps {
  children: ReactNode;
  locationKey: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class InnerRouteErrorBoundary extends Component<InnerProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, {
      component: "RouteErrorBoundary",
      componentStack: info.componentStack,
    });

    // If this is a chunk failure (e.g. from an unhandled asset preload), attempt guarded reload
    if (isChunkLoadError(error)) {
      triggerGuardedReload();
    }
  }

  componentDidUpdate(prevProps: InnerProps) {
    // Automatically reset error boundary when user navigates to another page
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    clearReloadGuard();
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    clearReloadGuard();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunk = isChunkLoadError(this.state.error);

      return (
        <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 p-8 text-center shadow-xl backdrop-blur-xl animate-fade-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {isChunk ? "System Update Detected" : "Unable to load this view"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {isChunk
                ? "A new version of the system was deployed. Refreshing will load the latest interface."
                : "An unexpected issue interrupted this section. You can try again or reload the page."}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="w-full sm:w-auto gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Route-level Error Boundary.
 * Wraps page-level routes within AppLayout so that navigation remains functional
 * and user sessions do not collapse on localized errors.
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <InnerRouteErrorBoundary locationKey={location.pathname}>
      {children}
    </InnerRouteErrorBoundary>
  );
}
