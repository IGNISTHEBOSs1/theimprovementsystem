// src/components/onboarding/Stage7SovereignPact.tsx
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { OnboardingState } from "./types";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage7Props {
  state: OnboardingState;
  onCommit: () => Promise<void> | void;
  onBack: () => void;
}

export function Stage7SovereignPact({ state, onCommit, onBack }: Stage7Props) {
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const [isHolding, setIsHolding] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastHapticTickRef = useRef<number>(0);

  const HOLD_DURATION = 1100; // 1.1s
  const EARLY_SNAP_THRESHOLD = 0.90; // 90% snap

  const executeCommit = async () => {
    if (committed || isSubmitting) return;
    setHoldProgress(1.0);
    setCommitted(true);
    setIsSubmitting(true);
    triggerHaptic.success();
    try {
      await onCommit();
    } catch (err) {
      console.error("Commit error in Stage7:", err);
      setIsSubmitting(false);
      setCommitted(false);
    }
  };

  const startHold = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (committed || isSubmitting) return;
    if (e) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore fallback
      }
    }

    setIsHolding(true);
    const now = performance.now();
    startTimeRef.current = now;
    lastHapticTickRef.current = now;
    triggerHaptic.light();

    const loop = (time: number) => {
      const elapsed = time - (startTimeRef.current || time);
      const current = Math.min(1.0, elapsed / HOLD_DURATION);

      // Rapid mechanical haptic pulses in constant time (machine-gun cadence)
      if (time - lastHapticTickRef.current >= 110) {
        lastHapticTickRef.current = time;
        triggerHaptic.light();
      }

      if (current >= EARLY_SNAP_THRESHOLD) {
        void executeCommit();
        return;
      }

      setHoldProgress(current);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
  };

  const endHold = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (committed || isSubmitting) return;
    if (e) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore fallback
      }
    }

    setIsHolding(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const rewindStart = performance.now();
    const initialProgress = holdProgress;

    const rewindLoop = (time: number) => {
      const elapsed = time - rewindStart;
      const progress = Math.max(0, initialProgress - elapsed / 300);
      setHoldProgress(progress);
      if (progress > 0) {
        requestRef.current = requestAnimationFrame(rewindLoop);
      }
    };

    requestRef.current = requestAnimationFrame(rewindLoop);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      if (!isHolding && !committed && !isSubmitting) {
        e.preventDefault();
        startHold();
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      if (isHolding && !committed) {
        e.preventDefault();
        endHold();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          Seal Your Trajectory Contract
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto text-pretty">
          Confirm your parameters to launch your personal operating system.
        </p>
      </div>

      {/* Tactile Covenant Parchment Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-[var(--shadow-card)] space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">
              Trajectory Covenant
            </span>
          </div>
          <span className="text-[10px] text-foreground/80 font-medium px-2 py-0.5 rounded bg-muted border border-border shrink-0">
            Ready to seal
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-border/60 gap-2">
            <span className="text-muted-foreground text-xs shrink-0">Region</span>
            <span className="text-foreground font-semibold text-xs truncate text-right">{state.country} ({state.utcOffset})</span>
          </div>
          <div className="py-1 border-b border-border/60 space-y-0.5">
            <span className="text-muted-foreground text-xs">North Star (<span className="font-mono tabular-nums">90</span> days)</span>
            <p className="text-foreground font-semibold font-sans text-xs leading-snug">{state.primaryGoal}</p>
          </div>
          <div className="py-1 border-b border-border/60 space-y-0.5">
            <span className="text-muted-foreground text-xs">Supporting routines</span>
            <ul className="text-foreground font-sans list-disc list-inside space-y-0.5 text-xs">
              {state.supportingRoutines.map((r, i) => (
                <li key={i} className="text-foreground/90">{r}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/60 gap-2">
            <span className="text-muted-foreground text-xs shrink-0">Time window</span>
            <span className="text-foreground font-semibold text-xs capitalize">{state.timeWindow} session</span>
          </div>
          <div className="py-1 border-b border-border/60 space-y-0.5">
            <span className="text-muted-foreground text-xs">Execution trigger</span>
            <p className="text-foreground font-sans text-xs">{state.contextualTrigger}</p>
          </div>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="text-muted-foreground text-xs shrink-0">Buffer capacity</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs"><span className="font-mono tabular-nums">9</span> Flex Days (±10%)</span>
          </div>
        </div>
      </div>

      {/* Commanding Press-and-Hold Centerpiece */}
      <div className="space-y-3 pt-3">
        {/* Status Callout / Beacon */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </span>
          <span className="font-medium text-foreground/80">Final verification required</span>
        </div>

        <motion.button
          type="button"
          disabled={isSubmitting}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          style={{ WebkitTouchCallout: "none" }}
          role="progressbar"
          aria-valuenow={Math.round(holdProgress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Hold to initialize trajectory"
          animate={{
            scale: isHolding ? 0.98 : committed ? 1.01 : 1.0,
            boxShadow: isHolding
              ? `0 0 35px rgba(16, 185, 129, ${0.25 + holdProgress * 0.45}), inset 0 1px 1px 0 rgba(255,255,255,0.3)`
              : "0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px 0 rgba(255,255,255,0.2)",
          }}
          transition={MOTION_PRESETS.holdDepression}
          className="relative w-full h-24 sm:h-28 select-none touch-none overflow-hidden rounded-2xl border-2 border-foreground/40 bg-card/90 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer active:cursor-grabbing disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground shadow-lg"
        >
          {/* Progress fill track */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 z-0"
            style={{ width: `${holdProgress * 100}%` }}
          >
            {/* Glowing laser edge line on the leading edge */}
            {isHolding && (
              <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white shadow-md blur-[1px]" />
            )}
          </motion.div>

          <div
            className={`relative z-10 flex flex-col items-center justify-center text-center px-4 transition-colors ${
              holdProgress > 0.45 ? "text-slate-950" : "text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 motion-safe:animate-spin text-current" />
              ) : committed ? (
                <CheckCircle2 className="h-6 w-6 text-current" />
              ) : (
                <Shield className={`h-6 w-6 ${holdProgress > 0.45 ? "text-slate-950" : "text-emerald-500"} transition-colors`} />
              )}
              <span className="text-base sm:text-lg font-extrabold tracking-tight">
                {isSubmitting
                  ? "Initializing Cockpit…"
                  : committed
                  ? "Trajectory Initialized"
                  : isHolding
                  ? `Hold to Initialize (${Math.round(holdProgress * 100)}%)`
                  : "Hold to Initialize Trajectory"}
              </span>
            </div>

            <span
              className={`text-xs mt-1 font-semibold transition-opacity ${
                holdProgress > 0.45 ? "text-slate-900/90" : "text-muted-foreground"
              }`}
            >
              {isSubmitting
                ? "Connecting personal cockpit"
                : committed
                ? "Operating system active"
                : isHolding
                ? "Calibrating 90-day covenant"
                : "Hold to seal parameters"}
            </span>
          </div>
        </motion.button>

        <div className="flex flex-col items-center gap-1.5 pt-1.5">
          <button
            type="button"
            onClick={onBack}
            disabled={isHolding || committed || isSubmitting}
            className="min-h-[44px] px-4 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded flex items-center justify-center"
          >
            Adjust Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
