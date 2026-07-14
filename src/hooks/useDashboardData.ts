import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getXpForLevel, Quest } from "./useGameState";
import { Json } from "@/integrations/supabase/types";

export interface DashboardState {
  level: number;
  currentXp: number;
  maxXp: number;
  credits: number;
  totalQuestsCompleted: number;
  quests: Quest[];
}

const emptyState: DashboardState = {
  level: 1,
  currentXp: 0,
  maxXp: 1000,
  credits: 0,
  totalQuestsCompleted: 0,
  quests: [],
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
      .select("level, current_xp, max_xp, credits, total_quests_completed, quests")
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
    let nextXp = state.currentXp + quest.xpReward;
    let nextLevel = state.level;
    let nextMaxXp = state.maxXp;
    while (nextXp >= nextMaxXp) {
      nextXp -= nextMaxXp;
      nextLevel += 1;
      nextMaxXp = getXpForLevel(nextLevel);
    }
    const nextState = {
      ...state,
      level: nextLevel,
      currentXp: nextXp,
      maxXp: nextMaxXp,
      credits: state.credits + quest.creditReward,
      totalQuestsCompleted: state.totalQuestsCompleted + 1,
      quests: nextQuests,
    };

    setSaving(true);
    setState(nextState);
    const { error } = await supabase
      .from("game_state")
      .update({
        level: nextLevel,
        current_xp: nextXp,
        max_xp: nextMaxXp,
        credits: nextState.credits,
        total_quests_completed: nextState.totalQuestsCompleted,
        quests: nextQuests as unknown as Json,
      })
      .eq("user_id", userId);

    if (error) await load();
    setSaving(false);
  }, [load, saving, state, userId]);

  return { state, loading, saving, completeQuest };
}
