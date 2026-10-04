import { useState } from "react";
import { Check, Target, Loader2, Repeat, Zap, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Quest } from "@/types/quest";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  completing?: boolean;
  onComplete: (questId: string) => void;
  onCancel?: (questId: string) => void;
  cancelling?: boolean;
}

export function QuestCard({ quest, completing, onComplete, onCancel, cancelling }: QuestCardProps) {
  const [completionStage, setCompletionStage] = useState<"idle" | "shrink" | "slide">("idle");
  const shouldReduceMotion = useReducedMotion();
  const isDone = quest.completed || quest.failed;
  const isCompleted = quest.completed || completionStage !== "idle";
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && completionStage === "idle";

  const handleMarkComplete = () => {
    if (completing || completionStage !== "idle" || isDone) return;
    setCompletionStage("shrink");
    triggerHaptic("success");
    soundEngine.playSuccess();
    if (shouldReduceMotion) {
      onComplete(quest.id);
    } else {
      setTimeout(() => {
        setCompletionStage("slide");
      }, 220);
      setTimeout(() => {
        onComplete(quest.id);
      }, 540);
    }
  };

  return (
    <motion.li
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={
        shouldReduceMotion
          ? { opacity: isDone ? 0.65 : 1 }
          : completionStage === "slide"
          ? {
              scale: 0.92,
              x: 340,
              opacity: 0,
              height: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0,
              boxShadow: "0 25px 30px -10px rgba(0,0,0,0.3)",
            }
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
          : { scale: 0.92, x: 340, opacity: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } }
      }
      transition={{
        duration: completionStage === "shrink" ? 0.22 : 0.34,
        ease: [0.32, 0.72, 0, 1],
        layout: { type: "spring", stiffness: 360, damping: 28 },
      }}
      className={cn(
        "group relative flex flex-col justify-between gap-2.5 rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden",
        completionStage !== "idle"
          ? "bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          : isDone
          ? "bg-[#181B24]/40 opacity-60 border-[rgba(148,163,184,0.08)]"
          : "hover:bg-[#181B24] hover:border-[rgba(148,163,184,0.2)]"
      )}
    >
      {/* LEFT AXIS: Tactile check-target & task title (The Receipt Left Edge) */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Dedicated 48x48dp Touch Target for Tactile Squircle Checkbox (Apple HIG / Material 3) */}
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isDone || isCompleted}
          aria-label={
            isCompleted
              ? `Quest "${quest.title}" completed`
              : `Mark "${quest.title}" as complete`
          }
          className="relative size-11 shrink-0 rounded-xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 touch-manipulation cursor-pointer group active:scale-[0.92] transition-transform"
        >
          <div
            className={cn(
              "size-6 rounded-lg border transition-all duration-200 flex items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]",
              isCompleted
                ? "border-white bg-white text-black shadow-white/20 shadow-sm"
                : quest.failed
                ? "border-muted-foreground/30 bg-muted/40 text-muted-foreground cursor-not-allowed"
                : "border-[rgba(148,163,184,0.2)] bg-[#181B24] text-transparent hover:border-white/60 hover:text-white/40"
            )}
          >
            {completing && !isCompleted ? (
              <Loader2 className="size-3 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : isCompleted ? (
              <Check className="size-3.5 stroke-[3] animate-in zoom-in-75 duration-200" aria-hidden="true" />
            ) : (
              <Check className="size-3.5 stroke-[2]" aria-hidden="true" />
            )}
          </div>
        </button>

        {/* Manufactured Text Edge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm sm:text-base font-semibold tracking-tight text-foreground font-sans transition-all line-clamp-2 sm:line-clamp-1",
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
              <span className="inline-flex items-center gap-1 font-medium text-foreground/85 max-w-[190px] truncate bg-[#181B24] px-2 py-0.5 rounded-full border border-[rgba(148,163,184,0.12)]">
                <Target className="size-3 text-zinc-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{quest.goalName}</span>
              </span>
            )}
            {quest.linkedToGoal && quest.goalName && <span>·</span>}
            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#181B24] px-2 py-0.5 rounded-md border border-[rgba(148,163,184,0.12)]">
              {quest.seriesId ? <Repeat className="size-3 text-zinc-400" /> : <Zap className="size-3 text-muted-foreground" />}
              {quest.seriesId ? "Daily" : "Today"}
            </span>
            {quest.priority !== "Essential" && (
              <>
                <span>·</span>
                <span className={cn("font-medium text-[11px]", quest.priority === "Important" ? "text-foreground" : "text-muted-foreground")}>
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
        {/* Goal Indicator */}
        {quest.linkedToGoal && quest.goalName && (
          <div
            className="flex items-center gap-1.5 rounded-full bg-[#181B24] px-2.5 py-1 text-muted-foreground border border-[rgba(148,163,184,0.14)] max-w-[180px] truncate shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)]"
            title={`Goal: ${quest.goalName}`}
          >
            <Target className="size-3 text-zinc-400 shrink-0" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{quest.goalName}</span>
          </div>
        )}

        {/* Cadence Tag */}
        <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#181B24] border border-[rgba(148,163,184,0.14)]">
          {quest.seriesId ? (
            <>
              <Repeat className="size-3 text-zinc-400" aria-hidden="true" />
              <span>Daily</span>
            </>
          ) : (
            <>
              <Zap className="size-3 text-muted-foreground" aria-hidden="true" />
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
                ? "text-foreground bg-muted/70 border-border"
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
          <div className="flex items-center gap-1.5 font-semibold text-white text-xs pl-1">
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
              className="p-1 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Cancel commitment"
              aria-label="Cancel commitment"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </div>
    </motion.li>
  );
}
