import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";

interface QuestCardProps {
  quest: Quest;
  completing?: boolean;
  onComplete: (questId: string) => void;
}

// Displays only fields that already exist on the Quest model. There is no
// `description` field in the canonical quest data — one was not invented
// for this card (see TIS-QUEST-001 report).
export function QuestCard({ quest, completing, onComplete }: QuestCardProps) {
  const isDone = quest.completed || quest.failed;

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
      </div>

      {quest.completed ? (
        <div className="flex items-center gap-2 text-sm font-medium text-primary shrink-0">
          <Check className="size-4" aria-hidden="true" />
          Completed
        </div>
      ) : quest.failed ? (
        <div className="text-sm font-medium text-muted-foreground shrink-0">Not completed</div>
      ) : (
        <Button
          className="min-h-11 shrink-0"
          onClick={() => onComplete(quest.id)}
          disabled={completing}
        >
          <Check className="size-4" aria-hidden="true" />
          {completing ? "Saving…" : "Mark complete"}
        </Button>
      )}
    </li>
  );
}
