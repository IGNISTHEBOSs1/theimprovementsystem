import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Quest } from './useGameState';
import { Difficulty, getDifficultyRewards } from '@/lib/difficulty';
import { toast } from 'sonner';

const STORAGE_KEY = 'last-auto-task-generation-date';

interface GeneratedQuest {
  title: string;
  difficulty: Difficulty;
  timeFrame: string;
}

export const useAutoGenerateTasks = (
  gameState: GameState,
  addQuest: (quest: Omit<Quest, 'id' | 'completed' | 'failed' | 'createdAt'>) => void
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedToday, setHasGeneratedToday] = useState(() => {
    const lastDate = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    return lastDate === today;
  });

  const generateDailyTasks = useCallback(async () => {
    if (isGenerating || hasGeneratedToday) return;

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('No session, skipping auto task generation');
        setIsGenerating(false);
        return;
      }

      // Build context about habits and goals
      const habitContext = gameState.habits.length > 0
        ? `Current habits: ${gameState.habits.map(h => `${h.icon} ${h.name} (${h.streak} day streak)`).join(', ')}`
        : 'No habits yet.';

      // Display attribute levels so the AI receives readable stat context
      const statsContext = `Player attribute levels — FIT: Lv.${gameState.stats.FIT.level}, INT: Lv.${gameState.stats.INT.level}, DIS: Lv.${gameState.stats.DIS.level}, FOC: Lv.${gameState.stats.FOC.level}, SOC: Lv.${gameState.stats.SOC.level}, FIN: Lv.${gameState.stats.FIN.level}`;

      // Determine difficulty distribution based on level
      const getDifficultyGuidance = (level: number): string => {
        if (level <= 5)  return 'Focus on Trivial (40%) and Easy (60%) tasks. Build the habit of showing up.';
        if (level <= 15) return 'Mix of Easy (40%), Moderate (50%), Hard (10%). Introduce real challenges.';
        if (level <= 30) return 'Moderate (30%), Hard (60%), Elite (10%). Push beyond comfort.';
        if (level <= 50) return 'Hard (50%), Elite (40%), Moderate (10%). High-performance expectations.';
        return 'Elite (70%), Hard (30%). Maximum difficulty — only for the truly committed.';
      };

      const difficultyGuidance = getDifficultyGuidance(gameState.level);

      // XP is derived from difficulty in addQuest — only need title, difficulty, timeFrame
      const prompt = `Generate 3-5 personalized daily tasks for a self-improvement app.

${habitContext}
${statsContext}
Level: ${gameState.level}, Rank: ${gameState.rank}
Quests completed: ${gameState.totalQuestsCompleted}

DIFFICULTY GUIDELINES FOR LEVEL ${gameState.level}:
${difficultyGuidance}

Use ONLY these exact difficulty values: Trivial, Easy, Moderate, Hard, Elite
- Trivial: ~5 min tasks
- Easy: 5–15 min tasks
- Moderate: 15–45 min tasks
- Hard: 1+ hour tasks
- Elite: 2+ hour tasks

Return ONLY a JSON array, no other text. Each item: title (string with emoji), difficulty (string), timeFrame (string).
Example: [{"title":"🏃 Morning jog","difficulty":"Easy","timeFrame":"This morning"}]`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          type: 'generate_tasks',
          gameContext: {
            level: gameState.level,
            rank: gameState.rank,
            habits: gameState.habits,
            stats: gameState.stats,
            totalQuestsCompleted: gameState.totalQuestsCompleted,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      // Parse streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Extract JSON array from response
      const jsonMatch = fullContent.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const tasks: GeneratedQuest[] = JSON.parse(jsonMatch[0]);
        
        // Rewards are derived from difficulty in addQuest — no need to pass xpReward
        const VALID_DIFFICULTIES = ['Trivial', 'Easy', 'Moderate', 'Hard', 'Elite'];
        for (const task of tasks) {
          if (task.title && VALID_DIFFICULTIES.includes(task.difficulty)) {
            addQuest({
              title: task.title,
              difficulty: task.difficulty as Difficulty,
              xpReward: 0,       // overwritten by addQuest from getDifficultyRewards
              creditReward: 0,   // overwritten by addQuest from getDifficultyRewards
              timeFrame: task.timeFrame || 'Today',
            }, { skipDailyLimit: true }); // AI-generated quests bypass the manual daily cap
          }
        }

        // Mark as generated for today
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(STORAGE_KEY, today);
        setHasGeneratedToday(true);

        toast.success('Daily tasks generated!', {
          description: `${tasks.length} personalized tasks added for today`,
        });
      }
    } catch (error) {
      console.error('Failed to auto-generate tasks:', error);
      // Don't show error toast - this is a background feature
    } finally {
      setIsGenerating(false);
    }
  }, [gameState, addQuest, isGenerating, hasGeneratedToday]);

  return {
    generateDailyTasks,
    isGenerating,
    hasGeneratedToday,
  };
};
