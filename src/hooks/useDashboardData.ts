import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quest } from "@/types/quest";
import { Json } from "@/integrations/supabase/types";
import { getServerLocalDate } from "@/lib/serverTime";
import { comparePriorityThenCreatedAt } from "@/lib/priority";

// Founder Decision (multi-active Quest chunk): the account may have
// multiple Quests active simultaneously (replacing the earlier
// single-active-Quest constraint), capped here to prevent the Quest page
// from becoming an unbounded todo list. Deliberately a plain constant —
// not a setting, not per-priority-tier, not derived from anything.
export const MAX_ACTIVE_QUESTS = 5;

// Founder Decision (RPG removal / Trajectory finalization chunk):
// DashboardState no longer carries level, currentXp, maxXp, credits,
// totalQuestsCompleted, stats, or a persisted trajectory scalar. All were
// RPG-era or RPG-adjacent: level/XP/credits/stats had zero live
// consumers (confirmed — the one component that read them,
// QuietProgress, was itself dead code, never mounted); the persisted
// `trajectory` scalar duplicated what lib/trajectory.ts's
// deriveTrajectory() already computes correctly from `quests` alone,
// and was flagged as an unresolved dual-representation since the Journey
// chunk. Trajectory is now derived-only — there is exactly one
// implementation of "what is the user's trajectory," not two that could
// silently disagree. The DB columns themselves are left in place (no
// migration) per "prefer existing data structures before introducing
// migrations" — the app simply no longer selects, writes, or trusts them.
export interface DashboardState {
  quests: Quest[];
}

const emptyState: DashboardState = {
  quests: [],
};

// Founder Decision (Quest cadence chunk): recurrence is chosen as one of
// six named presets. Resolution happens here (hook level), not in the UI
// component, specifically so "Weekly" can use the server-authoritative
// weekday (see load()/commitToTodaysQuest below) rather than the
// client's own Date().getDay() — the entire point of the server-time
// system is that no recurrence-relevant date/weekday value is ever
// sourced from the client's clock.
export type CadencePreset = "Once" | "Daily" | "Weekdays" | "Weekends" | "Weekly" | "Custom";

function resolveRecurrenceDays(preset: CadencePreset, customDays: number[], todayWeekday: number): number[] | undefined {
  switch (preset) {
    case "Once": return undefined;
    case "Daily": return [0, 1, 2, 3, 4, 5, 6];
    case "Weekdays": return [1, 2, 3, 4, 5];
    case "Weekends": return [0, 6];
    case "Weekly": return [todayWeekday];
    case "Custom": return customDays.length > 0 ? customDays : undefined;
  }
}

// A quest expires when it was scoped to "Today" and its creation date is
// not today's date — it simply stops being eligible to act as the active/
// promoted quest. This does not mark it failed, delete it, or otherwise
// touch the stored record: the raw quest (title, createdAt, reward
// fields, everything) is left completely untouched so a later
// Goal/Trajectory chunk can still recover exactly what was missed and
// when, on its own terms. Quests with a timeFrame other than "Today"
// (none currently exist — every quest is created via commitToTodaysQuest
// — but the check is defensive) are never subject to this.
//
// Human label for the next day a recurring series becomes eligible again.
// Pure weekday arithmetic (mod 7), not Date-object manipulation:
// constructing a new Date from a server-local calendar date string and
// calling .getDay()/.setDate() on it would reinterpret that date through
// the CLIENT's own timezone, silently reintroducing exactly the
// client-timezone dependency the server-authoritative system exists to
// remove. Takes the already-correct current weekday as a plain number.
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function nextEligibleDayLabel(recurrenceDays: number[], fromWeekday: number): string {
  for (let offset = 1; offset <= 7; offset++) {
    const candidateWeekday = (fromWeekday + offset) % 7;
    if (recurrenceDays.includes(candidateWeekday)) {
      return offset === 1 ? "tomorrow" : WEEKDAY_NAMES[candidateWeekday];
    }
  }
  return "soon";
}


