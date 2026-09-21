import { useState } from "react";
import { Check, Target, Loader2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  completing?: boolean;
  onComplete: (questId: string) => void;
  // Founder Decision (Cancel/abandon chunk): optional and only ever
  // passed by a caller that also wants the cancel action rendered — see
  // Quests.tsx. Undefined here (Dashboard's usage, Quest History's
  // read-only usage) means no cancel button, not a disabled one; History
  // in particular must never offer to cancel an already-resolved Quest.
  onCancel?: (questId: string) => void;
  cancelling?: boolean;
}

// Displays only fields that already exist on the Quest model. There is no
// `description` field in the canonical quest data — one was not invented
// for this card (see TIS-QUEST-001 report).
export function QuestCard({ quest, completing, onComplete, onCancel, cancelling }: QuestCardProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isDone = quest.completed || quest.failed;
  // Cancel is only ever meaningful for an active, one-shot Quest — a
  // recurring series has its own lifecycle (see cancelQuest's own
  // comment in useDashboardData.ts). Enforced again here, not just in the
  // caller, so this component can never render a cancel action that
  // wouldn't actually be honored.
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && !justCompleted;

  const handleMarkComplete = () => {
    if (completing || justCompleted) return;
    setJustCompleted(true);
    triggerHaptic("success");
    if (shouldReduceMotion) {
      onComplete(quest.id);
    } else {
      setTimeout(() => {
        onComplete(quest.id);
      }, 260);
    }
  };

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between shadow-[var(--shadow-card)]",
        justCompleted
          ? "border-success/50 bg-success/[0.04] scale-[0.99]"
          : isDone
          ? "border-border bg-card opacity-70"
          : "border-border bg-card"
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>{quest.priority}</Badge>
          <span className="text-xs text-muted-foreground">{quest.timeFrame}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {quest.title}
        </h3>
        {quest.linkedToGoal && quest.goalName && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Supports: {quest.goalName}
          </p>
        )}
      </div>

      {quest.completed || justCompleted ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-success shrink-0 animate-in zoom-in-75 duration-200">
          <div className="flex size-6 items-center justify-center rounded-full bg-success/15 border border-success/30 text-success">
            <Check className="size-3.5" aria-hidden="true" />
          </div>
          <span>Completed</span>
        </div>
      ) : quest.failed ? (
        <div className="text-sm font-medium text-muted-foreground shrink-0">Not completed</div>
      ) : (
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          {canCancel && (
            <Button
              variant="ghost"
              className="min-h-11 text-muted-foreground hover:text-foreground"
              onClick={() => onCancel!(quest.id)}
              disabled={cancelling || completing || justCompleted}
            >
              Cancel
            </Button>
          )}
          <Button
            className={cn(
              "min-h-11 transition-all duration-200",
              justCompleted ? "bg-success text-success-foreground" : ""
            )}
            onClick={handleMarkComplete}
            disabled={completing || justCompleted}
          >
            {completing && !justCompleted ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            {completing && !justCompleted ? "Saving…" : justCompleted ? "Done!" : "Mark complete"}
          </Button>
        </div>
      )}
    </li>
  );
}
