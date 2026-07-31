import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xbrzrxfntixkiykfczjf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicnpyeGZudGl4a2l5a2ZjempmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgxODQsImV4cCI6MjA4OTQxNDE4NH0.pnPti3O2u14daEWAen3Y2LvZHXeFYMFg7bWLJmXr-ZA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// ---------------------------------------------------------------------
// TEMPORARY DEBUG INSTRUMENTATION — regression hunt, not a fix.
// Logs START/END around every supabase.from(table)... query (regardless
// of chain length: .select().eq().maybeSingle(), etc.) and around
// supabase.auth.getSession(). Does not alter any query behavior — purely
// observational wrapping. Remove once the hanging request is identified.
// ---------------------------------------------------------------------

function instrumentBuilder<T extends object>(builder: T, label: string): T {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === 'then' && typeof value === 'function') {
        return function (this: unknown, onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
          return (value as Function).call(
            target,
            (result: unknown) => {
              console.log(`END ${label}`);
              return onFulfilled ? onFulfilled(result) : result;
            },
            (err: unknown) => {
              console.log(`END ${label} (error)`, err);
              if (onRejected) return onRejected(err);
              throw err;
            }
          );
        };
      }

      if (typeof value === 'function') {
        return function (this: unknown, ...args: unknown[]) {
          const result = (value as Function).apply(target, args);
          if (result && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
            return instrumentBuilder(result as object, label);
          }
          return result;
        };
      }

      return value;
    },
  }) as T;
}

const originalFrom = supabase.from.bind(supabase);
// @ts-expect-error — temporary debug override, restored to original signature on cleanup
supabase.from = (table: string) => {
  console.log(`START ${table}`);
  const builder = originalFrom(table as never);
  return instrumentBuilder(builder, table);
};

const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
supabase.auth.getSession = async (...args: Parameters<typeof originalGetSession>) => {
  console.log('START auth.getSession');
  try {
    return await originalGetSession(...args);
  } finally {
    console.log('END auth.getSession');
  }
};
// ---------------------------------------------------------------------
// END TEMPORARY DEBUG INSTRUMENTATION
// ---------------------------------------------------------------------