export function isQuestExpired(quest: Quest, today = new Date().toISOString().split("T")[0]): boolean {
  if (quest.completed || quest.failed) return false;
  if (quest.timeFrame !== "Today") return false;
  return quest.createdAt.split("T")[0] !== today;
}

// True if this Quest currently counts toward the account's active-Quest
// capacity: neither resolved (completed/failed) nor expired. Shared by
// the commit-time capacity guard, the recurrence continuation check, and
// `activeQuests` below — same definition, one place.
//
// `today` is REQUIRED, not defaulted, and must always be the caller's
// server-authoritative, user-timezone calendar date (serverLocal.dateStr).
// Root-cause bug fixed here: this function previously called
// isQuestExpired(quest) with no date, silently falling back to
// isQuestExpired's own default — the client's UTC calendar day. createdAt
// is stored as a UTC instant, so comparing its UTC date against a UTC
// "today" instead of the user's local "today" diverges for any non-UTC
// timezone (e.g. IST, UTC+5:30, where the UTC day rolls over at 5:30am
// local time, not local midnight). `activeQuests` (below) is recomputed on
// every render, not just once right after load() — so unlike a one-time
// post-load check, this WAS a second, continuously-reevaluated
// competing definition of "today," and a just-created recurring
// continuation (correctly dated via serverLocal in the sweep) could stop
// counting as active hours before the user's actual local day ended.
function occupiesActiveSlot(quest: Quest, today: string): boolean {
  return !quest.completed && !quest.failed && !isQuestExpired(quest, today);
}

// Founder Decision (Quest recurrence chunk): a recurring series survives
// every occurrence — completing or missing one does not end the series.
// The next occurrence appears automatically once (a) the series' most
// recent occurrence is resolved, (b) today (server-authoritative) is one
// of the series' recurrenceDays, (c) no occurrence for this series
// already exists today (idempotency — a second load the same day must
// not create a duplicate), and (d) the account has not reached
// MAX_ACTIVE_QUESTS active Quests.
//
// Founder Decision (multi-active Quest chunk): the single-active-Quest
// constraint this originally deferred to is gone. This now fills
// available active-Quest capacity across ALL eligible series in one
// sweep (previously: at most one continuation per sweep, globally, across
// every series) — a recurring series no longer silently waits behind an
// unrelated active Quest once room exists.
//
// todayStr/todayWeekday/nowInstant are all sourced from
// getServerLocalDate() by the caller (load(), below) — this function
// itself has no knowledge of clocks or timezones, only calendar-date
// comparisons, which keeps it trivially testable.
function nextOccurrencesToCreate(quests: Quest[], todayStr: string, todayWeekday: number, nowInstant: Date): Quest[] {
  const seriesIds = Array.from(
    new Set(quests.filter((q) => q.seriesId).map((q) => q.seriesId as string)),
  );

  const created: Quest[] = [];
  let activeCount = quests.filter((q) => occupiesActiveSlot(q, todayStr)).length;

  for (const seriesId of seriesIds) {
    if (activeCount >= MAX_ACTIVE_QUESTS) break;

    const occurrences = quests.filter((q) => q.seriesId === seriesId);
    const mostRecent = occurrences.reduce((latest, q) =>
      q.createdAt > latest.createdAt ? q : latest
    );

    const alreadyHasToday = occurrences.some((q) => q.createdAt.split("T")[0] === todayStr);
    const isResolved = mostRecent.completed || mostRecent.failed;
    const isEligibleToday = (mostRecent.recurrenceDays ?? []).includes(todayWeekday);

    if (isResolved && isEligibleToday && !alreadyHasToday) {
      const next: Quest = {
        ...mostRecent,
        id: crypto.randomUUID(),
        completed: false,
        failed: false,
        createdAt: nowInstant.toISOString(),
      };
      created.push(next);
      activeCount += 1;
    }
  }

  return created;
}

