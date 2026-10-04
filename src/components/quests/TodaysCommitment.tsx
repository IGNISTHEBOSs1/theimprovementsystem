import { FormEvent, useState } from "react";
import { ArrowRight, Settings2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  onCancel?: () => void;
  // The account's primary goal, if one is set. When present, an explicit
  // opt-in checkbox is shown so the user can mark this commitment as
  // supporting that goal. When absent, no checkbox is shown at all —
  // there's nothing to link to, and linkedToGoal is never inferred from
  // the commitment text.
  goalLabel?: string;
  // Founder Decision (Recovery/Guidance chunk): pre-fills the form from a
  // previously missed one-shot Quest the user chose to recommit to (see
  // RecoveryState/Dashboard's handleRecommit). Still requires the user to
  // press Commit — nothing is auto-submitted, preserving the same
  // deliberate-commitment principle as manual entry. Absent for the
  // normal empty-form path.
  initialValues?: { title: string; priority: QuestPriority; linkedToGoal: boolean };
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
export function TodaysCommitment({ committing, onCommit, onCancel, goalLabel, initialValues }: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState(initialValues?.title ?? "");
  const [linkedToGoal, setLinkedToGoal] = useState(initialValues?.linkedToGoal ?? false);
  const [showOptions, setShowOptions] = useState(Boolean(initialValues && initialValues.priority !== DEFAULT_PRIORITY));
  const [cadence, setCadence] = useState<CadencePreset>(DEFAULT_CADENCE);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [priority, setPriority] = useState<QuestPriority>(initialValues?.priority ?? DEFAULT_PRIORITY);

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
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]"
      aria-labelledby="todays-commitment-heading"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">New commitment</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={committing}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <h2 id="todays-commitment-heading" className="mt-1.5 text-base sm:text-lg font-semibold tracking-tight text-foreground">
        What are you committing to today?
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        {/* INPUT & COMMIT AXIS */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Input
            value={commitment}
            onChange={(event) => setCommitment(event.target.value)}
            placeholder="Name your commitment..."
            aria-label="Your commitment"
            disabled={committing}
            className="min-h-11 flex-1 bg-background"
            autoFocus
          />
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="submit"
              className="min-h-11 shrink-0 px-5"
              disabled={committing || !commitment.trim() || cadenceInvalid}
            >
              {committing ? "Committing…" : "Commit"}
              {!committing && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* METADATA TOGGLES: Pinned Left Goal Chip, Pinned Right Custom Toggle */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {goalLabel ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id="linked-to-goal"
                checked={linkedToGoal}
                onCheckedChange={(checked) => setLinkedToGoal(checked === true)}
                disabled={committing}
                className="size-4"
              />
              <Label
                htmlFor="linked-to-goal"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none font-medium"
              >
                <Target className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[220px] sm:max-w-[340px]">{goalLabel}</span>
              </Label>
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            disabled={committing}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground shrink-0"
            aria-expanded={showOptions}
          >
            <Settings2 className="size-3.5" aria-hidden="true" />
            <span>{showOptions ? "Fewer options" : "Custom options"}</span>
          </button>
        </div>

        {/* EXPANDABLE OPTIONS: Clean Structured Grid */}
        {showOptions && (
          <div className="mt-2 flex flex-col gap-3.5 rounded-xl border border-border/70 bg-muted/20 p-3.5 sm:p-4 text-xs">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="w-16 font-medium text-muted-foreground shrink-0">Priority</span>
              <ToggleGroup
                type="single"
                value={priority}
                onValueChange={(val) => {
                  if (val) setPriority(val as QuestPriority);
                }}
                disabled={committing}
                className="flex-wrap justify-start gap-1.5"
                aria-label="Priority"
              >
                {PRIORITIES.map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    size="sm"
                    className="h-7 px-2.5 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                  >
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="w-16 font-medium text-muted-foreground shrink-0">Repeats</span>
              <ToggleGroup
                type="single"
                value={cadence}
                onValueChange={(val) => {
                  if (val) setCadence(val as CadencePreset);
                }}
                disabled={committing}
                className="flex-wrap justify-start gap-1.5"
                aria-label="Repeats"
              >
                {CADENCE_PRESETS.map((preset) => (
                  <ToggleGroupItem
                    key={preset}
                    value={preset}
                    size="sm"
                    className="h-7 px-2.5 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                  >
                    {preset}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {cadence === "Custom" && (
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <span className="w-16 font-medium text-muted-foreground shrink-0">Days</span>
                <ToggleGroup
                  type="multiple"
                  value={customDays.map(String)}
                  onValueChange={(vals) => setCustomDays(vals.map(Number).sort())}
                  disabled={committing}
                  className="flex-wrap justify-start gap-1.5"
                  aria-label="Repeat on which days"
                >
                  {DAY_LABELS.map((label, i) => (
                    <ToggleGroupItem
                      key={i}
                      value={String(i)}
                      size="sm"
                      className="h-7 w-9 px-0 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                    >
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
