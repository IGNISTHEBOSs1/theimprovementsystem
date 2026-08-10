import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

interface FirstLaunchStateProps {
  name: string;
}

// Phase 1 — Milestone 1 — First Launch. Per Founder Decision (P0 Chunk 1
// rollback), First Launch is purely an entry experience:
//   First Launch → Begin/Enter → Dashboard
// It creates or collects nothing — no Quest, no commitment, no goal, no
// trajectory change, no progression/reward. The single action here calls
// completeFirstLaunch() and nothing else. On success,
// profile.has_completed_first_launch flips and Dashboard swaps to the
// normal view on its own — no navigation call needed here.
export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const { completeFirstLaunch } = useAuth();

  const [entering, setEntering] = useState(false);
  const [error, setError] = useState(false);

  const handleEnter = async () => {
    setError(false);
    setEntering(true);
    const { error: completeError } = await completeFirstLaunch();
    setEntering(false);
    if (completeError) setError(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title={`Welcome, ${name}.`}
        description="This is where your progress will live."
      />
      <div className="mt-9">
        <section
          className="rounded-2xl border border-border bg-card p-7"
          aria-labelledby="first-launch-heading"
        >
          <p className="text-label text-muted-foreground">Begin</p>
          <h2 id="first-launch-heading" className="mt-2 text-lg font-semibold text-foreground">
            Ready to start.
          </h2>
          <Button variant="neon" size="lg" disabled={entering} onClick={handleEnter} className="mt-4">
            {entering ? <Loader2 className="size-4 animate-spin" /> : null}
            Begin Your Journey
            {!entering && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
          {error && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
              That didn't go through. You can try again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
