import { Check, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";

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
  const isDone = quest.completed || quest.failed;
  // Cancel is only ever meaningful for an active, one-shot Quest — a
  // recurring series has its own lifecycle (see cancelQuest's own
  // comment in useDashboardData.ts). Enforced again here, not just in the
  // caller, so this component can never render a cancel action that
  // wouldn't actually be honored.
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId;

  return (
    <li
      className={
        isDone
          ? "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 opacity-70 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
      }
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
            <Target className="size-3.5 shrink-0" aria-hidden="true" />
            Supports: {quest.goalName}
          </p>
        )}
      </div>

      {quest.completed ? (
        <div className="flex items-center gap-2 text-sm font-medium text-primary shrink-0">
          <Check className="size-4" aria-hidden="true" />
          Completed
        </div>
      ) : quest.failed ? (
        <div className="text-sm font-medium text-muted-foreground shrink-0">Not completed</div>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          {canCancel && (
            <Button
              variant="ghost"
              className="min-h-11 text-muted-foreground hover:text-foreground"
              onClick={() => onCancel!(quest.id)}
              disabled={cancelling}
            >
              Cancel
            </Button>
          )}
          <Button
            className="min-h-11"
            onClick={() => onComplete(quest.id)}
            disabled={completing}
          >
            <Check className="size-4" aria-hidden="true" />
            {completing ? "Saving…" : "Mark complete"}
          </Button>
        </div>
      )}
    </li>
  );
}
