import type { QuestPriority } from "@/types/quest";

// Muted/dark, not bright/saturated — subtle background tint + a border,
// reusing only existing semantic tokens (destructive/warning/muted) per
// the Design System's "no arbitrary new colors" rule. Essential and
// Important each get a distinct hue at low opacity; Optional is
// deliberately neutral (no hue) since it carries no urgency. The label
// text (e.g. "Essential") is always rendered next to this class, in
// every consumer — color is never the sole carrier of meaning.
// Founder Decision (Visual override — mockup-match chunk): Essential
// upgraded from a muted tint to a solid, bright treatment, by explicit
// Founder instruction overriding the prior "muted-only priority colors"
// rule. Still the existing `destructive` semantic token (not a new
// arbitrary color) — full-strength background/border/text instead of
// the previous low-opacity tint. Important/Optional unchanged.
export const PRIORITY_BADGE_CLASSES: Record<QuestPriority, string> = {
  Essential: "border-destructive bg-destructive/90 text-destructive-foreground font-semibold",
  Important: "border-warning/40 bg-warning/10 text-warning/90",
  Optional: "border-border bg-muted/40 text-muted-foreground",
};

// Founder Decision (multi-active Quest chunk): with multiple concurrently
// active Quests, priority now also determines ordering — which active
// Quest surfaces as the Dashboard's single primary focus (rank 0 = first)
// and the display order on the Quest page. Lower rank = higher priority.
// Still purely user-set (see QuestPriority) — this is a sort key, not a
// score, and never changes which Quests exist or are eligible, only how
// they're arranged.
export const PRIORITY_RANK: Record<QuestPriority, number> = {
  Essential: 0,
  Important: 1,
  Optional: 2,
};

// Stable sort: priority rank first, then createdAt ascending (earlier
// commitment first) as the tie-break within the same priority. Exported
// so the data layer (ordering activeQuests) and any UI that needs the
// same order stay in agreement — one definition, not two.
export function comparePriorityThenCreatedAt(a: { priority: QuestPriority; createdAt: string }, b: { priority: QuestPriority; createdAt: string }): number {
  const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (rankDiff !== 0) return rankDiff;
  return a.createdAt.localeCompare(b.createdAt);
}
