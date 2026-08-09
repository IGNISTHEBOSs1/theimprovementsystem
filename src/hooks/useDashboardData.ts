import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quest } from "./useGameState";
import { applyXpDelta } from "@/lib/progression";
import { PlayerStats, inferStatCategory, getStatGainForDifficulty, applyStatGain } from "@/lib/attributes";
import { useAchievements } from "@/hooks/useAchievements";
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

export function useDashboardData(userId?: string) {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
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

        // Sweep: any quest that is now expired-and-not-yet-marked-failed
        // gets marked failed exactly once, and trajectory moves for the
        // ones that were linked to the goal. This is a real, persisted
        // write, not a derived value — see Chunk 3 report for why Chunk 2
        // deliberately deferred this exact decision until there was a
        // concrete consumer (trajectory) that needed it.
        const toExpire = loadedQuests.filter((quest) => isQuestExpired(quest));
        if (toExpire.length > 0) {
          const sweptQuests = loadedQuests.map((quest) =>
            isQuestExpired(quest) ? { ...quest, failed: true } : quest
          );
          const trajectoryDelta = toExpire.filter((quest) => quest.linkedToGoal).length * -TRAJECTORY_STEP;
          const sweptTrajectory = loadedTrajectory + trajectoryDelta;

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
          // an already-expired quest failed again is a no-op in effect) on
          // the next load.
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
    if (!userId || saving) return { error: null };
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.completed) return { error: null };

    const nextQuests = state.quests.map((item) => item.id === questId ? { ...item, completed: true } : item);
    const nextTrajectory = quest.linkedToGoal ? state.trajectory + TRAJECTORY_STEP : state.trajectory;

    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests, trajectory: nextTrajectory }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json, trajectory: nextTrajectory })
      .eq("user_id", userId);

    if (dbError) await load();
    setSaving(false);
    return { error: dbError };
  }, [load, saving, state, userId]);

  // Progression: XP, level, stat gain, and credits for a quest. This is
  // reward/progression logic, not reality-change — Completion's identity
  // explicitly excludes it ("Completion must never become a reward
  // system... Everything that follows belongs elsewhere"). Isolated here,
  // unchanged from the prior completeQuest implementation, and not
  // invoked by anything yet. It exists so a future Recognition experience
  // has a single place to call into — this function does not constitute
  // that experience; it's only the mechanics Recognition would need.
  const applyQuestProgression = useCallback(async (questId: string) => {
    if (!userId || saving) return { error: null };
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest) return { error: null };

    const progression = applyXpDelta(state, quest.xpReward);
    const statCategory = quest.statCategory || inferStatCategory(quest.title);
    const nextStats = applyStatGain(state.stats, statCategory, getStatGainForDifficulty(quest.difficulty));
    const nextState = {
      ...state,
      level: progression.level,
      currentXp: progression.currentXp,
      maxXp: progression.maxXp,
      credits: state.credits + quest.creditReward,
      totalQuestsCompleted: state.totalQuestsCompleted + 1,
      stats: nextStats,
    };

    setSaving(true);
    setState(nextState);
    const { error: dbError } = await supabase
      .from("game_state")
      .update({
        level: progression.level,
        current_xp: progression.currentXp,
        max_xp: progression.maxXp,
        credits: nextState.credits,
        total_quests_completed: nextState.totalQuestsCompleted,
        stats: nextStats as unknown as Json,
      })
      .eq("user_id", userId);

    if (dbError) await load();
    setSaving(false);
    return { error: dbError };
  }, [load, saving, state, userId]);

  // Milestone 2 — First Mission: "Direction → Choice → Commitment." This is
  // not a create-Quest operation — it's the persistence of a deliberate
  // commitment the user has already made. The user's own words are the
  // commitment itself; the System does not suggest, generate, or pre-fill
  // them, preserving the autonomy the Quest definition requires.
  // difficulty/xpReward/creditReward are fixed, unseen-at-commit-time
  // defaults: they exist only because the existing Quest type (and the
  // completion path this milestone does not touch) requires them, not
  // because this milestone introduces reward mechanics.
  const commitToTodaysQuest = useCallback(async (commitment: string, linkedToGoal = false) => {
    const trimmed = commitment.trim();
    if (!userId || saving || !trimmed) return { error: null };

    const quest: Quest = {
      id: crypto.randomUUID(),
      title: trimmed,
      difficulty: "Normal",
      xpReward: 25,
      creditReward: 10,
      timeFrame: "Today",
      linkedToGoal,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
    };

    const nextQuests = [...state.quests, quest];
    setSaving(true);
    setState((prev) => ({ ...prev, quests: nextQuests }));
    const { error: dbError } = await supabase
      .from("game_state")
      .update({ quests: nextQuests as unknown as Json })
      .eq("user_id", userId);

    if (dbError) await load();
    setSaving(false);
    return { error: dbError };
  }, [load, saving, state, userId]);

  // Achievements are evaluated against the canonical live state and persist
  // to game_state.achievements — the single source of truth (TIS-INFRA-005).
  // habits is passed as an empty array: the live app has no connected habit
  // data (see TIS-INFRA-001), so habit/streak-based achievements cannot
  // unlock here until that system is separately reconnected. This is not a
  // fabricated value — it accurately reflects that zero habits currently
  // exist in the live application.
  const { achievements, newlyUnlocked, dismissNotification, unlockedCount, totalCount } = useAchievements(
    userId,
    {
      level: state.level,
      totalQuestsCompleted: state.totalQuestsCompleted,
      credits: state.credits,
      currentXp: state.currentXp,
      stats: state.stats,
      habits: [],
    },
  );

  // Multiple quests may be active simultaneously (no cap is imposed here —
  // see report). "Today's Quest" selection: goal-linked active quests are
  // preferred; among those (or, if none, among all active quests), the
  // earliest by creation order (array order) wins. This is the full
  // selection rule — no scoring, no inference from quest text.
  const activeQuests = state.quests.filter(
    (quest) => !quest.completed && !quest.failed && !isQuestExpired(quest)
  );
  const goalLinkedActiveQuests = activeQuests.filter((quest) => quest.linkedToGoal);
  const todaysQuest = goalLinkedActiveQuests[0] ?? activeQuests[0];

  return {
    state, loading, error, saving, activeQuests, todaysQuest, completeQuest, applyQuestProgression, commitToTodaysQuest, reload: load,
    achievements, newlyUnlocked, dismissNotification, unlockedCount, totalCount,
  };
}
