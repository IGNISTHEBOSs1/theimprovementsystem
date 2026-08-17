-- Server-authoritative timezone system (Quest recurrence/expiry chunk).
-- The device timezone is used only to identify the user's INTENDED IANA
-- zone (e.g. 'Asia/Kolkata') — it is captured once client-side via
-- Intl.DateTimeFormat().resolvedOptions().timeZone and stored here.
-- The authoritative clock is the server's UTC timestamp (get_server_time
-- below), never the client's Date(). The client converts that server
-- timestamp through this stored IANA zone (via Intl.DateTimeFormat) to
-- derive the user's current local calendar date/weekday for recurrence
-- and expiry evaluation.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone text;

-- Returns the server's current UTC timestamp. STABLE (not VOLATILE) is
-- deliberately not used here — the whole point is a fresh, real "now" on
-- every call, so this is intentionally left at the default (VOLATILE).
-- SECURITY INVOKER (the default) is correct: this returns no user data,
-- just the server clock, so there's nothing to scope by caller.
CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS timestamptz
LANGUAGE sql
AS $$
  SELECT now();
$$;

GRANT EXECUTE ON FUNCTION public.get_server_time() TO authenticated;
