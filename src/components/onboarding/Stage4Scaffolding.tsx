// src/components/onboarding/Stage4Scaffolding.tsx
import React, { useState } from "react";
import { Check, Plus, Lock, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface Stage4Props {
  selectedRoutines: string[];
  onChange: (routinesOrFn: string[] | ((prev: string[]) => string[])) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_ROUTINES = [
  "90-minute uninterrupted deep work execution block",
  "Daily production code push or architectural review",
  "45-minute Zone 2 aerobic cardio or resistance session",
  "Daily 15-minute joint mobility & active recovery routine",
  "8 hours non-negotiable sleep & recovery protocol",
  "Read 20 pages of foundational technical literature",
  "1 proactive customer or stakeholder outreach dialog",
];

const MAX_ROUTINES = 5;

export function Stage4Scaffolding({ selectedRoutines, onChange, onNext, onBack }: Stage4Props) {
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  const triggerBump = () => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 250);
  };

  const handleToggle = (routine: string) => {
    triggerBump();
    onChange((prev) => {
      const isSelected = prev.includes(routine);
      if (isSelected) {
        triggerHaptic.light();
        return prev.filter((r) => r !== routine);
      }
      if (prev.length >= MAX_ROUTINES) {
        triggerHaptic.error();
        return prev;
      }
      triggerHaptic.light();
      return [...prev, routine];
    });
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedRoutines.length >= MAX_ROUTINES) return;
    triggerHaptic.light();
    triggerBump();
    onChange([...selectedRoutines, trimmed]);
    setCustomInput("");
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
            Select supporting routines.
          </h2>
          {/* Spring-bumped counter badge */}
          <motion.div
            animate={{ scale: badgeBump ? 1.15 : 1.0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs ${
              selectedRoutines.length === MAX_ROUTINES
                ? "bg-accent text-accent-foreground border border-border"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {selectedRoutines.length === MAX_ROUTINES ? (
              <Lock className="h-2.5 w-2.5 text-emerald-500" />
            ) : (
              <Layers className="h-2.5 w-2.5 text-muted-foreground" />
            )}
            <span>Selected: <span className="font-mono tabular-nums font-bold">{selectedRoutines.length} / {MAX_ROUTINES}</span></span>
          </motion.div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          Choose up to 5 daily habits that directly advance your 90-day focus.
        </p>
      </div>

      <div className="grid gap-1.5" role="group" aria-label="Supporting routines">
        {PRESET_ROUTINES.map((routine) => {
          const isSelected = selectedRoutines.includes(routine);
          const isDisabled = !isSelected && selectedRoutines.length >= MAX_ROUTINES;

          return (
            <button
              key={routine}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => handleToggle(routine)}
              className={`w-full min-h-[44px] flex items-center justify-between rounded-xl border p-2.5 sm:p-3 text-left text-xs transition-colors active:scale-[0.98] motion-reduce:transform-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? "border-emerald-500/50 bg-accent/60 text-foreground font-semibold shadow-xs ring-1 ring-emerald-500/30"
                  : isDisabled
                  ? "border-border/40 bg-muted/20 text-muted-foreground/50 opacity-40 cursor-not-allowed"
                  : "border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40 shadow-xs"
              }`}
            >
              <span className="pr-3 leading-snug text-[11px] sm:text-xs">{routine}</span>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                    : isDisabled
                    ? "border-border/40 bg-muted/40 text-muted-foreground/40"
                    : "border-border/90 bg-muted/30 text-muted-foreground/70"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                {!isSelected && !isDisabled && <Plus className="h-3 w-3 stroke-[2.2] opacity-70" />}
                {isDisabled && <Lock className="h-2.5 w-2.5 text-muted-foreground/60" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom routine add option */}
      {selectedRoutines.length < MAX_ROUTINES && (
        <div className="pt-0.5">
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full min-h-[44px] rounded-xl border border-dashed border-border/90 hover:border-foreground/30 bg-muted/20 hover:bg-muted/40 px-3.5 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              <span>Define custom routine</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                id="custom-routine-input"
                aria-label="Custom routine title"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder="e.g. 20-min vocal warm-up..."
                className="flex-1 h-11 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs active:scale-[0.96] motion-reduce:transform-none shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

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
          disabled={selectedRoutines.length === 0}
          onClick={onNext}
          className="flex-1 min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Lock Routines (<span className="font-mono tabular-nums">{selectedRoutines.length}/{MAX_ROUTINES}</span>)</span>
        </button>
      </div>
    </div>
  );
}
