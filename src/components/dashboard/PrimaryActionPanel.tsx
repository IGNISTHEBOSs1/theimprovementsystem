import { useRef, useState, type PointerEvent } from "react";
import { ArrowRight, ChevronRight, CircleDot, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";

interface PrimaryActionPanelProps {
  quest?: Quest;
  completing?: boolean;
  onComplete: () => void;
  onChooseQuest: () => void;
}

// Founder Decision (TIS visual toolkit chunk — USE: Spotlight Card,
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

  if (!quest) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="focus-heading">
        <p className="text-label text-primary">Today&apos;s focus</p>
        <h2 id="focus-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Begin with one meaningful action.
        </h2>
        <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
          Choose one task that moves your life in the direction you intend.
        </p>
        <Button className="mt-6 min-h-11" onClick={onChooseQuest}>
          Choose today&apos;s focus <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </section>
    );
  }

  return (
    <section
      ref={spotlight.bind}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7"
      aria-labelledby="focus-heading"
    >
      {spotlight.enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: "radial-gradient(240px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), hsl(var(--primary) / 0.07), transparent 70%)",
          }}
        />
      )}
      <p className="text-label text-primary">Today&apos;s focus</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CircleDot className="size-4 text-primary" aria-hidden="true" />
            {quest.timeFrame}
            <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>{quest.priority}</Badge>
          </div>
          <h2 id="focus-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {quest.title}
          </h2>
          {quest.linkedToGoal && quest.goalName && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="size-3.5 shrink-0" aria-hidden="true" />
              Supports: {quest.goalName}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            One clear step is enough. Start there.
          </p>
        </div>
        <SwipeToComplete completing={Boolean(completing)} onComplete={onComplete} />
      </div>
    </section>
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
function SwipeToComplete({ completing, onComplete }: { completing: boolean; onComplete: () => void }) {
  const trackRef = useRef<HTMLButtonElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const HANDLE_SIZE = 40;
  const THRESHOLD = 0.65;

  const maxDrag = () => (trackRef.current?.clientWidth ?? 0) - HANDLE_SIZE - 8;

  const setHandleX = (x: number, animate: boolean) => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.style.transitionDuration = animate ? "200ms" : "0ms";
    handle.style.transform = `translateX(${x}px)`;
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (completing) return;
    trackRef.current?.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    movedRef.current = false;
    dragXRef.current = 0;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!draggingRef.current || completing) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(e.clientX - rect.left - HANDLE_SIZE / 2, 0), maxDrag());
    if (x > 2) movedRef.current = true;
    dragXRef.current = x;
    setHandleX(x, false);
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const max = maxDrag();
    const thresholdMet = max > 0 && dragXRef.current / max >= THRESHOLD;
    setHandleX(0, true);
    dragXRef.current = 0;
    if (thresholdMet) {
      triggerHaptic("success");
      onComplete();
    }
  };

  const handleClick = () => {
    // Only reached for a plain tap with no real movement — a genuine
    // drag's completion is already handled in finishDrag above, once.
    // This IS the tap-based fallback to the drag gesture: the whole
    // track is a real <button>, so a plain tap, Enter, or Space all
    // complete the Quest without requiring the drag motion at all.
    if (!movedRef.current) {
      triggerHaptic("success");
      onComplete();
    }
  };

  return (
    <button
      ref={trackRef}
      type="button"
      disabled={completing}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      className="relative flex min-h-11 w-full items-center overflow-hidden rounded-full bg-foreground/20 px-1 py-1 text-left touch-none"
      aria-label={completing ? "Marking Quest complete" : "Mark this Quest complete"}
    >
      <span
        ref={handleRef}
        className="pointer-events-none absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
        style={{ transform: "translateX(0px)" }}
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
      <span className="w-full text-center text-sm font-medium text-foreground">
        {completing ? "Saving…" : "Swipe to complete"}
      </span>
    </button>
  );
}
