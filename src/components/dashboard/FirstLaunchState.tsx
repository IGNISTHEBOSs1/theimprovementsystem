import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";

interface FirstLaunchStateProps {
  name: string;
}

type Step = "intro" | "transition" | "commit" | "confirmation";

const TRANSITION_DISPLAY_MS = 1300;

// Phase 1 — Milestone 1 — First Launch, extended per Founder Decision to
// carry the user through Milestone 2's commitment (Direction → Choice →
// Commitment) before the experience ends. Renders in place of the normal
// Dashboard whenever profile.has_completed_first_launch is false, and
// owns its own step sequence so the transitional/confirmation copy isn't
// interrupted by Dashboard swapping views mid-sequence — that swap only
// happens once, when completeFirstLaunch() resolves after the user
// presses "Enter The Improvement System" on the confirmation step. There
// is no timer driving that transition; it is a deliberate action, same
// as Begin and Commit.
//
// The commitment step reuses TodaysCommitment and commitToTodaysQuest()
// unchanged — no duplicate commitment logic exists here.
export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const { completeFirstLaunch } = useAuth();
  const { saving, commitToTodaysQuest } = useDashboardDataContext();

  const [step, setStep] = useState<Step>("intro");
  const [finishing, setFinishing] = useState(false);
  const [completionError, setCompletionError] = useState(false);

  const handleBegin = () => {
    setStep("transition");
  };

  useEffect(() => {
    if (step !== "transition") return;
    const timer = setTimeout(() => setStep("commit"), TRANSITION_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [step]);

  const handleCommit = async (commitment: string) => {
    await commitToTodaysQuest(commitment);
    setStep("confirmation");
  };

  const handleEnter = async () => {
    setCompletionError(false);
    setFinishing(true);
    const { error } = await completeFirstLaunch();
    setFinishing(false);
    if (error) setCompletionError(true);
    // On success, profile.has_completed_first_launch flips and Dashboard
    // swaps to the normal view on its own — no navigation call needed.
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      {step === "intro" && (
        <>
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
              <Button variant="neon" size="lg" onClick={handleBegin} className="mt-4">
                Begin Your Journey
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </section>
          </div>
        </>
      )}

      {step === "transition" && (
        <section className="rounded-2xl border border-border bg-card p-7" aria-live="polite">
          <p className="text-label text-primary">Welcome to The Improvement System.</p>
          <p className="mt-4 text-lg text-foreground">
            Improvement doesn't begin with ambition.
            <br />
            It doesn't begin with plans.
            <br />
            It begins with one deliberate commitment.
          </p>
        </section>
      )}

      {step === "commit" && (
        <>
          <PageHeader
            eyebrow="One deliberate commitment"
            title="What are you committing to today?"
          />
          <div className="mt-9">
            <TodaysCommitment committing={saving} onCommit={handleCommit} />
          </div>
        </>
      )}

      {step === "confirmation" && (
        <section className="rounded-2xl border border-border bg-card p-7" aria-live="polite">
          <p className="text-label text-primary">Good.</p>
          <p className="mt-4 text-lg text-foreground">
            Your commitment now exists.
            <br />
            From this moment forward
            <br />
            The Improvement System exists to help you bring it into reality.
          </p>
          <Button variant="neon" size="lg" disabled={finishing} onClick={handleEnter} className="mt-6">
            {finishing ? <Loader2 className="size-4 animate-spin" /> : null}
            Enter The Improvement System
            {!finishing && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
          {completionError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
              That didn't go through. You can try again.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
