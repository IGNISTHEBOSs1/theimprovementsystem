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
// TEMPORARY DEBUG INSTRUMENTATION — caller identification only.
// Patches supabase.auth.getSession() (the public method — same runtime
// patchability rationale as before: TS `private`/`protected` are
// compile-time only) to capture a full JS stack trace at the moment of
// each call, before any await happens. This does not touch any other
// GoTrueClient internals and does not change application behavior —
// it only observes who is calling getSession() and how many times.
// ---------------------------------------------------------------------
(function traceGetSessionCallers() {
  // Clean up: a previous instrumentation round enabled supabase-js's
  // built-in lock debug flag. That instrumentation is retired now, so
  // turn it back off to keep this round's output scoped to exactly what
  // was asked for.
  try {
    localStorage.removeItem('supabase.gotrue-js.locks.debug');
  } catch {
    // ignore — storage may be unavailable
  }

  const authProto = Object.getPrototypeOf(supabase.auth);
  const originalGetSession = authProto.getSession;

  if (typeof originalGetSession !== 'function') {
    console.log('[GETSESSION TRACE] getSession not found on prototype — skipping');
    return;
  }

  let callCount = 0;

  authProto.getSession = function (...args: unknown[]) {
    callCount += 1;
    const callNumber = callCount;
    // Captured synchronously, at the exact call site, before any await —
    // this is the real caller's stack, not anything inside GoTrueClient.
    const stack = new Error(`getSession call #${callNumber}`).stack;
    console.log(`[GETSESSION TRACE] getSession CALL #${callNumber}`);
    console.log(stack);

    return originalGetSession.apply(this, args);
  };

  console.log('[GETSESSION TRACE] instrumentation installed');
})();
// ---------------------------------------------------------------------
// END TEMPORARY DEBUG INSTRUMENTATION
// ---------------------------------------------------------------------
