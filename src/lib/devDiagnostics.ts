/**
 * Development-only diagnostics layer.
 *
 * Every export in this file is a no-op (or as close to zero-cost as
 * possible) when `import.meta.env.DEV` is false. Nothing here should ever
 * run, log, or measure anything in a production build. Vite statically
 * replaces `import.meta.env.DEV` at build time, so the `if (!DEV) return`
 * guards below are dead-code-eliminated in production — this isn't just
 * "won't log," the code physically isn't in the production bundle.
 *
 * Goal: a single, structured place for diagnostics so nobody needs to
 * hand-write throwaway console.log statements during development again.
 */

const DEV = import.meta.env.DEV;

const BORDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

function timestamp(): string {
  return new Date().toISOString();
}

function printBox(icon: string, title: string, fields: Array<[string, string]>) {
  if (!DEV) return;
  const lines = [BORDER, `${icon} ${title}`, ''];
  for (const [label, value] of fields) {
    lines.push(`${label}:`);
    lines.push(value || '(none)');
    lines.push('');
  }
  lines.pop(); // drop trailing blank line
  lines.push(BORDER);
  console.log(lines.join('\n'));
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return '(none)';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Best-effort extraction of the current user id, for attaching context to
 * error logs. Deliberately reads the persisted session directly out of
 * localStorage rather than calling any supabase.auth.* method — the auth
 * startup deadlock that was just fixed was specifically about re-entrant
 * calls into GoTrueClient's locked methods, so diagnostics code must never
 * call supabase.auth.getSession()/getUser() itself. This is read-only,
 * synchronous, and cannot interact with that lock at all.
 */
function getBestEffortUserId(): string {
  if (!DEV) return 'unknown';
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) return '(no session)';
    const raw = localStorage.getItem(key);
    if (!raw) return '(no session)';
    const parsed = JSON.parse(raw);
    return parsed?.user?.id ?? parsed?.currentSession?.user?.id ?? '(unknown shape)';
  } catch {
    return '(unreadable)';
  }
}

export interface ErrorLogContext {
  component?: string;
  [key: string]: unknown;
}

/**
 * Logs an uncaught error / rejection / render crash in the standard
 * format. `component` should be the closest known component or module
 * name — pass it explicitly when known (e.g. from an ErrorBoundary's
 * componentStack); global handlers fall back to 'Unknown'.
 */
export function logError(error: unknown, context: ErrorLogContext = {}) {
  if (!DEV) return;
  const { component = 'Unknown', ...rest } = context;
  const err = error instanceof Error ? error : new Error(safeStringify(error));

  printBox('❌', 'TIS ERROR', [
    ['Component', component],
    ['Message', err.message],
    ['Stack', err.stack ?? '(no stack available)'],
    ...(Object.keys(rest).length ? ([['Context', safeStringify(rest)]] as Array<[string, string]>) : []),
    ['Time', timestamp()],
  ]);
}

export function logWarning(message: string, context: Record<string, unknown> = {}) {
  if (!DEV) return;
  printBox('⚠️', 'TIS WARNING', [
    ['Message', message],
    ...(Object.keys(context).length ? ([['Context', safeStringify(context)]] as Array<[string, string]>) : []),
    ['Time', timestamp()],
  ]);
}

export interface SupabaseErrorContext {
  operation: string;
  error: unknown;
  durationMs?: number;
}

export function logSupabaseError({ operation, error, durationMs }: SupabaseErrorContext) {
  if (!DEV) return;
  printBox('🔴', 'SUPABASE ERROR', [
    ['Operation', operation],
    ['User', getBestEffortUserId()],
    ['Error', safeStringify(error)],
    ['Duration', durationMs !== undefined ? `${durationMs.toFixed(1)}ms` : '(unknown)'],
    ['Time', timestamp()],
  ]);
}

export interface NetworkErrorContext {
  url: string;
  method: string;
  status?: number;
  body?: unknown;
  durationMs: number;
}

export function logNetworkError({ url, method, status, body, durationMs }: NetworkErrorContext) {
  if (!DEV) return;
  printBox('🌐', 'NETWORK REQUEST FAILED', [
    ['URL', url],
    ['Method', method],
    ['Status', status !== undefined ? String(status) : '(no response)'],
    ['Response body', safeStringify(body)],
    ['Duration', `${durationMs.toFixed(1)}ms`],
    ['Time', timestamp()],
  ]);
}

// Performance thresholds — warnings only, never errors, never block anything.
export const PERF_THRESHOLDS_MS = {
  render: 100,
  network: 3000,
  supabase: 2000,
} as const;

/**
 * Wraps an async (or sync) function, measuring its duration. Logs a
 * warning if it exceeds `warnAfterMs`. Returns whatever the wrapped
 * function returns/throws, unchanged — this never alters behavior, only
 * observes it.
 */
export async function measure<T>(
  label: string,
  fn: () => Promise<T> | T,
  warnAfterMs: number = PERF_THRESHOLDS_MS.supabase
): Promise<T> {
  if (!DEV) return fn();
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = performance.now() - start;
    if (durationMs > warnAfterMs) {
      logWarning(`${label} took ${durationMs.toFixed(1)}ms (threshold: ${warnAfterMs}ms)`, { label, durationMs });
    }
  }
}

/**
 * Thin wrapper around console.group for organizing related diagnostic
 * output. No-op in production.
 */
export function group(label: string, fn: () => void) {
  if (!DEV) {
    return;
  }
  console.group(label);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
}

/**
 * Installs global handlers for uncaught exceptions and unhandled promise
 * rejections. Call once, at application startup. No-op in production.
 */
export function initGlobalErrorCapture() {
  if (!DEV) return;

  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message, { component: 'window.onerror', filename: event.filename, line: event.lineno, col: event.colno });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { component: 'unhandledrejection (uncaught async/Promise failure)' });
  });

  console.log('%c[TIS Diagnostics] Dev diagnostics active', 'color: #8b5cf6; font-weight: bold;');
}
