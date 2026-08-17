import { FormEvent, useState } from "react";
import { ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { QuestPriority } from "@/types/quest";
import type { CadencePreset } from "@/hooks/useDashboardData";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRIORITIES: QuestPriority[] = ["Essential", "Important", "Optional"];
const DEFAULT_PRIORITY: QuestPriority = "Essential";
const CADENCE_PRESETS: CadencePreset[] = ["Once", "Daily", "Weekdays", "Weekends", "Weekly", "Custom"];
const DEFAULT_CADENCE: CadencePreset = "Once";

interface TodaysCommitmentProps {
  committing: boolean;
  onCommit: (commitment: string, linkedToGoal: boolean, cadence: CadencePreset, customDays: number[], priority: QuestPriority) => void;
  // The account's primary goal, if one is set. When present, an explicit
  // opt-in checkbox is shown so the user can mark this commitment as
  // supporting that goal. When absent, no checkbox is shown at all —
  // there's nothing to link to, and linkedToGoal is never inferred from
  // the commitment text.
  goalLabel?: string;
}

// Milestone 2 - First Mission. This is not a "create Quest" form. It is
// the physical expression of a deliberate commitment the user is already
// making: Direction -> Choice -> Commitment. The input carries the user's
// own words -- the System does not suggest, generate, or pre-fill them,
// preserving the autonomy the Quest definition requires. Goal linkage
// (Chunk 3) is the same principle applied to relevance: explicit and
// user-set, never guessed from what they typed.
//
// Founder Decision (Quest defaults chunk): the normal path uses common
// system defaults (priority: Essential, cadence: Once) and stays within
// a 1-3 interaction budget -- type + Commit is 1 click; adding the
// goal-link checkbox is 2. Priority and cadence are gated behind an
// explicit "Custom" toggle rather than always shown.
//
// Cadence resolution (which actual weekdays "Weekly" means, etc.)
// deliberately does NOT happen in this component — this component only
// passes the chosen preset up. Resolution happens in
// useDashboardData.commitToTodaysQuest, the one place that has
// server-authoritative "today" available, so "Weekly" is never resolved
// against the client's own clock.
export function TodaysCommitment({ committing, onCommit, goalLabel }: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState("");
  const [linkedToGoal, setLinkedToGoal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [cadence, setCadence] = useState<CadencePreset>(DEFAULT_CADENCE);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [priority, setPriority] = useState<QuestPriority>(DEFAULT_PRIORITY);

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const cadenceInvalid = showOptions && cadence === "Custom" && customDays.length === 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commitment.trim() || committing || cadenceInvalid) return;
    onCommit(
      commitment,
      linkedToGoal,
      showOptions ? cadence : DEFAULT_CADENCE,
      showOptions ? customDays : [],
      showOptions ? priority : DEFAULT_PRIORITY,
    );
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
            autoFocus
          />
          <Button
            type="submit"
            className="min-h-11 shrink-0"
            disabled={committing || !commitment.trim() || cadenceInvalid}
          >
            {committing ? "Committing…" : "Commit"}
            {!committing && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            disabled={committing}
            className="ml-auto flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={showOptions}
          >
            <Settings2 className="size-3.5" aria-hidden="true" />
            {showOptions ? "Hide custom options" : "Custom"}
          </button>
        </div>

        {showOptions && (
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4">
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

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Repeats">
              <span className="mr-1 text-body-sm text-muted-foreground">Repeats</span>
              {CADENCE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCadence(preset)}
                  disabled={committing}
                  aria-pressed={cadence === preset}
                  className={cn(
                    "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                    cadence === preset
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            {cadence === "Custom" && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Repeat on which days">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleCustomDay(i)}
                    disabled={committing}
                    className={cn(
                      "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                      customDays.includes(i)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
