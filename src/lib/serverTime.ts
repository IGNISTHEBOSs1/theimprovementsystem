import { supabase } from "@/integrations/supabase/client";

export interface ServerLocalDate {
  // The authoritative instant this was derived from — the server's real
  // UTC time (or the client-clock fallback, see fetchServerNow). Use
  // this, not a client-constructed Date, when a real ISO timestamp is
  // needed (e.g. a new Quest occurrence's createdAt).
  instant: Date;
  // Calendar date in the user's local timezone, YYYY-MM-DD — the same
  // shape isQuestExpired/nextOccurrencesToCreate already compare against
  // createdAt with, so callers don't need to know this involves a
  // timezone conversion at all.
  dateStr: string;
  // 0=Sun..6=Sat in the user's local timezone — matches recurrenceDays'
  // existing convention exactly. Deliberately a plain number, not a
  // Date object: constructing a new Date from dateStr and calling
  // .getDay()/.getDate() on it would reinterpret that calendar date
  // through the CLIENT's own timezone, silently reintroducing the exact
  // client-timezone dependency this system exists to remove. Every
  // caller that needs "what weekday is it" or "what's the next eligible
  // day" should do pure integer arithmetic on this field, never round-
  // trip through a new Date().
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

// Detects the device's IANA timezone once, client-side. This identifies
// the user's INTENDED zone only — it is never used as the authoritative
// clock. If detection fails for any reason, 'UTC' is a safe, valid IANA
// zone to fall back to rather than leaving the column null.
export function detectDeviceTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}

// The authoritative clock: the server's real UTC timestamp, fetched via
// RPC rather than trusting the client's own Date(). Every call is a
// fresh round-trip on purpose — this is the actual current moment, not a
// cached one.
async function fetchServerNow(): Promise<Date> {
  const { data, error } = await supabase.rpc("get_server_time");
  if (error || !data) {
    // If the server clock is unreachable, falling back to the client's
    // own clock is strictly better than blocking Quest expiry/recurrence
    // entirely — this is a degraded-but-functional fallback, not a
    // silent correctness claim. Reliability requirements (see
    // useDashboardData's load()) mean a read failure here must not
    // surface as a fabricated "everything is fine" state elsewhere; it
    // simply means this specific sweep pass uses client time instead of
    // server time for that one pass.
    return new Date();
  }
  return new Date(data as string);
}

// Converts an authoritative UTC instant through the given IANA timezone
// to the local calendar date and weekday. Pure function, no I/O, no
// dependency on the RPC above — testable and reusable independent of
// where the "now" instant came from.
export function toServerLocalDate(utcInstant: Date, timezone: string): ServerLocalDate {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = formatter.formatToParts(utcInstant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  const weekday = WEEKDAY_INDEX[get("weekday")] ?? utcInstant.getUTCDay();
  return { instant: utcInstant, dateStr, weekday };
}

// The single entry point most callers should use: fetch the
// authoritative server instant, then convert it through the user's
// stored timezone. If timezone is null/undefined (not yet detected —
// see AuthProvider), falls back to UTC rather than blocking Quest
// evaluation entirely; the profile effect detects and persists a real
// value on first authenticated use, so this fallback is transient, not
// the steady state.
export async function getServerLocalDate(timezone: string | null | undefined): Promise<ServerLocalDate> {
  const now = await fetchServerNow();
  return toServerLocalDate(now, timezone || "UTC");
}
