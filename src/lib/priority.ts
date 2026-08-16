import type { QuestPriority } from "@/types/quest";

// Muted/dark, not bright/saturated — subtle background tint + a border,
// reusing only existing semantic tokens (destructive/warning/muted) per
// the Design System's "no arbitrary new colors" rule. Essential and
// Important each get a distinct hue at low opacity; Optional is
// deliberately neutral (no hue) since it carries no urgency. The label
// text (e.g. "Essential") is always rendered next to this class, in
// every consumer — color is never the sole carrier of meaning.
export const PRIORITY_BADGE_CLASSES: Record<QuestPriority, string> = {
  Essential: "border-destructive/40 bg-destructive/10 text-destructive/90",
  Important: "border-warning/40 bg-warning/10 text-warning/90",
  Optional: "border-border bg-muted/40 text-muted-foreground",
};
