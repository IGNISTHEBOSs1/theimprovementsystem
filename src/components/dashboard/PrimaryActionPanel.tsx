import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowRight, Check, ChevronRight, CircleDot, Target, Loader2, Zap, Timer, Sliders } from "lucide-react";
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
}

// Founder Decision (Kinetic visual toolkit chunk — USE: Spotlight Card,
// adapted): the principle borrowed here is "draw the eye toward what
// matters right now" — not the reference component's literal
// implementation. Applied only to today's single active Quest (the one
// surface the whole "priority areas" brief names first), not to any
// other card. Desktop-only by construction: the pointer listener is
// only ever attached when `(hover: hover) and (pointer: fine)` matches,
// so touch devices get zero JS cost and zero visual difference — same
// scoping the brief asks for on Tilt effects. Uses only the existing
// --primary token at low opacity; no new color introduced. Purely
// decorative (aria-hidden, pointer-events-none) — never affects layout,
// tap targets, or content, and is capped as a fixed-size soft radius, not
// a spreading glow, so it stays a focus cue rather than a light show.
function useSpotlight() {
  const ref = useRef<HTMLElement>(null);
  const [enabled, setEnabled] = useState(false);

  const bind = (node: HTMLElement | null) => {
    ref.current = node;
    if (!node || enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    node.addEventListener("pointermove", (e) => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
      node.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
    });
  };

  return { bind, enabled };
}

