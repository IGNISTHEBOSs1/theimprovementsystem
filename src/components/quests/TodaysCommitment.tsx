import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { QuestPriority } from "@/types/quest";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRIORITIES: QuestPriority[] = ["Essential", "Important", "Optional"];

interface TodaysCommitmentProps {
  committing: boolean;
  onCommit: (commitment: string, linkedToGoal: boolean, recurrenceDays?: number[], priority?: QuestPriority) => void;
  // The account's primary goal, if one is set. When present, an explicit
  // opt-in checkbox is shown so the user can mark this commitment as
  // supporting that goal. When absent, no checkbox is shown at all —
  // there's nothing to link to, and linkedToGoal is never inferred from
  // the commitment text.
  goalLabel?: string;
}

// Milestone 2 — First Mission. This is not a "create Quest" form. It is
// the physical expression of a deliberate commitment the user is already
// making: Direction → Choice → Commitment. The input carries the user's
// own words — the System does not suggest, generate, or pre-fill them,
// preserving the autonomy the Quest definition requires. Goal linkage
// (Chunk 3) is the same principle applied to relevance: explicit and
// user-set, never guessed from what they typed.
//
// Recurrence (Founder Decision, Quest recurrence chunk): also explicit
// and user-set — a plain "Repeat" toggle revealing day selection, off by
// default. Leaving it off produces byte-for-byte the same one-shot
// commitment behavior as before this decision existed.
//
// Priority (Founder Decision, Quest priority chunk): Essential/
// Important/Optional — how important this is to the user's intended
// improvement, not difficulty, duration, urgency, or age. Explicit and
// stable; never computed or decayed. Defaults to Essential, since under
// the single-active-Quest model the one thing being committed to right
// now is, by definition, the user's current highest-priority commitment
// unless they say otherwise.
export function TodaysCommitment({ committing, onCommit, goalLabel }: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState("");
  const [linkedToGoal, setLinkedToGoal] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const [days, setDays] = useState<number[]>([]);
  const [priority, setPriority] = useState<QuestPriority>("Essential");

  const toggleDay = (day: number) => {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commitment.trim() || committing) return;
    if (repeating && days.length === 0) return;
    onCommit(commitment, linkedToGoal, repeating ? days : undefined, priority);
  };

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6"
      aria-labelledby="todays-commitment-heading"
    >
      <p className="text-label text-primary">Today&apos;s quest</p>
      <h2 id="todays-commitment-heading" className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        What&apos;s one thing you&apos;re committing to today?
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={commitment}
            onChange={(event) => setCommitment(event.target.value)}
            placeholder="Say what you're committing to"
            aria-label="Your commitment"
            disabled={committing}
            className="min-h-11"
          />
          <Button
            type="submit"
            className="min-h-11 shrink-0"
            disabled={committing || !commitment.trim() || (repeating && days.length === 0)}
          >
            {committing ? "Committing…" : "Commit"}
            {!committing && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Priority">
          <span className="mr-1 text-body-sm text-muted-foreground">Priority</span>
          {PRIORITIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setPriority(level)}
              disabled={committing}
              aria-pressed={priority === level}
              className={cn(
                "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                priority === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="repeating"
            checked={repeating}
            onCheckedChange={(checked) => setRepeating(checked === true)}
            disabled={committing}
          />
          <Label htmlFor="repeating" className="text-body-sm text-muted-foreground font-normal">
            Repeat on certain days
          </Label>
        </div>

        {repeating && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Repeat on which days">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                disabled={committing}
                className={cn(
                  "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                  days.includes(i)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {goalLabel && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="linked-to-goal"
              checked={linkedToGoal}
              onCheckedChange={(checked) => setLinkedToGoal(checked === true)}
              disabled={committing}
            />
            <Label htmlFor="linked-to-goal" className="text-body-sm text-muted-foreground font-normal">
              This supports my goal: {goalLabel}
            </Label>
          </div>
        )}
      </form>
    </section>
  );
}
