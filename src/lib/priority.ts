import type { QuestPriority } from "@/types/quest";

// Muted/dark, not bright/saturated — subtle background tint + a border,
// reusing only existing semantic tokens (destructive/warning/muted) per
// the Design System's "no arbitrary new colors" rule. Essential and
// Important each get a distinct hue at low opacity; Optional is
// deliberately neutral (no hue) since it carries no urgency. The label
// text (e.g. "Essential") is always rendered next to this class, in
// every consumer — color is never the sole carrier of meaning.
// Founder Decision reversed (design pass): the solid bright-red
// `destructive` treatment below was a deliberate prior override (see
// git history), but a solid saturated-red tag reads as a punitive
// error state on a to-do item, not a priority label — it induces the
// same alarm as a failed form field for something the user hasn't done
// wrong. Reverted to a low-opacity tint, matching Important/Optional's
// treatment, using the existing `primary` token rather than reintroducing
// the old `destructive` tint, so "Essential" reads as "most important"
// rather than "danger." No new color introduced — still an existing
// semantic token at reduced opacity, per the Design System's rule.
export const PRIORITY_BADGE_CLASSES: Record<QuestPriority, string> = {
  Essential: "border-primary/40 bg-primary/15 text-primary font-semibold",
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
