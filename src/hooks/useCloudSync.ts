import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GameState } from './useGameState';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export const useCloudSync = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { user } = useAuth();
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef<number>(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

  // Load game state from Supabase — always, on every login
  const loadFromCloud = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load cloud state:', error);
        return null;
      }

      if (data) {
        const statsData = data.stats as Record<string, number>;
        const cloudState: GameState = {
          username: 'Hunter',
          level: data.level,
          rank: data.rank,
          currentXp: data.current_xp,
          maxXp: data.max_xp,
          credits: data.credits,
          stats: {
            FIT: statsData?.FIT ?? 0,
            SOC: statsData?.SOC ?? 0,
            INT: statsData?.INT ?? 0,
            DIS: statsData?.DIS ?? 0,
            FOC: statsData?.FOC ?? 0,
            FIN: statsData?.FIN ?? 0,
          },
          quests: (data.quests as unknown as GameState['quests']) || [],
          habits: (data.habits as unknown as GameState['habits']) || [],
          systemMessages: (data.system_messages as unknown as GameState['systemMessages']) || [],
          totalQuestsCompleted: data.total_quests_completed,
          lastQuestResetDate: new Date().toISOString().split('T')[0],
        };
        return cloudState;
      }

      return null;
    } catch (error) {
      console.error('Cloud load error:', error);
      return null;
    }
  }, [user]);

  // Save game state to Supabase with debouncing
  const saveToCloud = useCallback(async (state: GameState) => {
    if (!user || syncInProgress.current || !initialLoadDone.current) return;

    const now = Date.now();
    if (now - lastSyncTime.current < 2000) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => saveToCloud(state), 2000);
      return;
    }

    syncInProgress.current = true;
    lastSyncTime.current = now;

    try {
      const statsJson: Record<string, number> = { ...state.stats };
      const questsJson = state.quests.map(q => ({ ...q })) as unknown as Json;
      const habitsJson = state.habits.map(h => ({ ...h })) as unknown as Json;
      const messagesJson = state.systemMessages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      })) as unknown as Json;

      const { error } = await supabase
        .from('game_state')
        .update({
          level: state.level,
          rank: state.rank,
          current_xp: state.currentXp,
          max_xp: state.maxXp,
          credits: state.credits,
          stats: statsJson as Json,
          quests: questsJson,
          habits: habitsJson,
          system_messages: messagesJson,
          total_quests_completed: state.totalQuestsCompleted,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to save to cloud:', error);
      }
    } catch (error) {
      console.error('Cloud save error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [user]);

  // Load from Supabase on login — always, no conditions
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      loadFromCloud().then((cloudState) => {
        if (cloudState) {
          setGameState(prev => ({
            ...cloudState,
            username: prev.username,
          }));
          toast.success('Progress loaded!');
        }
        initialLoadDone.current = true;
      });
    }

    // Reset on logout
    if (!user) {
      initialLoadDone.current = false;
    }
  }, [user, loadFromCloud, setGameState]);

  // Auto-save whenever game state changes (after initial load)
  useEffect(() => {
    if (user && initialLoadDone.current) {
      saveToCloud(gameState);
    }
  }, [user, gameState, saveToCloud]);

  return { loadFromCloud, saveToCloud };
};
