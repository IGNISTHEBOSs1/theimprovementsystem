// Canonical attribute progression — the single authority for stat category
// inference and stat-gain math across all state systems. See TIS-INFRA-004.
//
// This module does not decide *when* a stat changes — that remains the
// caller's responsibility (quest completion, habit toggling, etc). It owns
// only the shared logic previously duplicated within useGameState.ts across
// completeQuest, failQuest, toggleHabitDay, addHabit, and addQuest:
// mapping free-text titles to a stat category, and computing a clamped
// stat gain.
//
// No gameplay values were changed during extraction — formulas and
// constants below are unmodified from their original location.

export interface PlayerStats {
  FIT: number;
  SOC: number;
  INT: number;
  DIS: number;
  FOC: number;
  FIN: number;
}

// Map quest/habit keywords to stat categories. Moved from useGameState.ts
// verbatim.
export const inferStatCategory = (title: string): keyof PlayerStats => {
  const t = title.toLowerCase();
  if (/workout|gym|run|exercise|push.?up|squat|yoga|sport|walk|swim|fitness|stretch/.test(t)) return 'FIT';
  if (/read|study|learn|course|book|research|code|write|journal|essay|math|science/.test(t)) return 'INT';
  if (/meditat|focus|pomodoro|deep.?work|distract|concentration|mindful/.test(t)) return 'FOC';
  if (/friend|family|call|social|meet|network|talk|message|reach.?out|community/.test(t)) return 'SOC';
  if (/budget|save|invest|money|finance|expense|income|spend|earn|credit|debt/.test(t)) return 'FIN';
  return 'DIS'; // discipline is the default for everything else
};

// Stat gain per quest difficulty on completion. Extracted verbatim from
// useGameState.completeQuest's inline ternary.
export const getStatGainForDifficulty = (
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Urgent',
): number => {
  if (difficulty === 'Easy') return 1;
  if (difficulty === 'Normal') return 2;
  if (difficulty === 'Hard') return 3;
  return 4; // Urgent
};

/**
 * Applies a stat gain to a single category, clamped to [0, 100].
 * Matches useGameState.completeQuest's clamping exactly (gain-only calls
 * clamp the upper bound; callers that also need a lower-bound clamp, such
 * as failQuest/toggleHabitDay's loss paths, continue to clamp with
 * Math.max themselves, as this function does not change their behaviour).
 */
export const applyStatGain = (
  stats: PlayerStats,
  category: keyof PlayerStats,
  gain: number,
): PlayerStats => ({
  ...stats,
  [category]: Math.min(100, stats[category] + gain),
});
