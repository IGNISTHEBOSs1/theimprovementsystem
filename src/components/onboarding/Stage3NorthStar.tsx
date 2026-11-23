// src/components/onboarding/Stage3NorthStar.tsx
import React from "react";
import { Target, Compass, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Keyboard } from "@capacitor/keyboard";
import { isCapacitorNative } from "@/services/otaUpdateService";
import { triggerHaptic } from "@/lib/haptics";

interface Stage3Props {
  goal: string;
  category: string;
  onChange: (goal: string, category: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const INSPIRATION_CHIPS = [
  { text: "Build consistent 5-mile aerobic endurance at sub-8:00 pace", cat: "athletic", label: "Athletic" },
  { text: "Ship production software MVP and secure first 100 active users", cat: "engineering", label: "Engineering" },
  { text: "Read, annotate, and synthesize 12 foundational books", cat: "intellectual", label: "Intellectual" },
  { text: "Eliminate high-interest debt and build a 6-month cash reserve", cat: "financial", label: "Financial" },
];

export function Stage3NorthStar({ goal, category, onChange, onNext, onBack }: Stage3Props) {
  const charLimit = 80;
  const charsRemaining = charLimit - goal.length;
  const isOverLimit = charsRemaining < 0;
  const isMultiGoal = /\band\b|\balso\b|\bplus\b|\b,\s*\w+/i.test(goal);

  const handleChipClick = (text: string, cat: string) => {
    triggerHaptic.light();
    onChange(text, cat);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          Define your 90-day focus.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          One high-leverage objective. Maximum 80 characters.
        </p>
      </div>

      {/* Goal Input Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-[var(--shadow-card)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-500" /> Primary Objective
          </span>
          <span
            className={`font-mono text-[11px] tabular-nums font-semibold ${
              charsRemaining < 0
                ? "text-destructive"
                : charsRemaining < 12
                ? "text-amber-500"
                : "text-muted-foreground"
            }`}
          >
            {goal.length} / {charLimit}
          </span>
        </div>

        <label htmlFor="north-star-goal-input" className="sr-only">
          Primary 90-day focus objective
        </label>
        <textarea
          id="north-star-goal-input"
          enterKeyHint="done"
          rows={3}
          value={goal}
          maxLength={charLimit + 10}
          onChange={(e) => onChange(e.target.value, category || "custom")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (isCapacitorNative()) {
                Keyboard.hide().catch(() => {});
              }
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          placeholder="e.g. Ship production MVP and secure first 100 paying customers..."
          className="w-full resize-none rounded-xl border border-border/80 bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 transition-colors leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        />

        {/* Multi-goal warning */}
        {isMultiGoal && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
            <span className="leading-snug text-[11px]">
              Keep it to one objective. Multiple goals split focus and slow progress.
            </span>
          </motion.div>
        )}
      </div>

      {/* Quick Inspiration Chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-emerald-500" /> Or pick a proven baseline:
        </span>
        <div className="grid gap-1.5">
          {INSPIRATION_CHIPS.map((chip) => {
            const isSelected = goal === chip.text;
            return (
              <button
                key={chip.text}
                type="button"
                onClick={() => handleChipClick(chip.text, chip.cat)}
                className={`text-left rounded-xl border p-2.5 sm:p-3 min-h-[44px] text-xs transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-between gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                  isSelected
                    ? "border-emerald-500/50 bg-accent/60 text-foreground ring-1 ring-emerald-500/30 font-semibold"
                    : "border-border/80 bg-card hover:bg-muted/40 hover:border-foreground/20 text-foreground"
                }`}
              >
                <span className="text-foreground/90 group-hover:text-foreground transition-colors leading-snug flex-1 min-w-0 text-pretty text-[11px] sm:text-xs">
                  "{chip.text}"
                </span>
                <span className={`text-[10px] font-medium shrink-0 px-2 py-0.5 rounded-md border ${
                  isSelected
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                    : "text-muted-foreground bg-muted/60 border-border/60"
                }`}>
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 px-4 sm:px-5 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground text-xs sm:text-sm font-semibold transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!goal.trim() || isOverLimit}
          onClick={onNext}
          className="flex-1 min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Lock Focus</span>
        </button>
      </div>
    </div>
  );
}
