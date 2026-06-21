/**
 * difficulty.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the Difficulty system.
 * Used by both Quests and Habits — import from here, nowhere else.
 *
 * Rewards are fixed per tier. No keyword parsing, no dynamic calculation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Enum ─────────────────────────────────────────────────────────────────────

export type Difficulty = 'Trivial' | 'Easy' | 'Moderate' | 'Hard' | 'Elite';

export const DIFFICULTIES: Difficulty[] = [
  'Trivial',
  'Easy',
  'Moderate',
  'Hard',
  'Elite',
];

// ── Reward table ──────────────────────────────────────────────────────────────

export interface DifficultyRewards {
  xp: number;       // XP gained on quest complete / habit win
  credits: number;  // Credits gained on quest complete / habit win
  statXp: number;   // Stat points gained (used for stat category gain)
  loseXp: number;   // XP lost on habit miss (derived: roughly half of xp)
}

const REWARD_TABLE: Record<Difficulty, DifficultyRewards> = {
  Trivial:  { xp:  5, credits:  1, statXp:  6, loseXp:  2 },
  Easy:     { xp: 10, credits:  2, statXp: 12, loseXp:  5 },
  Moderate: { xp: 20, credits:  5, statXp: 25, loseXp: 10 },
  Hard:     { xp: 40, credits: 10, statXp: 50, loseXp: 20 },
  Elite:    { xp: 80, credits: 20, statXp: 100, loseXp: 40 },
};

/**
 * Get fixed rewards for a given difficulty level.
 * Falls back to Moderate if an unrecognised value is passed.
 */
export function getDifficultyRewards(difficulty: Difficulty): DifficultyRewards {
  return REWARD_TABLE[difficulty] ?? REWARD_TABLE.Moderate;
}

// ── Migration helpers ─────────────────────────────────────────────────────────

/** Set of all valid current Difficulty values — used for runtime checks. */
export const VALID_DIFFICULTIES = new Set<string>(DIFFICULTIES);

/**
 * Maps any legacy or unknown difficulty string to a valid Difficulty.
 *
 * Legacy → New:
 *   'Normal'  → 'Moderate'   (old middle tier)
 *   'Urgent'  → 'Elite'      (old top tier)
 *   anything unrecognised / missing → 'Moderate' (safe default)
 *
 * Already-valid values pass through unchanged.
 */
export function migrateDifficulty(raw: unknown): Difficulty {
  if (typeof raw !== 'string') return 'Moderate';
  if (VALID_DIFFICULTIES.has(raw)) return raw as Difficulty;

  // Legacy mappings
  const LEGACY_MAP: Record<string, Difficulty> = {
    Normal: 'Moderate',
    Urgent: 'Elite',
    // Defensive extras — in case old data had these written differently
    normal: 'Moderate',
    urgent: 'Elite',
    easy:   'Easy',
    hard:   'Hard',
  };

  return LEGACY_MAP[raw] ?? 'Moderate';
}

// ── UI metadata ───────────────────────────────────────────────────────────────

export interface DifficultyMeta {
  label: Difficulty;
  description: string;
  color: string;        // Tailwind text color
  bg: string;           // Tailwind bg + border classes for badge
  barColor: string;     // Tailwind bg for progress bar / accent bar
  barGlow: string;      // Tailwind shadow for glow effect
}

export const DIFFICULTY_META: Record<Difficulty, DifficultyMeta> = {
  Trivial: {
    label: 'Trivial',
    description: '~5 min · Warm-up tasks',
    color: 'text-slate-400',
    bg: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    barColor: 'bg-slate-400',
    barGlow: 'shadow-slate-400/40',
  },
  Easy: {
    label: 'Easy',
    description: '5–15 min · Simple actions',
    color: 'text-green-400',
    bg: 'bg-green-500/20 text-green-400 border-green-500/30',
    barColor: 'bg-green-500',
    barGlow: 'shadow-green-500/50',
  },
  Moderate: {
    label: 'Moderate',
    description: '15–45 min · Steady effort',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    barColor: 'bg-blue-500',
    barGlow: 'shadow-blue-500/50',
  },
  Hard: {
    label: 'Hard',
    description: '1+ hr · Real challenge',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    barColor: 'bg-purple-500',
    barGlow: 'shadow-purple-500/50',
  },
  Elite: {
    label: 'Elite',
    description: '2+ hr · Peak performance',
    color: 'text-red-400',
    bg: 'bg-red-500/20 text-red-400 border-red-500/30',
    barColor: 'bg-red-500',
    barGlow: 'shadow-red-500/50',
  },
};
