import { useState } from "react";
import { ArrowRight, Loader2, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

interface FirstLaunchStateProps {
  name: string;
}

const INSPIRATIONAL_CHIPS = [
  "Build consistent daily strength & mobility",
  "Ship core product architecture in 90 days",
  "Deepen daily reading & synthesis habit",
] as const;

export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const { updateProfile, completeFirstLaunch } = useAuth();

  const [goal, setGoal] = useState("");
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState(false);

  const handleInitialize = async () => {
    setError(false);
    setEntering(true);
    try {
      const trimmed = goal.trim();
      if (trimmed) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 90);
        const targetDateStr = targetDate.toISOString().split("T")[0];
        await updateProfile({
          primary_goal: trimmed,
          primary_goal_target_date: targetDateStr,
        });
      }
      const { error: completeError } = await completeFirstLaunch();
      if (completeError) setError(true);
    } catch {
      setError(true);
    } finally {
      setEntering(false);
    }
  };

  const handleSkip = async () => {
    setError(false);
    setEntering(true);
    try {
      const { error: completeError } = await completeFirstLaunch();
      if (completeError) setError(true);
    } catch {
      setError(true);
    } finally {
      setEntering(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <PageHeader
        eyebrow="Welcome"
        title={`Welcome, ${name}.`}
        description="Set your 90-day North Star goal to guide your daily tasks."
      />

      <section
        className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 shadow-[var(--shadow-card)] space-y-6"
        aria-labelledby="first-launch-heading"
      >
        <div className="space-y-1.5">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
            Step 1 of 1 • North Star Direction
          </p>
          <h2 id="first-launch-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            What is your single focus for the next 90 days?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One meaningful outcome. Kinetic calculates your pace and cushions it with a flexible 10% buffer (9 flex days).
          </p>
        </div>

        {/* 90 / 90 / 9 Framework Summary Pill */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs font-mono text-foreground">
          <Target className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span className="font-semibold text-primary">The 90 / 90 / 9 Framework:</span>
          <span className="text-muted-foreground">90-Day Horizon</span>
          <span className="text-border">•</span>
          <span className="text-muted-foreground">90 Goal Steps (1/day)</span>
          <span className="text-border">•</span>
          <span className="text-emerald-500 font-medium">9 Flexible Buffer Days (10% Tolerance)</span>
        </div>

        {/* Goal Input Field */}
        <div className="space-y-3">
          <label htmlFor="goal-input" className="text-xs font-medium text-foreground block">
            Primary 90-Day Objective (Optional)
          </label>
          <Input
            id="goal-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={entering}
            placeholder="e.g. Master system design & ship production architecture"
            className="h-12 rounded-xl bg-background border-border/80 text-foreground text-sm font-medium focus-visible:ring-primary shadow-xs"
          />

          {/* Inspirational Prompt Chips */}
          <div className="pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-2">
              Inspirational Horizons:
            </span>
            <div className="flex flex-wrap gap-2">
              {INSPIRATIONAL_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setGoal(chip)}
                  disabled={entering}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-[0.98]"
                >
                  <Sparkles className="size-3 text-primary/70 shrink-0" aria-hidden="true" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="default"
            size="lg"
            disabled={entering}
            onClick={handleInitialize}
            className="rounded-xl font-semibold shadow-sm h-11 px-6 text-sm"
          >
            {entering ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Initialize 90-Day Trajectory
            {!entering && <ArrowRight className="size-4 ml-2" aria-hidden="true" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            disabled={entering}
            onClick={handleSkip}
            className="rounded-xl text-muted-foreground hover:text-foreground h-11 text-sm font-medium"
          >
            Skip for now →
          </Button>
        </div>

        {error && (
          <p className="text-xs font-mono text-destructive" role="alert">
            Could not initialize trajectory. Please try again.
          </p>
        )}
      </section>
    </div>
  );
}
