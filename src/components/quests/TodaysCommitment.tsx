import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TodaysCommitmentProps {
  committing: boolean;
  onCommit: (commitment: string, linkedToGoal: boolean) => void;
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
export function TodaysCommitment({ committing, onCommit, goalLabel }: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState("");
  const [linkedToGoal, setLinkedToGoal] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commitment.trim() || committing) return;
    onCommit(commitment, linkedToGoal);
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
          <Button type="submit" className="min-h-11 shrink-0" disabled={committing || !commitment.trim()}>
            {committing ? "Committing…" : "Commit"}
            {!committing && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>
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
