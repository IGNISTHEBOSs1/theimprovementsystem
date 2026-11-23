import { motion } from "framer-motion";
import { Plus, Lock, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_FOCUS_SLOTS, MAX_ROUTINE_SLOTS } from "@/hooks/useDashboardData";

interface CapacityMeterProps {
  activeFocusCount: number;
  activeRoutineCount: number;
  onAddPressed?: () => void;
  canAdd: boolean;
  className?: string;
}

export function CapacityMeter({
  activeFocusCount,
  activeRoutineCount,
  onAddPressed,
  canAdd,
  className,
}: CapacityMeterProps) {
  const isFocusLocked = activeFocusCount >= MAX_FOCUS_SLOTS;
  const routineRemaining = Math.max(0, MAX_ROUTINE_SLOTS - activeRoutineCount);
  const isAllFull = isFocusLocked && routineRemaining === 0;

  return (
    <section
      aria-label="Daily Capacity Status"
      className={cn(
        "milled-slab rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-[var(--shadow-card)] backdrop-blur-xl transition-colors duration-200",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-muted/60 text-muted-foreground border border-border/70">
            {isAllFull ? (
              <>
                <Lock className="size-3 text-amber-500" aria-hidden="true" />
                <span>Capacity Reached</span>
              </>
            ) : (
              <>
                <Target className="size-3 text-emerald-500" aria-hidden="true" />
                <span>Capacity Status</span>
              </>
            )}
          </span>

          <span className="text-xs font-semibold text-foreground font-sans">
            {activeFocusCount}/{MAX_FOCUS_SLOTS} Focus / {activeRoutineCount}/{MAX_ROUTINE_SLOTS} Routines
          </span>
        </div>

        {/* 48x48dp Touch Target Quick Add Button */}
        {canAdd && onAddPressed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddPressed}
            className="size-11 min-w-[44px] sm:min-w-[48px] rounded-xl border-border/80 text-foreground hover:bg-muted/70 active:scale-[0.96] p-0 flex items-center justify-center transition-colors duration-150 shrink-0"
            aria-label="Add new commitment"
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Discrete Segmented Gauges */}
      <div className="mt-3.5 space-y-3">
        {/* Primary Focus Slot (Single prominent gauge) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Primary Focus (1)
            </span>
            <span>{isFocusLocked ? "Committed" : "Slot Open"}</span>
          </div>

          <div
            className={cn(
              "h-2.5 w-full rounded-full transition-colors duration-300 overflow-hidden border",
              isFocusLocked
                ? "bg-emerald-500/20 border-emerald-500/40"
                : "bg-muted/40 border-border/60 border-dashed"
            )}
          >
            <motion.div
              initial={false}
              animate={{ width: isFocusLocked ? "100%" : "0%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            />
          </div>
        </div>

        {/* Supporting Routines (5 Segmented Pills) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary/70" />
              Supporting Routines (5 max)
            </span>
            <span>{routineRemaining} available</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: MAX_ROUTINE_SLOTS }).map((_, index) => {
              const isFilled = index < activeRoutineCount;
              return (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-colors duration-300 border",
                    isFilled
                      ? "bg-primary border-primary/60 shadow-[0_0_6px_rgba(99,102,241,0.25)]"
                      : "bg-muted/30 border-border/50"
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Clear Guidance sub-line */}
      <p className="mt-3 text-[11px] text-muted-foreground font-sans leading-relaxed">
        {isFocusLocked
          ? routineRemaining > 0
            ? `Primary Focus locked for today. ${routineRemaining} supporting routine ${routineRemaining === 1 ? "slot" : "slots"} open.`
            : "Daily capacity locked. Focus exclusively on executing your commitments before adding more."
          : "Your primary focus slot is open. Commit to your single most leveraged anchor for today."}
      </p>
    </section>
  );
}
