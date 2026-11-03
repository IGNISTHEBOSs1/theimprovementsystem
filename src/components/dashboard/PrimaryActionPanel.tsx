import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowRight, Check, ChevronRight, CircleDot, Loader2, Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

interface PrimaryActionPanelProps {
  quest?: Quest;
  completing?: boolean;
  onComplete: () => void;
  onChooseQuest: () => void;
  completedGoalQuests?: number;
}



export function PrimaryActionPanel({ quest, completing, onComplete, onChooseQuest, completedGoalQuests = 0 }: PrimaryActionPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [completionStage, setCompletionStage] = useState<"idle" | "complete">("idle");

  const handleActionComplete = () => {
    if (completing || completionStage !== "idle") return;
    if (shouldReduceMotion) {
      onComplete();
      return;
    }
    setCompletionStage("complete");
    setTimeout(() => {
      onComplete();
    }, 280);
  };

  if (!quest) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="focus-heading">
        <p className="text-xs font-semibold text-primary">Today&apos;s focus</p>
        <h2 id="focus-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Begin with one meaningful action.
        </h2>
        <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
          Your next commitment starts here.
        </p>
        <Button className="mt-6 min-h-11" onClick={onChooseQuest}>
          Choose today&apos;s focus <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </section>
    );
  }

  return (
    <motion.section
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={
        completionStage === "complete" && !shouldReduceMotion
          ? {
              scale: 0.94,
              x: 280,
              opacity: 0,
              filter: "blur(4px)",
              transition: {
                duration: 0.28,
                ease: TIS_EASINGS.exitDecel,
              },
            }
          : { scale: 1, x: 0, opacity: 1, y: 0, filter: "blur(0px)" }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : {
              scale: 0.94,
              x: 280,
              opacity: 0,
              filter: "blur(4px)",
              transition: { duration: 0.28, ease: TIS_EASINGS.exitDecel },
            }
      }
      transition={{
        layout: TIS_SPRINGS.settle,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl glass-hero p-5 sm:p-7 transition-colors duration-250",
        completionStage !== "idle" && "bg-emerald-500/[0.08] border-emerald-500/40"
      )}
      aria-labelledby="focus-heading"
    >
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <CircleDot className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>Today&apos;s Focus {quest.timeFrame ? `· ${quest.timeFrame}` : ""}</span>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline-block">
          Primary milestone · Slide or click to confirm
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2
            id="focus-heading"
            className={cn(
              "text-xl sm:text-2xl font-bold tracking-tight text-foreground transition-all line-clamp-3 break-words leading-snug",
              completionStage !== "idle" && "line-through text-muted-foreground",
            )}
          >
            {quest.title}
          </h2>

          {quest.linkedToGoal ? (
            <div className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Target className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed break-words">
                Step <strong className="text-foreground font-semibold font-mono">{completedGoalQuests + 1}</strong> of 90 toward{" "}
                <strong className="text-foreground font-medium">{quest.goalName || "North Star"}</strong>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              One clear step is enough. Start here.
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto sm:shrink-0 mt-1 sm:mt-0">
          <SwipeToComplete
            key={quest.id}
            completing={Boolean(completing)}
            onComplete={handleActionComplete}
            linkedToGoal={Boolean(quest.linkedToGoal)}
            stepNumber={completedGoalQuests + 1}
            totalSteps={90}
          />
          <p className="text-[11px] text-muted-foreground text-center sm:text-right mt-1.5 sm:mt-1">
            Intentional confirmation for your main milestone.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

interface SwipeToCompleteProps {
  completing: boolean;
  onComplete: () => void;
  linkedToGoal?: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

function SwipeToComplete({
  completing,
  onComplete,
  linkedToGoal = false,
  stepNumber,
  totalSteps = 90,
}: SwipeToCompleteProps) {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLButtonElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const wavefrontRef = useRef<HTMLDivElement>(null);
  const textMaskRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const hasCrossedThresholdRef = useRef(false);
  const samplesRef = useRef<Array<{ x: number; time: number }>>([]);
  const activePointerIdRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef(false);

  const [thresholdMet, setThresholdMet] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const HANDLE_SIZE = 40;
  const THRESHOLD = 0.65;

  const maxDrag = () => Math.max(0, (trackRef.current?.clientWidth ?? 0) - HANDLE_SIZE - 8);

  const updateDOMPosition = (x: number) => {
    if (handleRef.current) {
      handleRef.current.style.transform = `translate3d(${x}px, -50%, 0)`;
    }
    if (wavefrontRef.current) {
      const w = x > 0 ? x + HANDLE_SIZE : 0;
      wavefrontRef.current.style.width = `${w}px`;
    }
    if (textMaskRef.current) {
      const fadeStart = Math.max(0, x + 8);
      const fadeEnd = x + 38;
      textMaskRef.current.style.maskImage = `linear-gradient(to right, transparent 0px, transparent ${fadeStart}px, black ${fadeEnd}px, black 100%)`;
      textMaskRef.current.style.webkitMaskImage = `linear-gradient(to right, transparent 0px, transparent ${fadeStart}px, black ${fadeEnd}px, black 100%)`;
    }
  };

  const animateSettling = useCallback(
    (x0: number, xt: number, v0: number, onSettled?: () => void) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (shouldReduceMotion) {
        updateDOMPosition(xt);
        dragXRef.current = xt;
        onSettled?.();
        return;
      }

      const startTime = performance.now();
      // Damped harmonic oscillator: near-critical damping (ζ ≈ 0.92)
      // ω0 = 0.01844 rad/ms, ζ = 0.922, ωd = 0.00714 rad/ms
      const omega0 = 0.01844;
      const zeta = 0.922;
      const omegaD = 0.00714;
      const delta = x0 - xt;
      const A = delta;
      const B = (v0 + zeta * omega0 * delta) / omegaD;
      const max = maxDrag();

      const tick = (now: number) => {
        const t = Math.max(0, now - startTime);
        const decay = Math.exp(-zeta * omega0 * t);
        const cosVal = Math.cos(omegaD * t);
        const sinVal = Math.sin(omegaD * t);

        const pos = xt + decay * (A * cosVal + B * sinVal);
        const vel = decay * ((-zeta * omega0 * A + omegaD * B) * cosVal + (-zeta * omega0 * B - omegaD * A) * sinVal);

        const clampedPos = Math.max(0, Math.min(max, pos));
        updateDOMPosition(clampedPos);
        dragXRef.current = clampedPos;

        const isNearRest = Math.abs(pos - xt) < 0.4 && Math.abs(vel) < 0.03;
        if ((t > 40 && isNearRest) || t > 450) {
          updateDOMPosition(xt);
          dragXRef.current = xt;
          rafIdRef.current = null;
          onSettled?.();
        } else {
          rafIdRef.current = requestAnimationFrame(tick);
        }
      };

      rafIdRef.current = requestAnimationFrame(tick);
    },
    [shouldReduceMotion]
  );

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!completing && isDone) {
      const timer = setTimeout(() => {
        setIsDone(false);
        setThresholdMet(false);
        isSubmittingRef.current = false;
        hasCrossedThresholdRef.current = false;
        animateSettling(dragXRef.current, 0, 0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completing, isDone, animateSettling]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (completing || isDone || isSubmittingRef.current) return;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    trackRef.current?.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    draggingRef.current = true;
    movedRef.current = false;
    dragXRef.current = 0;
    samplesRef.current = [{ x: 0, time: performance.now() }];
    updateDOMPosition(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || completing || isDone || isSubmittingRef.current) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const max = maxDrag();
    const x = Math.min(Math.max(e.clientX - rect.left - HANDLE_SIZE / 2, 0), max);
    if (x > 3) movedRef.current = true;
    dragXRef.current = x;

    const now = performance.now();
    samplesRef.current.push({ x, time: now });
    while (samplesRef.current.length > 1 && now - samplesRef.current[0].time > 100) {
      samplesRef.current.shift();
    }

    updateDOMPosition(x);

    const progress = max > 0 ? x / max : 0;
    if (!hasCrossedThresholdRef.current && progress >= THRESHOLD) {
      hasCrossedThresholdRef.current = true;
      triggerHaptic("selection");
      soundEngine.playDetent();
      setThresholdMet(true);
    } else if (hasCrossedThresholdRef.current && progress < THRESHOLD) {
      hasCrossedThresholdRef.current = false;
      setThresholdMet(false);
    }
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (trackRef.current && activePointerIdRef.current !== null) {
      try {
        trackRef.current.releasePointerCapture(activePointerIdRef.current);
      } catch {
        // Safe no-op
      }
      activePointerIdRef.current = null;
    }

    const max = maxDrag();
    const currentX = dragXRef.current;
    const progress = max > 0 ? currentX / max : 0;

    // Calculate release velocity from recent window (px/ms)
    const samples = samplesRef.current;
    let velocity = 0;
    if (samples.length >= 2) {
      const oldest = samples[0];
      const newest = samples[samples.length - 1];
      const dt = newest.time - oldest.time;
      if (dt > 4) {
        velocity = (newest.x - oldest.x) / dt;
      }
    }
    const cappedVelocity = Math.max(-2.0, Math.min(2.0, velocity));

    // Completion occurs only after a valid release at or beyond the threshold
    const isSuccess = progress >= THRESHOLD;

    if (isSuccess && !isSubmittingRef.current && !completing && !isDone) {
      isSubmittingRef.current = true;
      setIsDone(true);
      triggerHaptic("success");
      soundEngine.playLockIn();

      animateSettling(currentX, max, cappedVelocity, () => {
        completeTimerRef.current = setTimeout(() => {
          onComplete();
        }, 120);
      });
    } else {
      setThresholdMet(false);
      hasCrossedThresholdRef.current = false;
      animateSettling(currentX, 0, cappedVelocity);
    }
  };

  const handleClick = () => {
    // Accessible fallback: tap, Enter, or Space directly confirms without dragging
    if (!movedRef.current && !completing && !isDone && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      setIsDone(true);
      setThresholdMet(true);
      triggerHaptic("success");
      soundEngine.playLockIn();
      const max = maxDrag();

      animateSettling(0, max, 1.0, () => {
        completeTimerRef.current = setTimeout(() => {
          onComplete();
        }, 120);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (completing || isDone || isSubmittingRef.current) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleClick();
    }
  };

  const handlePointerCancel = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    activePointerIdRef.current = null;
    setThresholdMet(false);
    hasCrossedThresholdRef.current = false;
    animateSettling(dragXRef.current, 0, 0);
  };

  const confirmationMessage =
    linkedToGoal && stepNumber !== undefined
      ? `Step ${stepNumber} of ${totalSteps} confirmed`
      : "Completed";

  return (
    <button
      ref={trackRef}
      type="button"
      disabled={completing || isDone}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
      className={cn(
        "relative flex h-12 w-full sm:w-64 sm:shrink-0 items-center overflow-hidden rounded-full px-1 text-left touch-none select-none transition-all duration-200 border glass-slider-track focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        thresholdMet && !isDone && "glass-slider-track-ready",
        isDone && "border-emerald-500/50 bg-emerald-500/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
      )}
      aria-label={
        isDone
          ? `Primary focus confirmed: ${confirmationMessage}`
          : completing
          ? "Saving primary focus completion…"
          : thresholdMet
          ? "Threshold reached. Release to lock in primary focus"
          : "Complete today’s primary focus (swipe slider, click track, or press Enter)"
      }
    >
      {/* Restrained Emerald Wavefront Fill */}
      <div
        ref={wavefrontRef}
        className={cn(
          "glass-slider-wavefront",
          thresholdMet && "glass-slider-wavefront-ready"
        )}
        style={{ width: 0 }}
        aria-hidden="true"
      />

      {/* Instruction text with dynamic handle opacity mask */}
      {!isDone && (
        <div
          ref={textMaskRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 pr-4 select-none text-sm font-medium transition-colors duration-200"
          style={{
            maskImage: "linear-gradient(to right, transparent 0px, transparent 10px, black 38px, black 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0px, transparent 10px, black 38px, black 100%)",
          }}
        >
          <span
            className={cn(
              "truncate transition-colors duration-200",
              thresholdMet
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-foreground/90 font-medium"
            )}
          >
            {completing
              ? "Saving…"
              : thresholdMet
              ? "Release to lock in"
              : "Slide to complete"}
          </span>
        </div>
      )}

      {/* Confirmed completion progress state */}
      {isDone && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-4 pr-12 select-none text-sm font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in zoom-in-95 duration-200">
          <span className="truncate">{confirmationMessage}</span>
        </div>
      )}

      {/* Tactile Handle Puck */}
      <span
        ref={handleRef}
        className={cn(
          "pointer-events-none absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.98]",
          isDone
            ? "glass-slider-handle-done"
            : thresholdMet
            ? "glass-slider-handle glass-slider-handle-ready"
            : "glass-slider-handle"
        )}
        style={{ transform: "translate3d(0px, -50%, 0)" }}
      >
        {isDone ? (
          <Check className="size-4 stroke-[3] text-white animate-in zoom-in-75 duration-200" aria-hidden="true" />
        ) : (
          <ArrowRight
            className={cn(
              "size-4 transition-colors duration-200",
              thresholdMet ? "text-emerald-600 dark:text-emerald-400 stroke-[2.5]" : "text-foreground"
            )}
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  );
}
