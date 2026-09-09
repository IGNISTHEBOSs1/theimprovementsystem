import { useRef, useState } from "react";
import { Check, ChevronRight, CircleDot, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quest } from "@/types/quest";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";

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
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 shadow-[0_0_0_1px_hsl(var(--primary)/0.06),0_8px_28px_-14px_hsl(var(--primary)/0.35)] sm:p-7"
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
        <Button className="min-h-11 shrink-0" onClick={onComplete} disabled={completing}>
          <Check className="size-4" aria-hidden="true" />
          {completing ? "Saving…" : "Mark complete"}
        </Button>
      </div>
    </section>
  );
}