export function useDashboardData(userId?: string, timezone?: string | null) {
  const [state, setState] = useState<DashboardState>(emptyState);
  // The user's server-authoritative local calendar date, as of the last
  // successful load() — the same value load()'s own sweep already
  // computes via getServerLocalDate(timezone). `activeQuests` (below) is a
  // synchronous value re-derived on every render, so it cannot call the
  // async RPC itself; this is the one place that value is cached for it
  // to reuse, rather than activeQuests falling back to a client-clock
  // default (see occupiesActiveSlot). Null only before the first load
  // resolves, when state.quests is empty anyway.
  const [todayStr, setTodayStr] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  // Synchronous re-entrancy guard for the three write functions below.
  // `saving` (React state) is what the UI reads to disable buttons/show a
  // spinner, but state updates are batched — two rapid clicks can both
  // observe the same stale `saving === false` before the first click's
  // setSaving(true) has flushed. A ref has no such delay, so it's the
  // actual concurrency lock; `saving` remains the only thing consumers
  // ever read.
  const writeLockRef = useRef(false);
  // Distinguishes "load exhausted its retries without finding/reading a
  // row" from "still loading" and "loaded successfully". Without this,
  // a failed load was indistinguishable downstream from a genuinely new
  // account with default stats — the exact disguised-failure pattern
  // fetchProfile in AuthProvider was already fixed to avoid. Consumers
  // must check this before treating `state` as authoritative.
  const [error, setError] = useState(false);

  // Retries briefly (mirroring AuthProvider.fetchProfile) to cover the
  // same short window between a successful signup and the handle_new_user
  // trigger's row becoming visible to PostgREST. On exhaustion, `state` is
  // deliberately left untouched (not reset to emptyState) — if this is a
  // reload after a prior successful load, the last known-good state stays
  // visible rather than being silently replaced with fabricated defaults;
  // `error` is what callers must check, not the shape of `state`.
  const load = useCallback(async (attempts = 3, delayMs = 300) => {
    if (!userId) {
      setState(emptyState);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { data, error: dbError } = await supabase
        .from("game_state")
        .select("quests")
        .eq("user_id", userId)
        .maybeSingle();

      if (!dbError && data) {
        const loadedQuests = Array.isArray(data.quests) ? data.quests as unknown as Quest[] : [];
        // Server-authoritative clock: never the client's own Date(). See
        // @/lib/serverTime — this fetches the server's real UTC instant
        // and converts it through the user's stored IANA timezone.
        const serverLocal = await getServerLocalDate(timezone);
        setTodayStr(serverLocal.dateStr);

        // Sweep: any quest that is now expired-and-not-yet-marked-failed
        // gets marked failed exactly once. This is a real, persisted
        // write, not a derived value — Trajectory itself is derived
        // separately (see lib/trajectory.ts's deriveTrajectory), directly
        // from this same `quests` array, so marking a Quest failed here
        // is the only write this sweep needs to make correct.
        const toExpire = loadedQuests.filter((quest) => isQuestExpired(quest, serverLocal.dateStr));
        const expiredQuests = toExpire.length > 0
          ? loadedQuests.map((quest) => isQuestExpired(quest, serverLocal.dateStr) ? { ...quest, failed: true } : quest)
          : loadedQuests;

        // Continuation runs against the post-expiry quest list — a series
        // whose occurrence just got swept to failed above is immediately
        // eligible to continue in this same pass if today is a
        // recurrence day, rather than waiting for a second load.
        const toCreate = nextOccurrencesToCreate(expiredQuests, serverLocal.dateStr, serverLocal.weekday, serverLocal.instant);
        const sweptQuests = toCreate.length > 0 ? [...expiredQuests, ...toCreate] : expiredQuests;

        if (toExpire.length > 0 || toCreate.length > 0) {
          setState({ quests: sweptQuests });
          setError(false);
          setLoading(false);
          // Best-effort persistence of the sweep. If this write fails, the
          // in-memory state above is still correct for this session; the
          // same quests will simply be swept again (idempotently — marking
          // an already-expired quest failed again is a no-op in effect, and
          // nextOccurrencesToCreate's alreadyHasToday check makes
          // continuation idempotent the same way) on the next load.
          //
          // This failure is deliberately NOT surfaced through `error`: the
          // read that got us here already succeeded, and `error` is what
          // Dashboard/Quests use to show a full "we couldn't load your
          // progress" screen. Setting it here would hide a user's correct,
          // successfully-read state behind a false "unavailable" screen —
          // conflating a background housekeeping write failure with an
          // actual read failure, which is worse than the current silent
          // behavior. No existing mechanism can surface just this without
          // either that conflation or inventing a new UI pattern (e.g. a
          // non-blocking sync-status indicator), which is a product
          // decision this chunk doesn't authorize. Left unchanged —
          // reported instead.
          await supabase
            .from("game_state")
            .update({ quests: sweptQuests as unknown as Json })
            .eq("user_id", userId);
          return;
        }

        setState({ quests: loadedQuests });
        setError(false);
        setLoading(false);
        return;
      }
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    setError(true);
    setLoading(false);
  }, [userId, timezone]);

  useEffect(() => { void load(); }, [load]);

  // Completion: the constitutional recognition that reality has changed
  // (see Completion definition, §4 — "reality has been updated
  // accordingly... Nothing more is required"). This performs only the
  // reality change: marking the quest completed and persisting that
  // fact. It does not touch XP, credits, stats, level, or a trajectory
  // counter — none of those exist in DashboardState any more (see the
  // Founder Decision on DashboardState above). Trajectory for a
  // completed, goal-linked Quest becomes visible the next time
  // deriveTrajectory(state.quests) runs (Journey/Dashboard), because
  // `completed: true` on this Quest is now part of its input — no
  // separate counter to keep in sync.
  const completeQuest = useCallback(async (questId: string) => {
    if (!userId || writeLockRef.current) return { error: null };
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.completed) return { error: null };

    const nextQuests = state.quests.map((item) => item.id === questId ? { ...item, completed: true } : item);

    writeLockRef.current = true;
    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json })
      .eq("user_id", userId);

    if (dbError) await load();
    writeLockRef.current = false;
    setSaving(false);
    return { error: dbError };
  }, [load, state, userId]);

  // Founder Decision (Cancel/abandon chunk): an honest way to say "I'm
  // not doing this" — distinct from letting a Quest silently expire.
  // Deliberately narrower than completion/expiry:
  //   - Only a currently-active, unresolved Quest can be cancelled (not
  //     one already completed or failed — those are settled facts, not
  //     reversible).
  //   - Only a one-shot Quest (no seriesId). A recurring series has its
  //     own correct lifecycle (an occurrence resolves, the series
  //     continues on its next eligible day) — "cancelling" one
  //     occurrence of a series is a different, larger decision (does the
  //     whole series stop? just this occurrence?) that isn't asked for
  //     here and isn't invented.
  // The cancelled Quest is removed from the array entirely, not marked
  // with a new "cancelled" status. This keeps every existing evidence
  // computation (deriveTrajectory, deriveGoalStats, occupiesActiveSlot,
  // guidance) correct with zero changes — a withdrawn commitment was
  // never evidence of anything, so it's as if it had not been made,
  // exactly like discarding an unsent draft. Non-punitive by
  // construction: a cancelled Quest cannot appear as a "miss" anywhere,
  // because deriveTrajectory's evidence rule only ever sees
  // completed/failed Quests, and this one is neither.
  const cancelQuest = useCallback(async (questId: string) => {
    if (!userId || writeLockRef.current) return { error: null };
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.completed || quest.failed || quest.seriesId) return { error: null };

    const nextQuests = state.quests.filter((item) => item.id !== questId);

    writeLockRef.current = true;
    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json })
      .eq("user_id", userId);

    if (dbError) await load();
    writeLockRef.current = false;
    setSaving(false);
    return { error: dbError };
  }, [load, state, userId]);

  // Founder Decision (Quest domain model cleanup chunk): xpReward and
  // creditReward — RPG-era fields with no live consumer, fixed unseen
  // defaults previously set here (25/10) only because the Quest type
  // required them — are removed from the Quest model as of this chunk.
  // Nothing in the live app ever read them; the last write site was this
  // object literal.
  const commitToTodaysQuest = useCallback(async (commitment: string, linkedToGoal = false, cadence: CadencePreset = "Once", customDays: number[] = [], priority: Quest["priority"] = "Essential", goalName?: string) => {
    const trimmed = commitment.trim();
    if (!userId || writeLockRef.current || !trimmed) return { error: null };
    // Server-authoritative clock — see load() above for why this is
    // never the client's Date(). Fetched before the active-slot guard
    // below (not after, as this previously read) so that guard uses the
    // same user-timezone "today" as everything else, rather than
    // occupiesActiveSlot's UTC fallback — see occupiesActiveSlot's
    // comment for why that previously diverged from the user's actual
    // local calendar day.
    const serverLocal = await getServerLocalDate(timezone);

    // Founder Decision (multi-active Quest chunk): the account may hold
    // up to MAX_ACTIVE_QUESTS active Quests at once (replacing the
    // earlier one-active-Quest guard). A commit beyond the cap is a
    // silent no-op — the caller (Quests.tsx) disables the entry point at
    // the cap, but this guard is the actual enforcement, not the UI.
    const activeCount = state.quests.filter((q) => occupiesActiveSlot(q, serverLocal.dateStr)).length;
    if (activeCount >= MAX_ACTIVE_QUESTS) return { error: null };

    const recurrenceDays = resolveRecurrenceDays(cadence, customDays, serverLocal.weekday);
    const isRecurring = Boolean(recurrenceDays && recurrenceDays.length > 0);
    const quest: Quest = {
      id: crypto.randomUUID(),
      title: trimmed,
      priority,
      timeFrame: "Today",
      linkedToGoal,
      ...(linkedToGoal && goalName ? { goalName } : {}),
      completed: false,
      failed: false,
      createdAt: serverLocal.instant.toISOString(),
      ...(isRecurring ? { seriesId: crypto.randomUUID(), recurrenceDays } : {}),
    };

    const nextQuests = [...state.quests, quest];
    writeLockRef.current = true;
    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json })
      .eq("user_id", userId);

    if (dbError) await load();
    writeLockRef.current = false;
    setSaving(false);
    return { error: dbError };
  }, [load, state, userId, timezone]);

  // Founder Decision (multi-active Quest chunk): up to MAX_ACTIVE_QUESTS
  // Quests may be active at once (replacing the earlier one-active-Quest
  // constraint, where this returned a single Quest or undefined).
  // Ordered by priority rank then createdAt (see comparePriorityThenCreatedAt)
  // — index 0 is the account's highest-priority active Quest, i.e. the
  // Dashboard's primary focus; the rest are the "accessible below it"
  // Quests. Uses the cached server-local `todayStr` (see above), not a
  // client clock default — this is the fix for the earlier reported bug:
  // a recurring Quest's continuation was created correctly against the
  // user's local calendar day, but this line previously re-checked expiry
  // against the client's UTC day on every render, causing it to silently
  // stop showing as active before the user's actual local day was over.
  const activeQuests = todayStr
    ? state.quests.filter((q) => occupiesActiveSlot(q, todayStr)).sort(comparePriorityThenCreatedAt)
    : [];

  // Founder Decision (Recovery/Guidance chunk): the single most recent
  // failed Quest, if any — used by RecoveryState to differentiate "just
  // missed something" from "never started" (previously both states
  // showed identical copy). Deliberately not filtered to one-shot only
  // here; the recommit affordance (only offered for non-recurring
  // Quests, since a recurring series already self-resumes on its next
  // eligible day) is decided by the caller, not this derivation.
  const lastMissedQuest = state.quests
    .filter((q) => q.failed)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return {
    state, loading, error, saving, activeQuests, lastMissedQuest, completeQuest, cancelQuest, commitToTodaysQuest, reload: load,
  };
}
