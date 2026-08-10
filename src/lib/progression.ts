// Canonical progression engine — the single authority for XP, level, and
// rank calculations across all state systems. See TIS-INFRA-003.
//
// This module does not decide *how much* XP an action grants — that remains
// the caller's responsibility (quests, habits, multipliers, etc). It owns
// only the shared math previously duplicated across useGameState.addXp,
// useGameState.completeQuest, useGameState.toggleHabitDay, and
// useDashboardData.completeQuest: given a starting level/xp/maxXp and a net
// XP delta, what is the resulting level/xp/maxXp/rank, and did a level-up
// occur.
//
// No gameplay values were changed during extraction — formulas and
// constants below are unmodified from their original locations.

import { getRankForLevel } from './identity';

// XP required to complete a given level — easy early, exponential later.
// Moved from useGameState.ts verbatim.
export const getXpForLevel = (level: number): number => {
  if (level <= 5)  return 200 + (level - 1) * 100;     // 200, 300, 400, 500, 600
  if (level <= 10) return 700 + (level - 5) * 150;     // 700→1450
  if (level <= 20) return 1500 + (level - 10) * 300;   // 1500→4500
  if (level <= 35) return 4500 + (level - 20) * 500;   // 4500→12000
  return 12000 + (level - 35) * 1000;                   // 12000+
};

export interface ProgressionSnapshot {
  currentXp: number;
  level: number;
  maxXp: number;
}

export interface ProgressionResult extends ProgressionSnapshot {
  rank: string;
  leveledUp: boolean;
}

/**
 * Applies a net XP delta (positive or negative, already scaled by any
 * multiplier the caller wants applied) to a progression snapshot and
 * returns the resulting level/xp/maxXp/rank state.
 *
 * Behaviour preserved exactly from the original duplicated implementations:
 * negative results clamp to 0 before the level-up loop runs, and the
 * loop increments level/maxXp until currentXp no longer exceeds maxXp.
 */
export const applyXpDelta = (
  snapshot: ProgressionSnapshot,
  delta: number,
): ProgressionResult => {
  let newXp = snapshot.currentXp + delta;
  let newLevel = snapshot.level;
  let newMaxXp = snapshot.maxXp;
  let leveledUp = false;

  if (newXp < 0) newXp = 0;

  while (newXp >= newMaxXp) {
    newXp -= newMaxXp;
    newLevel++;
    newMaxXp = getXpForLevel(newLevel);
    leveledUp = true;
  }

  return {
    currentXp: newXp,
    level: newLevel,
    maxXp: newMaxXp,
    rank: getRankForLevel(newLevel),
    leveledUp,
  };
};
