// src/components/onboarding/Stage5ExecutionAnchor.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Moon, Anchor, CheckCircle2, ArrowRight, Plus } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage5Props {
  timeWindow: "dawn" | "midday" | "evening";
  trigger: string;
  onChange: (timeWindow: "dawn" | "midday" | "evening", trigger: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_WINDOWS = [
  { id: "dawn", label: "Dawn", sub: "06:00 - 08:30", icon: Sunrise },
  { id: "midday", label: "Midday", sub: "12:00 - 13:30", icon: Sun },
  { id: "evening", label: "Evening", sub: "18:00 - 20:30", icon: Moon },
] as const;

const TRIGGERS = [
  "Immediately after morning coffee / tea",
  "Directly upon closing work workstation",
  "Before opening any email or communication apps",
  "Right after finishing my midday meal",
];

export function Stage5ExecutionAnchor({
  timeWindow,
  trigger,
  onChange,
  onNext,
  onBack,
}: Stage5Props) {
  const [customTrigger, setCustomTrigger] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleTimeSelect = (id: "dawn" | "midday" | "evening") => {
    triggerHaptic.light();
    onChange(id, trigger);
  };

  const handleTriggerSelect = (t: string) => {
    triggerHaptic.light();
    onChange(timeWindow, t);
  };

  const handleAddCustom = () => {
    const trimmed = customTrigger.trim();
    if (!trimmed) return;
    triggerHaptic.light();
    onChange(timeWindow, trimmed);
    setCustomTrigger("");
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          When will you execute?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          Anchor your daily block to a specific time and existing habit.
        </p>
      </div>

      {/* Sliding Pill Segmented Control */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5" id="time-window-label">
          Daily Primary Focus Window
        </label>
        <div className="grid grid-cols-3 gap-1 relative rounded-xl border border-border/80 bg-muted/50 p-1 shadow-xs" role="radiogroup" aria-labelledby="time-window-label">
          {TIME_WINDOWS.map((window) => {
            const isSelected = timeWindow === window.id;
            const Icon = window.icon;

            return (
              <button
                key={window.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleTimeSelect(window.id)}
                className={`relative py-2 px-1 rounded-lg text-center transition-colors z-10 min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeAnchorSegment"
                    transition={MOTION_PRESETS.smoothSpring}
                    className="absolute inset-0 rounded-lg bg-card border border-border/90 shadow-xs z-[-1]"
                  />
                )}
                <div className="flex flex-col items-center gap-0.5 min-w-0">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold tracking-tight">{window.label}</span>
                  <span className="text-[9px] opacity-70 font-mono tabular-nums tracking-tight truncate w-full">{window.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Anchor Triggers */}
      <div className="space-y-1.5 pt-0.5">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5" id="behavioral-trigger-label">
          <Anchor className="h-3.5 w-3.5 text-emerald-500" /> Behavioral Trigger Event
        </label>
        <div className="grid gap-1.5" role="radiogroup" aria-labelledby="behavioral-trigger-label">
          {TRIGGERS.map((t) => {
            const isSelected = trigger === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleTriggerSelect(t)}
                className={`w-full min-h-[44px] flex items-center justify-between rounded-xl border p-2.5 sm:p-3 text-left text-xs transition-colors active:scale-[0.98] motion-reduce:transform-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                  isSelected
                    ? "border-emerald-500/50 bg-accent/60 text-foreground font-semibold shadow-xs ring-1 ring-emerald-500/30"
                    : "border-border/80 bg-card hover:border-border hover:bg-muted/40 text-foreground shadow-xs"
                }`}
              >
                <span className="leading-relaxed text-[11px] sm:text-xs">"{t}"</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Custom trigger option */}
        <div className="pt-0.5">
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full min-h-[44px] rounded-xl border border-dashed border-border/90 hover:border-foreground/30 bg-muted/20 hover:bg-muted/40 px-3.5 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              <span>Define custom trigger</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                placeholder="e.g. Immediately after daily standup..."
                className="flex-1 h-11 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs active:scale-[0.96] motion-reduce:transform-none shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Set
              </button>
            </div>
          )}
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
          disabled={!trigger}
          onClick={onNext}
          className="flex-1 min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Confirm Anchor</span>
        </button>
      </div>
    </div>
  );
}
