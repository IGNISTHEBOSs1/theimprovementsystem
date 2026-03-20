import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Quest } from './useGameState';
import { toast } from 'sonner';

const STORAGE_KEY = 'last-auto-task-generation-date';

interface GeneratedQuest {
  title: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Urgent';
  xpReward: number;
  creditReward: number;
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

      const statsContext = `Player stats - FIT: ${gameState.stats.FIT}, INT: ${gameState.stats.INT}, DIS: ${gameState.stats.DIS}, FOC: ${gameState.stats.FOC}, SOC: ${gameState.stats.SOC}, FIN: ${gameState.stats.FIN}`;

      // Determine difficulty distribution based on level
      const getDifficultyGuidance = (level: number): string => {
        if (level <= 5) return "Focus on EASY tasks (70%) with some NORMAL (30%). Keep tasks simple and achievable to build momentum.";
        if (level <= 15) return "Mix of EASY (30%), NORMAL (50%), HARD (20%). Start introducing moderate challenges.";
        if (level <= 30) return "Mostly NORMAL (40%) and HARD (50%), with occasional URGENT (10%). Push boundaries with compound tasks.";
        if (level <= 50) return "Primarily HARD (60%) and URGENT (30%), some NORMAL (10%). Expect high performance and multi-step challenges.";
        return "Elite level: Generate complex, multi-hour challenges. Mostly HARD and URGENT tasks with compound objectives.";
      };

      const xpMultiplier = 1 + Math.floor(gameState.level / 10) * 0.1;
      const difficultyGuidance = getDifficultyGuidance(gameState.level);

      const prompt = `Generate 3-5 personalized daily tasks for me based on my habits, progress, AND MY CURRENT LEVEL.

${habitContext}
${statsContext}
Level: ${gameState.level}, Rank: ${gameState.rank}
Quests completed: ${gameState.totalQuestsCompleted}
XP Multiplier: ${xpMultiplier.toFixed(1)}x (apply to base XP values)

**DIFFICULTY SCALING FOR MY LEVEL:**
${difficultyGuidance}

Create realistic, achievable tasks for today that:
1. Match my current level's difficulty expectations
2. Align with my existing habits and help improve my weakest stats
3. Scale XP rewards by the multiplier (${xpMultiplier.toFixed(1)}x)
4. Are progressively more challenging if I'm higher level

Return ONLY a JSON array of tasks, nothing else. Each task should have:
- title (string, with emoji)
- difficulty (Easy/Normal/Hard/Urgent - distributed according to level guidance)
- xpReward (number, scaled by multiplier)
- creditReward (number)
- timeFrame (string like "Today" or "This morning")

Example format:
[{"title":"🏃 Morning jog for 20 minutes","difficulty":"Easy","xpReward":25,"creditReward":8,"timeFrame":"This morning"}]`;

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
        
        // Add each task
        for (const task of tasks) {
          if (task.title && task.difficulty && task.xpReward) {
            addQuest({
              title: task.title,
              difficulty: task.difficulty,
              xpReward: task.xpReward,
              creditReward: task.creditReward || 10,
              timeFrame: task.timeFrame || 'Today',
            });
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
