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
}

const emptyState: DashboardState = {
  level: 1,
  currentXp: 0,
  maxXp: 1000,
  credits: 0,
  totalQuestsCompleted: 0,
  quests: [],
  stats: { FIT: 50, SOC: 50, INT: 50, DIS: 50, FOC: 50, FIN: 50 },
};

export function useDashboardData(userId?: string) {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setState(emptyState);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("game_state")
      .select("level, current_xp, max_xp, credits, total_quests_completed, quests, stats")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setState({
        level: data.level,
        currentXp: data.current_xp,
        maxXp: data.max_xp,
        credits: data.credits,
        totalQuestsCompleted: data.total_quests_completed,
        quests: Array.isArray(data.quests) ? data.quests as unknown as Quest[] : [],
        stats: data.stats && typeof data.stats === "object" && !Array.isArray(data.stats)
          ? { ...emptyState.stats, ...(data.stats as unknown as Partial<PlayerStats>) }
          : emptyState.stats,
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const completeQuest = useCallback(async (questId: string) => {
    if (!userId || saving) return;
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.completed) return;

    const nextQuests = state.quests.map((item) => item.id === questId ? { ...item, completed: true } : item);
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
      quests: nextQuests,
      stats: nextStats,
    };

    setSaving(true);
    setState(nextState);
    const { error } = await supabase
      .from("game_state")
      .update({
        level: progression.level,
        current_xp: progression.currentXp,
        max_xp: progression.maxXp,
        credits: nextState.credits,
        total_quests_completed: nextState.totalQuestsCompleted,
        quests: nextQuests as unknown as Json,
        stats: nextStats as unknown as Json,
      })
      .eq("user_id", userId);

    if (error) await load();
    setSaving(false);
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

  return {
    state, loading, saving, completeQuest,
    achievements, newlyUnlocked, dismissNotification, unlockedCount, totalCount,
  };
}
