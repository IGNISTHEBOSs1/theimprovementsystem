import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface FirstLaunchStateProps {
  name: string;
  completing: boolean;
  error?: boolean;
  onBegin: () => void;
}

// Phase 1 — Milestone 1 — First Launch.
// Renders in place of the normal Dashboard whenever
// profile.has_completed_first_launch is false. Presents exactly one
// primary action; no tutorial content, no additional mechanics.
export function FirstLaunchState({ name, completing, error, onBegin }: FirstLaunchStateProps) {
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
          <Button
            variant="neon"
            size="lg"
            disabled={completing}
            onClick={onBegin}
            className="mt-4"
          >
            {completing ? <Loader2 className="size-4 animate-spin" /> : null}
            Begin Your Journey
            {!completing && <ArrowRight className="size-4" aria-hidden="true" />}
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
