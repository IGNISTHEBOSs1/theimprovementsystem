import { useState, useRef, useEffect } from "react";
import { Check, Target, Loader2, Repeat, Zap, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Quest, getQuestRole } from "@/types/quest";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { TIS_EASINGS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  completing?: boolean;
  onComplete: (questId: string) => void;
  onCancel?: (questId: string) => void;
  cancelling?: boolean;
  onPauseSeries?: (seriesId: string) => void;
}

export function QuestCard({ quest, completing, onComplete, onCancel, cancelling }: QuestCardProps) {
  const [completionStage, setCompletionStage] = useState<"idle" | "shrink">("idle");
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isDone = quest.completed || quest.failed;
  const isCompleted = quest.completed || completionStage !== "idle";
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && completionStage === "idle";

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!completing && !quest.completed && completionStage !== "idle" && !completeTimerRef.current) {
      setCompletionStage("idle");
    }
  }, [completing, quest.completed, completionStage]);

  const handleMarkComplete = () => {
    if (completing || isDone) return;
    if (completionStage !== "idle") {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      setCompletionStage("idle");
      return;
    }

    setCompletionStage("shrink");
    triggerHaptic("success");
    soundEngine.playSuccess();
    if (shouldReduceMotion) {
      onComplete(quest.id);
    } else {
      completeTimerRef.current = setTimeout(() => {
        completeTimerRef.current = null;
        onComplete(quest.id);
      }, 260);
    }
  };

  return (
    <motion.li
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={
        shouldReduceMotion
          ? { opacity: isDone ? 0.65 : 1 }
          : completionStage === "shrink"
          ? {
              scale: 0.93,
              x: 0,
              opacity: 1,
              y: 2,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.22), 0 8px 10px -6px rgba(0, 0, 0, 0.18)",
            }
          : {
              scale: 1,
              x: 0,
              opacity: isDone ? 0.65 : 1,
              y: 0,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { scale: 0.92, x: 340, opacity: 0, transition: { duration: 0.26, ease: TIS_EASINGS.exitDecel } }
      }
      transition={{
        duration: completionStage === "shrink" ? 0.22 : 0.26,
        ease: TIS_EASINGS.exitDecel,
        layout: { type: "spring", stiffness: 360, damping: 28 },
      }}
      className={cn(
        "group relative flex flex-col justify-between gap-2.5 rounded-2xl border border-border/80 bg-card/80 p-4 transition-colors duration-250 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4 shadow-sm overflow-hidden",
        completionStage !== "idle"
          ? "bg-emerald-500/[0.12] border-emerald-500/50 shadow-emerald-500/10"
          : isDone
          ? "bg-muted/20 opacity-65 border-border/40"
          : "hover:bg-muted/30 hover:border-border"
      )}
    >
      {/* LEFT AXIS: Tactile check-target & task title (The Receipt Left Edge) */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Tactile Check Target (Show, Don't Tell: Stop-Sign Signifier) */}
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isDone || quest.completed}
          aria-label={
            isCompleted
              ? `Quest "${quest.title}" completed`
              : `Mark "${quest.title}" as complete`
          }
          className={cn(
            "relative mt-0.5 sm:mt-0 size-6 shrink-0 rounded-lg border transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] cursor-pointer",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105"
              : quest.failed
              ? "border-muted-foreground/30 bg-muted/40 text-muted-foreground cursor-not-allowed"
              : "border-border/80 bg-background/90 text-transparent hover:border-emerald-500/80 hover:text-emerald-500/30 shadow-xs"
          )}
        >
          {completing && !isCompleted ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : isCompleted ? (
            <Check className="size-3.5 stroke-[3] animate-in zoom-in-75 duration-300" aria-hidden="true" />
          ) : (
            <Check className="size-3.5 stroke-[2]" aria-hidden="true" />
          )}
        </button>

        {/* Manufactured Text Edge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm sm:text-base font-semibold tracking-tight text-foreground transition-all line-clamp-2 break-words leading-snug",
                isCompleted && "line-through text-muted-foreground font-normal",
                quest.failed && "text-muted-foreground line-through"
              )}
            >
              {quest.title}
            </h3>
          </div>

          {/* Mobile Secondary Baseline */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                getQuestRole(quest) === "focus"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-muted/40 text-muted-foreground",
              )}
            >
              {getQuestRole(quest) === "focus" ? "Primary Focus" : "Routine"}
            </span>
            {quest.linkedToGoal && quest.goalName && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/85 max-w-[130px] truncate">
                <Target className="size-3 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{quest.goalName}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-sans text-xs">
              {quest.seriesId ? <Repeat className="size-3 text-primary/70" /> : <Zap className="size-3 text-muted-foreground" />}
              {quest.seriesId ? "Daily" : "Today"}
            </span>
          </div>
        </div>

        {/* Mobile 44x44px Cancel Action */}
        {canCancel && (
          <div className="sm:hidden shrink-0 self-center">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onCancel!(quest.id);
              }}
              disabled={cancelling || completing}
              className="size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Cancel commitment"
              aria-label={`Cancel commitment "${quest.title}"`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT AXIS (Tablet/Desktop): Pinned hard-right metadata & actions */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs">
        {/* Goal Indicator */}
        {quest.linkedToGoal && quest.goalName && (
          <div
            className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-muted-foreground border border-border/60 max-w-[180px] truncate"
            title={`Goal: ${quest.goalName}`}
          >
            <Target className="size-3 text-primary shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">{quest.goalName}</span>
          </div>
        )}

        {/* Role Tag: Primary Focus or Routine */}
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border font-sans",
            getQuestRole(quest) === "focus"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-muted/40 text-muted-foreground border-border/50",
          )}
        >
          {getQuestRole(quest) === "focus" ? "Primary Focus" : "Routine"}
        </span>

        {/* Cadence Tag */}
        <div className="flex items-center gap-1 text-muted-foreground font-sans text-xs px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
          {quest.seriesId ? (
            <>
              <Repeat className="size-3 text-primary/70" aria-hidden="true" />
              <span>Daily</span>
            </>
          ) : (
            <>
              <Zap className="size-3 text-muted-foreground" aria-hidden="true" />
              <span>Today</span>
            </>
          )}
        </div>

        {/* Status or Secondary Actions */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 text-xs pl-1">
            <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>Done</span>
          </div>
        ) : quest.failed ? (
          <span className="text-muted-foreground text-xs font-mono">Missed</span>
        ) : (
          canCancel && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onCancel!(quest.id);
              }}
              disabled={cancelling || completing || isCompleted}
              className="size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Cancel commitment"
              aria-label={`Cancel commitment "${quest.title}"`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </div>
    </motion.li>
  );
}
