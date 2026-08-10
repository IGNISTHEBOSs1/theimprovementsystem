// Identity derivation — the single source of truth for level → rank.
// This lives outside useGameState so it can be imported by both game logic
// and purely presentational consumers (e.g. SystemBar) without either one
// owning or duplicating it.

export const getRankForLevel = (level: number): string => {
  if (level >= 60) return 'National-Level Hunter';
  if (level >= 50) return 'S-Rank Hunter';
  if (level >= 40) return 'A-Rank Hunter';
  if (level >= 30) return 'B-Rank Hunter';
  if (level >= 20) return 'C-Rank Hunter';
  if (level >= 10) return 'D-Rank Hunter';
  return 'E-Rank Hunter';
};
