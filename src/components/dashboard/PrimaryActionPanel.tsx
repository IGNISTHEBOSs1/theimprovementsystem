import { Check, ChevronRight, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";

interface PrimaryActionPanelProps {
  quest?: Quest;
  completing?: boolean;
  onComplete: () => void;
  onChooseQuest: () => void;
}

export function PrimaryActionPanel({ quest, completing, onComplete, onChooseQuest }: PrimaryActionPanelProps) {
  if (!quest) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="focus-heading">
        <p className="text-label text-primary">Today&apos;s focus</p>
        <h2 id="focus-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Begin with one meaningful action.
        </h2>
        <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
          Choose one task that moves your life in the direction you intend.
        </p>
        <Button className="mt-6 min-h-11" onClick={onChooseQuest}>
          Choose today&apos;s focus <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-7" aria-labelledby="focus-heading">
      <p className="text-label text-primary">Today&apos;s focus</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CircleDot className="size-4 text-primary" aria-hidden="true" />
            {quest.timeFrame}
            <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>{quest.priority}</Badge>
          </div>
          <h2 id="focus-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {quest.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One clear step is enough. Start there.
          </p>
        </div>
        <Button className="min-h-11 shrink-0" onClick={onComplete} disabled={completing}>
          <Check className="size-4" aria-hidden="true" />
          {completing ? "Saving…" : "Mark complete"}
        </Button>
      </div>
    </section>
  );
}
