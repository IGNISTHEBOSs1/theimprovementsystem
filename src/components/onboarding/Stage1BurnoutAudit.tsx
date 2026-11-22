// src/components/onboarding/Stage1BurnoutAudit.tsx
import React from "react";
import { motion } from "framer-motion";
import { Flame, Brain, HelpCircle, CalendarX2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage1Props {
  selectedReason: string | null;
  onSelect: (reason: string) => void;
  onNext: () => void;
}

const FAILURE_CARDS = [
  {
    id: "streak_trap",
    title: "Streak Guilt Trap",
    description: "A single missed day reset the counter, killing momentum.",
    icon: Flame,
    payoff: "Kinetic absorbs up to 9 missed days within a ±10% mathematical buffer cone.",
  },
  {
    id: "cognitive_overload",
    title: "Cognitive Overload",
    description: "Attempting too many habits at once led to rapid burnout.",
    icon: Brain,
    payoff: "Kinetic enforces strict discipline: 1 Primary Goal and 2 Daily Routines.",
  },
  {
    id: "vague_ambition",
    title: "Vague Ambition",
    description: "Goals lacked concrete daily pace or measurable milestones.",
    icon: HelpCircle,
    payoff: "Kinetic plots a deterministic trajectory with daily velocity checkpoints.",
  },
  {
    id: "rigid_schedules",
    title: "Rigid Schedules",
    description: "Unplanned disruptions broke an inflexible routine.",
    icon: CalendarX2,
    payoff: "Kinetic recalculates pace within your buffer instead of forcing a reset.",
  },
];

export function Stage1BurnoutAudit({ selectedReason, onSelect, onNext }: Stage1Props) {
  const handleCardClick = (id: string) => {
    triggerHaptic.light();
    onSelect(id);
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="space-y-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          What broke your consistency?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          Select the primary obstacle you encountered in past attempts.
        </p>
      </div>

      <div className="space-y-2.5 min-w-0" role="radiogroup" aria-label="Obstacles preventing consistency">
        {FAILURE_CARDS.map((card) => {
          const isSelected = selectedReason === card.id;
          const Icon = card.icon;

          return (
            <React.Fragment key={card.id}>
              <motion.div
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleCardClick(card.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    handleCardClick(card.id);
                  }
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  opacity: selectedReason && !isSelected ? 0.6 : 1.0,
                  scale: isSelected ? 1.01 : 1.0,
                }}
                transition={MOTION_PRESETS.snappySpring}
                className={`relative cursor-pointer rounded-xl border p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                  isSelected
                    ? "border-emerald-500/50 bg-accent/60 shadow-[var(--shadow-card)] ring-1 ring-emerald-500/30"
                    : "border-border/80 bg-card hover:border-border hover:bg-muted/40 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border/80 bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 stroke-[1.8]" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm sm:text-base font-semibold ${isSelected ? "text-foreground font-bold" : "text-foreground/90"}`}>
                        {card.title}
                      </h3>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Connected Kinetic Countermeasure Card - Appears directly below the selected option */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1.0 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={MOTION_PRESETS.snappySpring}
                  style={{ boxShadow: "inset 0 1px 1px 0 rgba(16, 185, 129, 0.25)" }}
                  className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 dark:bg-emerald-950/25 p-3.5 shadow-xs -mt-1 ml-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <ShieldCheck className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                        Kinetic Countermeasure
                      </span>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-pretty">
                        {card.payoff}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!selectedReason}
          onClick={onNext}
          className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Continue</span>
        </button>
      </div>
    </div>
  );
}
