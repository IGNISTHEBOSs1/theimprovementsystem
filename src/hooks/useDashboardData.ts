import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quest } from "@/types/quest";
import { PlayerStats } from "@/lib/attributes";
import { Json } from "@/integrations/supabase/types";

export interface DashboardState {
  level: number;
  currentXp: number;
  maxXp: number;
  credits: number;
  totalQuestsCompleted: number;
  quests: Quest[];
  stats: PlayerStats;
  // Single running counter representing movement relative to the user's
  // primary goal. Only goal-linked quests affect it — see Chunk 3 report.
  // Not a score, not gamified further (no multipliers, no decay curve).
  trajectory: number;
}

const emptyState: DashboardState = {
  level: 1,
  currentXp: 0,
  maxXp: 1000,
  credits: 0,
  totalQuestsCompleted: 0,
  quests: [],
  stats: { FIT: 50, SOC: 50, INT: 50, DIS: 50, FOC: 50, FIN: 50 },
  trajectory: 0,
};

// Chosen default, not a derived constant — flagged in the Chunk 3 report
// for founder review. Symmetric (+1 on completing a goal-linked quest,
// -1 on one expiring) specifically to avoid trajectory reading as a
// punishment system: a miss costs exactly what a completion is worth,
// nothing more.
const TRAJECTORY_STEP = 1;

// A quest expires when it was scoped to "Today" and its creation date is
// not today's date — it simply stops being eligible to act as the active/
// promoted quest. This does not mark it failed, delete it, or otherwise
// touch the stored record: the raw quest (title, createdAt, reward
// fields, everything) is left completely untouched so a later
// Goal/Trajectory chunk can still recover exactly what was missed and
// when, on its own terms. Quests with a timeFrame other than "Today"
// (none currently exist — every quest is created via commitToTodaysQuest
// — but the check is defensive) are never subject to this.
export function isQuestExpired(quest: Quest, today = new Date().toISOString().split("T")[0]): boolean {
  if (quest.completed || quest.failed) return false;
  if (quest.timeFrame !== "Today") return false;
  return quest.createdAt.split("T")[0] !== today;
}

// A quest occupies the single active slot if it's neither resolved nor
// expired. Shared by the singleton-commit guard and the recurrence
// continuation check below — same definition, one place.
function occupiesActiveSlot(quest: Quest): boolean {
  return !quest.completed && !quest.failed && !isQuestExpired(quest);
}

// Founder Decision (Quest recurrence chunk): a recurring series survives
// every occurrence — completing or missing one does not end the series.
// The next occurrence appears automatically once (a) the series' most
// recent occurrence is resolved, (b) today is one of the series'
// recurrenceDays, (c) no occurrence for this series already exists today
// (idempotency — a second load the same day must not create a duplicate),
// and (d) no other quest currently occupies the single active slot (the
// P0 singleton constraint is global, not per-series — a recurring
// series simply waits for its turn if the user has something else
// active, exactly like any other commitment would).
function nextOccurrencesToCreate(quests: Quest[], today: Date): Quest[] {
  const todayStr = today.toISOString().split("T")[0];
  const todayWeekday = today.getDay();

  const seriesIds = Array.from(
    new Set(quests.filter((q) => q.seriesId).map((q) => q.seriesId as string)),
  );

  const created: Quest[] = [];
  let slotTaken = quests.some(occupiesActiveSlot);

  for (const seriesId of seriesIds) {
    if (slotTaken) break;

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
        createdAt: today.toISOString(),
      };
      created.push(next);
      slotTaken = true;
    }
  }

  return created;
}

