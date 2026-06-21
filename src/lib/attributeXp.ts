/**
 * attributeXp.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure utility layer for the Attribute XP system.
 * No React, no state, no side-effects — only deterministic functions.
 *
 * Consumed by:
 *   - useGameState.ts  (completeQuest, failQuest, toggleHabitDay)
 *   - useGameState.ts  (migrateGameState)
 *   - UI components    (display only — read .level and .xp, call getStatXpRequired)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Core type ─────────────────────────────────────────────────────────────────

/**
 * A single attribute (FIT, INT, etc.) represented as a progression object.
 * Replaces the old plain `number` value in PlayerStats.
 *
 * - level: the current attribute level (0 = unawakened, no cap)
 * - xp:    accumulated XP within the current level (0 ≤ xp < getStatXpRequired(level))
 */
export interface AttributeStat {
  level: number;
  xp: number;
}

// ── XP curve ──────────────────────────────────────────────────────────────────

/**
 * XP required to advance FROM `level` TO `level + 1`.
 *
 * Formula: Math.floor(50 * level^1.15)
 *
 * Verified values:
 *   level 1 →  2:     50 XP
 *   level 5 →  6:    318 XP
 *   level 10 → 11:   706 XP
 *   level 20 → 21: 1,567 XP
 *   level 50 → 51: 4,495 XP
 *   level 100→101: 9,976 XP
 *
 * NOTE: level 0 is a valid starting state. The first XP gain advances 0 → 1.
 * We treat level 0 the same as level 1 for the formula (floor(50 * 0^1.15) = 0
 * would cause an infinite loop, so level 0 uses the level-1 requirement).
 */
export function getStatXpRequired(level: number): number {
  const effectiveLevel = Math.max(1, level);
  return Math.floor(50 * Math.pow(effectiveLevel, 1.15));
}

// ── Progression engine ────────────────────────────────────────────────────────

/**
 * Apply a stat XP gain to an AttributeStat. Handles multi-level-ups in a loop.
 * Never mutates the input — returns a new AttributeStat.
 *
 * @param stat    Current attribute state
 * @param xpGain  Positive integer — stat XP to add (from getDifficultyRewards().statXp)
 * @returns       New AttributeStat with updated level and xp
 */
export function applyStatXp(stat: AttributeStat, xpGain: number): AttributeStat {
  if (xpGain <= 0) return stat;

  let { level, xp } = stat;
  xp += xpGain;

  // Loop handles multi-level-ups from a single large XP gain
  while (xp >= getStatXpRequired(level)) {
    xp -= getStatXpRequired(level);
    level += 1;
  }

  return { level, xp };
}

/**
 * Apply a stat XP loss (e.g. on quest failure or habit miss).
 * XP cannot drop below 0 within a level. Levels cannot decrease below 0.
 * Uses a 5% current-level-requirement penalty — stings but never regresses levels.
 *
 * @param stat     Current attribute state
 * @param xpLoss   Positive integer — stat XP to remove
 * @returns        New AttributeStat; level never decreases, xp floor is 0
 */
export function removeStatXp(stat: AttributeStat, xpLoss: number): AttributeStat {
  if (xpLoss <= 0) return stat;
  const newXp = Math.max(0, stat.xp - xpLoss);
  return { level: stat.level, xp: newXp };
}

// ── Hunter Power ──────────────────────────────────────────────────────────────

/**
 * Hunter Power — measures overall progression with diminishing returns above level 50.
 *
 * Formula (per attribute):
 *   level ≤ 50  →  contribution = level          (full credit)
 *   level > 50  →  contribution = 50 + (level - 50) * 0.5  (half credit above soft cap)
 *
 * Hunter Power = Math.floor( sum of all six contributions )
 *
 * Rationale: prevents a single-stat specialist from outscoring a balanced player.
 * A balanced 6×L20 player (Power 120) beats a FIT:120 specialist (Power 90).
 *
 * Validation examples:
 *   Balanced   FIT:20 SOC:20 INT:20 DIS:20 FOC:20 FIN:20  → Power 120
 *   Specialist FIT:120 SOC:1 INT:1 DIS:1 FOC:1 FIN:1      → Power 90
 *   Two-focus  FIT:50 SOC:50 INT:1 DIS:1 FOC:1 FIN:1      → Power 104
 *
 * @param stats  PlayerStats — must already be migrated to AttributeStat
 */
export function getHunterPower(stats: Record<string, AttributeStat>): number {
  const SOFT_CAP = 50;
  let total = 0;
  for (const s of Object.values(stats)) {
    const level = s?.level ?? 0;
    if (level <= SOFT_CAP) {
      total += level;
    } else {
      total += SOFT_CAP + (level - SOFT_CAP) * 0.5;
    }
  }
  return Math.floor(total);
}

// ── Attribute Titles ──────────────────────────────────────────────────────────

/**
 * Returns the title for a given attribute level.
 * Single source of truth — import and call here, never reimplement elsewhere.
 *
 * Milestones:
 *   1–9:    Novice
 *   10–19:  Initiate
 *   20–39:  Practitioner
 *   40–59:  Specialist
 *   60–79:  Expert
 *   80–99:  Elite
 *   100+:   Legendary
 */
export function getAttributeTitle(level: number): string {
  if (level >= 100) return 'Legendary';
  if (level >= 80)  return 'Elite';
  if (level >= 60)  return 'Expert';
  if (level >= 40)  return 'Specialist';
  if (level >= 20)  return 'Practitioner';
  if (level >= 10)  return 'Initiate';
  return 'Novice';
}

// ── Stat progress percentage ──────────────────────────────────────────────────

/**
 * Returns progress as 0–100 percentage within the current level.
 * Useful for progress bar display.
 */
export function getStatProgress(stat: AttributeStat): number {
  const required = getStatXpRequired(stat.level);
  if (required === 0) return 100;
  return Math.min(100, Math.floor((stat.xp / required) * 100));
}

// ── Zero state ────────────────────────────────────────────────────────────────

/** Returns a fresh level-1 AttributeStat. Used in freshAccountState. */
export const ZERO_STAT: AttributeStat = Object.freeze({ level: 1, xp: 0 });

/** Convenience factory — returns a new (unfrozen) level-1 stat object. */
export const zeroStat = (): AttributeStat => ({ level: 1, xp: 0 });

// ── Migration helper ──────────────────────────────────────────────────────────

/**
 * Normalises any raw stat value into a valid AttributeStat.
 *
 * Handles every legacy shape that may exist in localStorage or Supabase:
 *   number (old format)       → { level: number, xp: 0 }
 *   { level, xp } (new)       → returned as-is (validated)
 *   null / undefined / other  → { level: 1, xp: 0 }
 */
export function normaliseStatValue(raw: unknown): AttributeStat {
  // Already the correct shape
  if (
    typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as AttributeStat).level === 'number' &&
    typeof (raw as AttributeStat).xp === 'number'
  ) {
    return {
      level: Math.max(0, Math.floor((raw as AttributeStat).level)),
      xp:    Math.max(0, Math.floor((raw as AttributeStat).xp)),
    };
  }

  // Legacy plain number — preserve the level, floor at 1 (new minimum)
  if (typeof raw === 'number' && isFinite(raw)) {
    return { level: Math.max(1, Math.floor(raw)), xp: 0 };
  }

  // Anything else — safe level-1 default
  return zeroStat();
}
