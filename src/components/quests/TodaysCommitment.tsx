import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TodaysCommitmentProps {
  committing: boolean;
  onCommit: (commitment: string) => void;
}

// Milestone 2 — First Mission. This is not a "create Quest" form. It is
// the physical expression of a deliberate commitment the user is already
// making: Direction → Choice → Commitment. The input carries the user's
// own words — the System does not suggest, generate, or pre-fill them,
// preserving the autonomy the Quest definition requires. Rendered in the
// Quest page's empty state: exactly one obvious action, nothing to choose
// between.
export function TodaysCommitment({ committing, onCommit }: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commitment.trim() || committing) return;
    onCommit(commitment);
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
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
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
      </form>
    </section>
  );
}
