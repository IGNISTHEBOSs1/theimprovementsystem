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

  // Load game state from cloud on login
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
          username: gameState.username,
          level: data.level,
          rank: data.rank,
          currentXp: data.current_xp,
          maxXp: data.max_xp,
          credits: data.credits,
          stats: {
            FIT: statsData?.FIT ?? 50,
            SOC: statsData?.SOC ?? 50,
            INT: statsData?.INT ?? 50,
            DIS: statsData?.DIS ?? 50,
            FOC: statsData?.FOC ?? 50,
            FIN: statsData?.FIN ?? 50,
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
  }, [user, gameState.username]);

  // Save game state to cloud with debouncing
  const saveToCloud = useCallback(async (state: GameState) => {
    if (!user || syncInProgress.current) return;
    
    // Debounce: don't sync more than once per 2 seconds
    const now = Date.now();
    if (now - lastSyncTime.current < 2000) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => saveToCloud(state), 2000);
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      // Convert to JSON-compatible format
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

  // Initial load from cloud when user logs in
  useEffect(() => {
    if (user) {
      loadFromCloud().then((cloudState) => {
        if (cloudState) {
          // Only update if cloud has meaningful data (level > 1 or has quests/habits)
          const hasCloudProgress = cloudState.level > 1 || 
            cloudState.quests.length > 0 || 
            cloudState.habits.length > 0 ||
            cloudState.totalQuestsCompleted > 0;
          
          if (hasCloudProgress) {
            setGameState(prev => ({
              ...cloudState,
              username: prev.username,
            }));
            toast.success('Progress loaded from cloud!');
          }
        }
      });
    }
  }, [user, loadFromCloud, setGameState]);

  // Auto-sync when game state changes
  useEffect(() => {
    if (user && gameState) {
      saveToCloud(gameState);
    }
  }, [user, gameState, saveToCloud]);

  return {
    loadFromCloud,
    saveToCloud,
  };
};
