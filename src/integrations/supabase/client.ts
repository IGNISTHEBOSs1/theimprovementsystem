import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { logNetworkError, logSupabaseError, PERF_THRESHOLDS_MS } from '@/lib/devDiagnostics';

const SUPABASE_URL = "https://xbrzrxfntixkiykfczjf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicnpyeGZudGl4a2l5a2ZjempmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgxODQsImV4cCI6MjA4OTQxNDE4NH0.pnPti3O2u14daEWAen3Y2LvZHXeFYMFg7bWLJmXr-ZA";

/**
 * Dev-only network diagnostics: logs ONLY failed requests (thrown network
 * errors, or HTTP status >= 400) and requests slower than the network
 * threshold. Successful, fast requests produce zero output — this is not
 * a request logger, it's a failure/slowness detector. In production this
 * function doesn't exist in the bundle at all (see below).
 */
const devDiagnosticFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method ?? 'GET';
  const start = performance.now();

  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (err) {
    const durationMs = performance.now() - start;
    logNetworkError({ url, method, durationMs, body: err instanceof Error ? err.message : err });
    throw err;
  }

  const durationMs = performance.now() - start;

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.clone().text();
    } catch {
      body = '(could not read response body)';
    }
    logNetworkError({ url, method, status: response.status, body, durationMs });
  } else if (durationMs > PERF_THRESHOLDS_MS.network) {
    logNetworkError({ url, method, status: response.status, body: '(request succeeded but was slow)', durationMs });
  }

  return response;
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Only attach the diagnostic fetch wrapper in development. In
  // production `global.fetch` is left undefined, so the Supabase client
  // uses the platform's native fetch directly with no wrapper at all.
  ...(import.meta.env.DEV ? { global: { fetch: devDiagnosticFetch } } : {}),
});

/**
 * Dev-only Supabase operation diagnostics: wraps supabase.from(table) so
 * that any query which errors, or takes longer than the Supabase query
 * threshold, is logged via logSupabaseError(). Successful, fast queries
 * produce zero output. This wraps whichever chained method the caller
 * eventually awaits (.select().eq().maybeSingle(), etc.) regardless of
 * chain length, without altering what data/errors are returned to the
 * real caller.
 *
 * This entire block is skipped in production — supabase.from is left as
 * the original, unwrapped method, so there is no proxy overhead at all.
 */
if (import.meta.env.DEV) {
  const originalFrom = supabase.from.bind(supabase);

  function wrapBuilder<T extends object>(builder: T, operationLabel: string): T {
    return new Proxy(builder, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (prop === 'then' && typeof value === 'function') {
          const start = performance.now();
          return function (this: unknown, onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
            return (value as (...a: unknown[]) => Promise<unknown>).call(
              target,
              (result: { error?: unknown }) => {
                const durationMs = performance.now() - start;
                if (result && result.error) {
                  logSupabaseError({ operation: operationLabel, error: result.error, durationMs });
                } else if (durationMs > PERF_THRESHOLDS_MS.supabase) {
                  logSupabaseError({ operation: operationLabel, error: '(query succeeded but was slow)', durationMs });
                }
                return onFulfilled ? onFulfilled(result) : result;
              },
              (err: unknown) => {
                const durationMs = performance.now() - start;
                logSupabaseError({ operation: operationLabel, error: err, durationMs });
                if (onRejected) return onRejected(err);
                throw err;
              }
            );
          };
        }

        if (typeof value === 'function') {
          return function (this: unknown, ...args: unknown[]) {
            const result = (value as (...a: unknown[]) => unknown).apply(target, args);
            if (result && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
              return wrapBuilder(result as object, operationLabel);
            }
            return result;
          };
        }

        return value;
      },
    }) as T;
  }

  // @ts-expect-error — dev-only diagnostic override of the public method signature
  supabase.from = (table: string) => {
    const builder = originalFrom(table as never);
    return wrapBuilder(builder, `${table}.query`);
  };
}