export function useDashboardData(userId?: string) {
  const [state, setState] = useState<DashboardState>(emptyState);
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
        .select("level, current_xp, max_xp, credits, total_quests_completed, quests, stats, trajectory")
        .eq("user_id", userId)
        .maybeSingle();

      if (!dbError && data) {
        const loadedQuests = Array.isArray(data.quests) ? data.quests as unknown as Quest[] : [];
        const loadedTrajectory = typeof data.trajectory === "number" ? data.trajectory : 0;
        const now = new Date();

        // Sweep: any quest that is now expired-and-not-yet-marked-failed
        // gets marked failed exactly once, and trajectory moves for the
        // ones that were linked to the goal. This is a real, persisted
        // write, not a derived value — see Chunk 3 report for why Chunk 2
        // deliberately deferred this exact decision until there was a
        // concrete consumer (trajectory) that needed it.
        const toExpire = loadedQuests.filter((quest) => isQuestExpired(quest));
        const expiredQuests = toExpire.length > 0
          ? loadedQuests.map((quest) => isQuestExpired(quest) ? { ...quest, failed: true } : quest)
          : loadedQuests;
        const trajectoryDelta = toExpire.filter((quest) => quest.linkedToGoal).length * -TRAJECTORY_STEP;

        // Continuation runs against the post-expiry quest list — a series
        // whose occurrence just got swept to failed above is immediately
        // eligible to continue in this same pass if today is a
        // recurrence day, rather than waiting for a second load.
        const toCreate = nextOccurrencesToCreate(expiredQuests, now);
        const sweptQuests = toCreate.length > 0 ? [...expiredQuests, ...toCreate] : expiredQuests;
        const sweptTrajectory = loadedTrajectory + trajectoryDelta;

        if (toExpire.length > 0 || toCreate.length > 0) {
          setState({
            level: data.level,
            currentXp: data.current_xp,
            maxXp: data.max_xp,
            credits: data.credits,
            totalQuestsCompleted: data.total_quests_completed,
            quests: sweptQuests,
            stats: data.stats && typeof data.stats === "object" && !Array.isArray(data.stats)
              ? { ...emptyState.stats, ...(data.stats as unknown as Partial<PlayerStats>) }
              : emptyState.stats,
            trajectory: sweptTrajectory,
          });
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
            .update({ quests: sweptQuests as unknown as Json, trajectory: sweptTrajectory })
            .eq("user_id", userId);
          return;
        }

        setState({
          level: data.level,
          currentXp: data.current_xp,
          maxXp: data.max_xp,
          credits: data.credits,
          totalQuestsCompleted: data.total_quests_completed,
          quests: loadedQuests,
          stats: data.stats && typeof data.stats === "object" && !Array.isArray(data.stats)
            ? { ...emptyState.stats, ...(data.stats as unknown as Partial<PlayerStats>) }
            : emptyState.stats,
          trajectory: loadedTrajectory,
        });
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
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  // Completion: the constitutional recognition that reality has changed
  // (see Completion definition, §4 — "reality has been updated
  // accordingly... Nothing more is required"). This performs only the
  // reality change: marking the quest completed and persisting that fact.
  // It does not touch XP, credits, stats, or level — see
  // applyQuestProgression below for that, which this function does not
  // call.
  const completeQuest = useCallback(async (questId: string) => {
    if (!userId || writeLockRef.current) return { error: null };
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.completed) return { error: null };

    const nextQuests = state.quests.map((item) => item.id === questId ? { ...item, completed: true } : item);
    const nextTrajectory = quest.linkedToGoal ? state.trajectory + TRAJECTORY_STEP : state.trajectory;

    writeLockRef.current = true;
    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests, trajectory: nextTrajectory }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json, trajectory: nextTrajectory })
      .eq("user_id", userId);

    if (dbError) await load();
    writeLockRef.current = false;
    setSaving(false);
    return { error: dbError };
  }, [load, state, userId]);

  // Milestone 2 — First Mission: "Direction → Choice → Commitment." This is
  // not a create-Quest operation — it's the persistence of a deliberate
  // commitment the user has already made. The user's own words are the
  // commitment itself; the System does not suggest, generate, or pre-fill
  // them, preserving the autonomy the Quest definition requires.
  // xpReward/creditReward are fixed, unseen-at-commit-time defaults: they
  // exist only because the existing Quest type (and the completion path
  // this milestone does not touch) requires them, not because this
  // milestone introduces reward mechanics. priority, by contrast, is
  // explicit and user-set (Founder Decision, Quest priority chunk) — not
  // a fixed default, and not a stand-in for difficulty/duration/urgency/
  // age, which TIS does not track.
  const commitToTodaysQuest = useCallback(async (commitment: string, linkedToGoal = false, recurrenceDays?: number[], priority: Quest["priority"] = "Essential") => {
    const trimmed = commitment.trim();
    if (!userId || writeLockRef.current || !trimmed) return { error: null };
    // P0 Decision B — one active Quest at a time. A second commitment
    // cannot be made while one is already active; the caller (Quests.tsx)
    // shouldn't offer the option in this state, but this guard is the
    // actual enforcement, not the UI.
    const hasActiveQuest = state.quests.some(occupiesActiveSlot);
    if (hasActiveQuest) return { error: null };

    const isRecurring = Boolean(recurrenceDays && recurrenceDays.length > 0);
    const quest: Quest = {
      id: crypto.randomUUID(),
      title: trimmed,
      priority,
      xpReward: 25,
      creditReward: 10,
      timeFrame: "Today",
      linkedToGoal,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
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
  }, [load, state, userId]);

  // P0 Decision B — one active Quest at a time. `activeQuest` is that
  // Quest, if one exists (not completed, not failed, not expired). No
  // selection/ranking logic — there is nothing to choose among.
  const activeQuest = state.quests.find(occupiesActiveSlot);

  return {
    state, loading, error, saving, activeQuest, completeQuest, commitToTodaysQuest, reload: load,
  };
}
