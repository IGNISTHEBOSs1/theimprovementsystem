import { Component, ReactNode, ErrorInfo } from 'react';
import { logError } from '@/lib/devDiagnostics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary. The catching behavior (never white-screen) is
 * active in every environment — that's basic resilience, not a dev-only
 * diagnostic. The *verbose* diagnostic logging (full component stack,
 * message, timestamp) only happens in development, via logError(), which
 * is itself a no-op in production. The fallback UI shown to the user
 * differs: a detailed panel in dev, a plain "something went wrong" screen
 * in production — no stack traces or internals are ever shown to a real
 * user.
 */
export class DevErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, {
      component: info.componentStack?.trim().split('\n')[0]?.trim() || 'Unknown component',
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (import.meta.env.DEV) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#1a0a0a', color: '#ff8080', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff4d4d', marginBottom: 12 }}>❌ Render crashed (dev-only detail)</h1>
          <p style={{ marginBottom: 12 }}>{this.state.error?.message}</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.8 }}>{this.state.error?.stack}</pre>
          <p style={{ marginTop: 16, opacity: 0.6 }}>Full diagnostics logged to the console.</p>
        </div>
      );
    }

    return (
      <div style={{ padding: 24, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Something went wrong.</h1>
          <p style={{ opacity: 0.7, marginBottom: 16 }}>Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
