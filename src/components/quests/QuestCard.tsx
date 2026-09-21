import { useState } from "react";
import { Check, Target, Loader2, Repeat, Zap, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Quest } from "@/types/quest";
import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  completing?: boolean;
  onComplete: (questId: string) => void;
  onCancel?: (questId: string) => void;
  cancelling?: boolean;
}

export function QuestCard({ quest, completing, onComplete, onCancel, cancelling }: QuestCardProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isDone = quest.completed || quest.failed;
  const isCompleted = quest.completed || justCompleted;
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && !justCompleted;

  const handleMarkComplete = () => {
    if (completing || justCompleted || isDone) return;
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
        "group relative flex flex-col justify-between gap-2.5 px-4 py-3.5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4",
        justCompleted
          ? "bg-success/[0.05] border-l-2 border-l-success"
          : isDone
          ? "bg-muted/15 opacity-65"
          : "hover:bg-muted/30"
      )}
    >
      {/* LEFT AXIS: Tactile check-target & task title (The Receipt Left Edge) */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Tactile Check Target (Show, Don't Tell: Stop-Sign Signifier) */}
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isDone || justCompleted}
          aria-label={
            isCompleted
              ? `Quest "${quest.title}" completed`
              : `Mark "${quest.title}" as complete`
          }
          className={cn(
            "relative mt-0.5 sm:mt-0 size-6 shrink-0 rounded-lg border transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
            isCompleted
              ? "border-success bg-success text-success-foreground shadow-[0_2px_8px_hsl(var(--success)/0.35)]"
              : quest.failed
              ? "border-muted-foreground/30 bg-muted/40 text-muted-foreground cursor-not-allowed"
              : "border-border/80 bg-background/90 text-transparent hover:border-primary/80 hover:text-primary/30 shadow-xs"
          )}
        >
          {completing && !justCompleted ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : isCompleted ? (
            <Check className="size-3.5 stroke-[2.5] animate-in zoom-in-75 duration-200" aria-hidden="true" />
          ) : (
            <Check className="size-3.5 stroke-[2]" aria-hidden="true" />
          )}
        </button>

        {/* Manufactured Text Edge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm sm:text-base font-semibold tracking-tight text-foreground transition-all line-clamp-2 sm:line-clamp-1",
                isCompleted && "line-through text-muted-foreground font-normal",
                quest.failed && "text-muted-foreground line-through"
              )}
            >
              {quest.title}
            </h3>
          </div>

          {/* Mobile Manufactured Secondary Baseline */}
          <div className="mt-1 flex flex-wrap items-center gap-2 sm:hidden text-xs text-muted-foreground">
            {quest.linkedToGoal && quest.goalName && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/85 max-w-[190px] truncate">
                <Target className="size-3 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{quest.goalName}</span>
              </span>
            )}
            {quest.linkedToGoal && quest.goalName && <span>·</span>}
            <span className="inline-flex items-center gap-1 font-mono text-[11px]">
              {quest.seriesId ? <Repeat className="size-3 text-primary/70" /> : <Zap className="size-3 text-amber-500/70" />}
              {quest.seriesId ? "Daily" : "Today"}
            </span>
            {quest.priority !== "Essential" && (
              <>
                <span>·</span>
                <span className={cn("font-medium", quest.priority === "Important" ? "text-amber-500" : "text-muted-foreground")}>
                  {quest.priority}
                </span>
              </>
            )}
            {canCancel && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onCancel!(quest.id)}
                  disabled={cancelling || completing}
                  className="font-medium text-destructive/80 hover:text-destructive underline-offset-2 hover:underline"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AXIS (Tablet/Desktop): Pinned hard-right metadata & actions (The Receipt Right Edge) */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs">
        {/* Goal Indicator (Show, Don't Tell: No redundant "Supports:" word) */}
        {quest.linkedToGoal && quest.goalName && (
          <div
            className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-muted-foreground border border-border/60 max-w-[180px] truncate"
            title={`Goal: ${quest.goalName}`}
          >
            <Target className="size-3 text-primary shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">{quest.goalName}</span>
          </div>
        )}

        {/* Cadence Tag */}
        <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
          {quest.seriesId ? (
            <>
              <Repeat className="size-3 text-primary/70" aria-hidden="true" />
              <span>Daily</span>
            </>
          ) : (
            <>
              <Zap className="size-3 text-amber-500/70" aria-hidden="true" />
              <span>Today</span>
            </>
          )}
        </div>

        {/* Relational Emphasis Priority Tag */}
        {quest.priority !== "Essential" ? (
          <span
            className={cn(
              "font-semibold px-2 py-0.5 rounded-md border text-[11px]",
              quest.priority === "Important"
                ? "text-amber-500 bg-amber-500/10 border-amber-500/25"
                : "text-muted-foreground bg-muted/30 border-border/60"
            )}
          >
            {quest.priority}
          </span>
        ) : (
          <span className="text-muted-foreground/60 font-mono text-[11px] px-1.5 py-0.5">
            Standard
          </span>
        )}

        {/* Status or Secondary Actions */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 font-medium text-success text-xs pl-1">
            <Check className="size-3.5" aria-hidden="true" />
            <span>Done</span>
          </div>
        ) : quest.failed ? (
          <span className="text-muted-foreground text-xs font-mono">Missed</span>
        ) : (
          canCancel && (
            <button
              type="button"
              onClick={() => onCancel!(quest.id)}
              disabled={cancelling || completing || justCompleted}
              className="p-1 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Cancel commitment"
              aria-label="Cancel commitment"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </div>
    </li>
  );
}