export function PrimaryActionPanel({ quest, completing, onComplete, onChooseQuest }: PrimaryActionPanelProps) {
  const spotlight = useSpotlight();
  const shouldReduceMotion = useReducedMotion();
  const [completionStage, setCompletionStage] = useState<"idle" | "complete">("idle");

  const handleActionComplete = () => {
    if (completing || completionStage !== "idle") return;
    triggerHaptic("success");
    soundEngine.playSuccess();
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
      <section
        className="rounded-3xl border border-[rgba(148,163,184,0.18)] bg-[#12141A] p-5 sm:p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
        aria-labelledby="focus-heading"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-white/10 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
          <span className="size-1.5 rounded-full bg-white" />
          <span>PRIMARY FOCUS · ANCHOR</span>
        </div>
        <h2 id="focus-heading" className="mt-3 text-2xl font-bold tracking-tight text-foreground font-sans">
          Begin with one meaningful action.
        </h2>
        <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
          Your primary focus anchor sets the trajectory for today.
        </p>
        <Button
          className="mt-6 min-h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4)] active:scale-[0.98]"
          onClick={onChooseQuest}
        >
          Choose today&apos;s primary focus <ChevronRight className="size-4 ml-1" aria-hidden="true" />
        </Button>
      </section>
    );
  }

  return (
    <motion.section
      ref={spotlight.bind}
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
        "relative overflow-hidden rounded-3xl border border-[rgba(148,163,184,0.18)] bg-[#12141A]/95 p-5 sm:p-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_36px_-4px_rgba(0,0,0,0.65)] transition-all duration-250 backdrop-blur-xl",
        completionStage !== "idle" && "bg-white/[0.12] border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.2)]"
      )}
      aria-labelledby="focus-heading"
    >
      {/* Subtle top decorative glowing bar (1:1 Stitch Spec) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />

      {spotlight.enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: "radial-gradient(240px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255, 255, 255, 0.08), transparent 70%)",
          }}
        />
      )}
      
      {/* Card Header (1:1 Stitch Spec) */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#181B24] border border-white/20 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
              DEEP WORK FOCUS
            </span>
            <span className="flex items-center gap-1 text-white font-mono text-[10px] font-bold">
              <Zap className="size-3 text-white" aria-hidden="true" />
              +35% THRUST
            </span>
          </div>
          <h2 id="focus-heading" className={cn("text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans transition-all", completionStage !== "idle" && "line-through text-muted-foreground")}>
            {quest.title}
          </h2>
        </div>
        <div className="size-10 shrink-0 rounded-2xl bg-[#181B24] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
          <Target className="size-5" aria-hidden="true" />
        </div>
      </div>

      {/* Telemetry Sparkline & Progress Bar (1:1 Stitch Spec) */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground flex items-center gap-1">
            <Timer className="size-3 text-muted-foreground" aria-hidden="true" />
            ELAPSED / TARGET
          </span>
          <span className="text-foreground font-semibold tracking-wider tnum">
            {quest.timeFrame || "1h 45m"} <span className="text-muted-foreground">/ 2h 30m</span>
          </span>
        </div>
        {/* Dual Linear Capacity Meter Bar */}
        <div className="h-2 w-full bg-[#0C0E14] rounded-full p-0.5 border border-[rgba(148,163,184,0.16)] flex items-center">
          <div className="h-full bg-gradient-to-r from-zinc-500 to-white rounded-full relative" style={{ width: "70%" }}>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-[#090A0F]" />
          </div>
        </div>
        {/* Micro Trajectory Markers */}
        <div className="flex justify-between items-center px-1 text-[10px] font-mono text-muted-foreground">
          <span>0m</span>
          <span>Sprint Peak: 1h 30m</span>
          <span className="text-white font-bold">70% Reached</span>
        </div>
      </div>

      {/* Interactive Focus Controls & Swipe/Complete Action (1:1 Stitch Spec) */}
      <div className="mt-5 pt-4 border-t border-[rgba(148,163,184,0.14)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-[#181B24] flex items-center justify-center text-white border border-[rgba(148,163,184,0.16)] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]">
            <Sliders className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">
              Sprint Mode: Intense
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Audio shield: Active
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto sm:shrink-0">
          <SwipeToComplete key={quest.id} completing={Boolean(completing)} onComplete={handleActionComplete} />
        </div>
      </div>
    </motion.section>
  );
}

// Founder Decision (Visual override chunk — swipe-to-complete): replaces
// the previous plain "Mark complete" button with a drag-to-confirm
// track, by explicit Founder instruction. Still calls the exact same
// onComplete() the button called — no change to what completing a Quest
// actually does or persists, only how the action is triggered. Kept
// keyboard/screen-reader accessible: this is a real <button>, so Enter/
// Space/click activate it directly via onClick regardless of drag state —
// swiping is an added interaction, not a replacement for a working
// accessible control. Pointer events (not mouse-only), so touch and
// desktop both work through one code path.
// Founder Decision (Visual override chunk — swipe-to-complete, bug fix):
// root cause of the reported "stuck" behavior — setPointerCapture was
// called on e.target, which is whatever child element the drag actually
// started on (e.g. the label text span), not the track. Capture should
// always be set on the SAME element whose handlers process the drag
// (the track itself); capturing on an arbitrary child is the standard
// footgun with this pattern. If that child ever failed to deliver the
// matching pointerup back correctly, `dragging` never reset, leaving the
// handle frozen at its last dragged position. Rewritten to: (1) capture
// on trackRef.current explicitly; (2) drive the handle's position via a
// ref + direct style mutation during drag, not React state on every
// pointermove — removes a full render cycle per move event, and removes
// any dependency on a possibly-stale `dragging` state value; (3) a plain
// tap (no real movement) still completes via onClick, but a real drag's
// completion is handled exactly once, directly in finishDrag — the
// previous version could double-fire onComplete after a real swipe
// (finishDrag calling it, then the native click event calling it again).
// Founder Decision (Visual override chunk — swipe-to-complete, feel pass & closure):
// (1) Velocity-based completion — a fast flick that doesn't cross the
//     65% distance threshold used to just snap back and do nothing,
//     which reads as broken/unsatisfying on a confident swipe. Now a
//     flick above ~0.9 px/ms completes even under threshold, the same
//     momentum-dismissal pattern used by e.g. Sonner's toast swipe.
// (2) Real-time visual feedback via setTrackFill as drag crosses the
//     completion threshold without triggering browser intervention
//     (navigator.vibrate requires user activation, blocked during pointermove).
//     Completion haptics fire reliably on release via finishDrag.
// (3) On success the handle animates to the END of the track (a
//     real "completed" position, spring-eased) and morphs to a Check
//     icon with success tokens. A 240ms cognitive closure delay holds
//     the confirmed state before queue advance, providing clear task
//     closure before the next quest appears with an auto-reset handle.
function SwipeToComplete({ completing, onComplete }: { completing: boolean; onComplete: () => void }) {
  const trackRef = useRef<HTMLButtonElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const crossedRef = useRef(false);
  const startTimeRef = useRef(0);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDone, setIsDone] = useState(false);
  const HANDLE_SIZE = 40;
  const THRESHOLD = 0.65;
  const FLICK_VELOCITY = 0.9; // px/ms — a confident flick completes even under the distance threshold

  const maxDrag = () => (trackRef.current?.clientWidth ?? 0) - HANDLE_SIZE - 8;

  // Direct 1:1 position during an active drag (handled entirely via ref
  // + style mutation, still zero re-renders per move) — a slider's
  // handle must track the finger exactly while it's actually under the
  // finger, or it stops feeling "instant." The spring/eased motion
  // below only ever applies AFTER release, never during.
  const setHandleX = (x: number, mode: "instant" | "settle" | "snap") => {
    const handle = handleRef.current;
    if (!handle) return;
    if (mode === "instant") {
      handle.style.transition = "none";
    } else if (mode === "settle") {
      // Slight overshoot on the way to "completed" — a spring curve,
      // not a linear ease, so landing at the end reads as a satisfying
      // pop rather than a mechanical stop.
      handle.style.transition = "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    } else {
      handle.style.transition = "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)";
    }
    handle.style.transform = `translate3d(${x}px, -50%, 0)`;
  };

  const setTrackFill = (progress: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animate ? "background-color 220ms ease" : "none";
    // Real-time visual feedback tied to actual drag progress, not just
    // the handle moving — the track itself warms from neutral toward
    // primary as you approach the threshold, so the track is telling
    // you how close you are, not just the handle's raw position.
    track.style.backgroundColor = `hsl(var(--primary) / ${(0.12 + progress * 0.28).toFixed(3)})`;
  };

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // If completing finished or errored and this component didn't unmount (e.g. network error),
    // cleanly snap back the handle after a short grace period.
    if (!completing && isDone) {
      const timer = setTimeout(() => {
        setIsDone(false);
        setHandleX(0, "snap");
        if (trackRef.current) {
          trackRef.current.style.backgroundColor = "";
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completing, isDone]);

  const handlePointerDown = (e: PointerEvent) => {
    if (completing || isDone) return;
    trackRef.current?.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    movedRef.current = false;
    crossedRef.current = false;
    dragXRef.current = 0;
    startTimeRef.current = performance.now();
    setHandleX(0, "instant");
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!draggingRef.current || completing || isDone) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const max = maxDrag();
    const x = Math.min(Math.max(e.clientX - rect.left - HANDLE_SIZE / 2, 0), max);
    if (x > 2) movedRef.current = true;
    dragXRef.current = x;
    setHandleX(x, "instant");
    const progress = max > 0 ? x / max : 0;
    setTrackFill(progress, false);
    if (!crossedRef.current && progress >= THRESHOLD) {
      crossedRef.current = true;
    } else if (crossedRef.current && progress < THRESHOLD) {
      // Dragged back below the line — let it re-trigger if crossed again
      crossedRef.current = false;
    }
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const max = maxDrag();
    const elapsed = Math.max(performance.now() - startTimeRef.current, 1);
    const velocity = dragXRef.current / elapsed;
    const distanceMet = max > 0 && dragXRef.current / max >= THRESHOLD;
    const flickMet = movedRef.current && velocity >= FLICK_VELOCITY && dragXRef.current > HANDLE_SIZE;
    const success = distanceMet || flickMet;

    if (success) {
      setIsDone(true);
      if (trackRef.current) {
        trackRef.current.style.backgroundColor = "";
      }
      setHandleX(max, "settle");
      triggerHaptic("success");
      completeTimerRef.current = setTimeout(() => {
        onComplete();
      }, 280);
    } else {
      setTrackFill(0, true);
      setHandleX(0, "snap");
    }
    dragXRef.current = 0;
  };

  const handleClick = () => {
    // Only reached for a plain tap with no real movement — a genuine
    // drag's completion is already handled in finishDrag above, once.
    // This IS the tap-based fallback to the drag gesture: the whole
    // track is a real <button>, so a plain tap, Enter, or Space all
    // complete the Quest without requiring the drag motion at all.
    if (!movedRef.current && !completing && !isDone) {
      setIsDone(true);
      const max = maxDrag();
      if (trackRef.current) {
        trackRef.current.style.backgroundColor = "";
      }
      setHandleX(max, "settle");
      triggerHaptic("success");
      completeTimerRef.current = setTimeout(() => {
        onComplete();
      }, 280);
    }
  };

  return (
    <button
      ref={trackRef}
      type="button"
      disabled={completing || isDone}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      className={cn(
        "relative flex h-12 w-full sm:w-64 sm:shrink-0 items-center overflow-hidden rounded-full px-1 text-left touch-none transition-all duration-300 border border-[rgba(148,163,184,0.18)] bg-[#181B24] shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.08)] active:scale-[0.99]",
        isDone
          ? "border-white/60 bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.2)]"
          : ""
      )}
      aria-label={isDone ? "Quest completed" : completing ? "Marking Quest complete" : "Mark this Quest complete"}
    >
      <span
        ref={handleRef}
        className={cn(
          "pointer-events-none absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300",
          isDone
            ? "bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.7)] border border-white"
            : "bg-gradient-to-b from-white to-slate-200 text-slate-950 border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1.5px_1px_0_rgba(255,255,255,1)]"
        )}
        style={{ transform: "translate3d(0px, -50%, 0)" }}
      >
        {isDone ? (
          <Check className="size-4 stroke-[3] animate-in zoom-in-75 duration-300" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4" aria-hidden="true" />
        )}
      </span>
      <span
        className={cn(
          "w-full text-center text-sm font-medium select-none pl-8 pr-3 transition-colors duration-300",
          isDone ? "text-white font-semibold" : "text-foreground"
        )}
      >
        {isDone ? "Done!" : completing ? "Saving…" : "Swipe to complete"}
      </span>
    </button>
  );
}
