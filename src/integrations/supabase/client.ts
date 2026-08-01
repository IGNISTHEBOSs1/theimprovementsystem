import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xbrzrxfntixkiykfczjf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicnpyeGZudGl4a2l5a2ZjempmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgxODQsImV4cCI6MjA4OTQxNDE4NH0.pnPti3O2u14daEWAen3Y2LvZHXeFYMFg7bWLJmXr-ZA";

// ---------------------------------------------------------------------
// TEMPORARY DEBUG INSTRUMENTATION — regression hunt, not a fix.
// Wraps the actual fetch() call the Supabase client uses for every HTTP
// request (auth, PostgREST, everything). Answers three separate
// questions per request, logged as distinct events so each can be
// individually confirmed or ruled out:
//   1. Was the request actually sent? -> "FETCH SEND"
//   2. Was a response received (headers back)? -> "FETCH RESPONSE"
//   3. Did reading/parsing the response body hang? -> "FETCH BODY PARSED"
// The body is read via response.clone() so this instrumentation cannot
// itself alter what the real caller receives.
// ---------------------------------------------------------------------
const instrumentedFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const label = url.replace(SUPABASE_URL, '');
  const method = init?.method ?? 'GET';

  console.log(`FETCH SEND ${method} ${label}`);
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (err) {
    console.log(`FETCH NETWORK ERROR ${method} ${label}`, err);
    throw err;
  }
  console.log(`FETCH RESPONSE ${method} ${label}`, { status: response.status, ok: response.ok });

  // Read a clone independently so we can observe whether *parsing* the
  // body hangs, without consuming the body the real caller will read.
  response.clone().text()
    .then(() => console.log(`FETCH BODY PARSED ${method} ${label}`))
    .catch((err) => console.log(`FETCH BODY PARSE ERROR ${method} ${label}`, err));

  return response;
};
// ---------------------------------------------------------------------
// END TEMPORARY DEBUG INSTRUMENTATION (fetch wiring below, in createClient)
// ---------------------------------------------------------------------

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: instrumentedFetch,
  },
});

// ---------------------------------------------------------------------
// TEMPORARY DEBUG INSTRUMENTATION — GoTrueClient internals.
// Do NOT refactor application code for this. This patches the actual
// GoTrueClient prototype (supabase.auth is an instance of it) at
// runtime — TypeScript's `private`/`protected` are compile-time only, so
// these methods are plain, patchable instance methods in the compiled
// build. This does not touch node_modules and does not change any
// application-level auth logic — it only wraps entry/return logging
// around the specific internal methods most likely to be where
// execution stalls, per direct reading of
// node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:
//   getSession -> _acquireLock -> __loadSession -> _callRefreshToken
// Whichever method logs ENTER with no matching RETURN/THROW is the
// exact function that never returns.
// ---------------------------------------------------------------------
(function instrumentGoTrueInternals() {
  // Turns on supabase-js's own built-in lock tracing (acquire/acquired/
  // released), a supported debug flag — not something we invented.
  try {
    localStorage.setItem('supabase.gotrue-js.locks.debug', 'true');
  } catch {
    // ignore — storage may be unavailable
  }

  const authProto = Object.getPrototypeOf(supabase.auth);
  const methodsToTrace = ['getSession', '_acquireLock', '__loadSession', '_callRefreshToken'];

  for (const methodName of methodsToTrace) {
    const original = authProto[methodName];
    if (typeof original !== 'function') {
      console.log(`[GOTRUE TRACE] ${methodName} not found on prototype — skipping`);
      continue;
    }

    authProto[methodName] = function (...args: unknown[]) {
      const callId = Math.random().toString(36).slice(2, 8);
      console.log(`[GOTRUE TRACE] ENTER ${methodName} #${callId}`, args.length ? args : '');
      let result: unknown;
      try {
        result = original.apply(this, args);
      } catch (syncErr) {
        console.log(`[GOTRUE TRACE] THROW (sync) ${methodName} #${callId}`, syncErr);
        throw syncErr;
      }

      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).then(
          (value) => {
            console.log(`[GOTRUE TRACE] RETURN ${methodName} #${callId}`);
            return value;
          },
          (err) => {
            console.log(`[GOTRUE TRACE] THROW (async) ${methodName} #${callId}`, err);
            throw err;
          }
        );
      }

      console.log(`[GOTRUE TRACE] RETURN (sync) ${methodName} #${callId}`);
      return result;
    };
  }

  console.log('[GOTRUE TRACE] instrumentation installed on', methodsToTrace);
})();
// ---------------------------------------------------------------------
// END TEMPORARY DEBUG INSTRUMENTATION
// ---------------------------------------------------------------------
