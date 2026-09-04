import { Compass, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { TrajectoryChart } from "@/components/journey/TrajectoryChart";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveTrajectory, deriveGoalStats } from "@/lib/trajectory";

// Trajectory v1 (Journey chunk). Deterministic, evidence-based, single
// implicit dimension: "progress toward the user's current Goal." No new
// Goal architecture, no evidence table, no schema change — deriveTrajectory
// reads only state.quests, which already existed. See the chunk report
// for the resolution-timestamp limitation (createdAt is used; no true
// completion/failure timestamp exists in the current data model).
export default function Journey() {
  const { profile } = useAuth();
  const { state, loading, error, reload } = useDashboardDataContext();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" aria-label="Loading your journey" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-2xl border border-border bg-card p-7" aria-label="Journey unavailable">
          <p className="text-label text-muted-foreground">Your journey</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your journey.</h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const hasGoal = Boolean(profile?.primary_goal);
  const trajectory = deriveTrajectory(state.quests);
  const hasEvidence = trajectory.actual.length > 0;

  // No active Goal: do not invent a destination. This is distinct from
  // "goal exists but no evidence yet" — different message, same
  // no-fake-data principle.
  if (!hasGoal) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <PlaceholderExperience
          icon={Compass}
          title="No goal set yet."
          message="Your trajectory tracks movement toward a goal you choose. Set one from your profile to start."
        />
      </div>
    );
  }

  // Goal exists, but no resolved, goal-linked Quest evidence yet. Do not
  // render a fake trajectory — an empty coordinate space with nothing
  // plotted would misrepresent "no data" as "flat progress." Founder
  // Decision (Goal→Quest→Outcome chunk): still show the honest linked-
  // Quest count here (deriveGoalStats counts active Quests too, unlike
  // trajectory's resolved-only evidence) so "still forming" doesn't read
  // as "nothing has happened yet" when Quests are, in fact, committed
  // and in progress.
  if (!hasEvidence) {
    const goalStats = deriveGoalStats(state.quests);
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <PageHeader
          eyebrow="Your journey"
          title="Your trajectory is still forming."
          description={`Complete a Quest linked to "${profile?.primary_goal}" and it will start appearing here.`}
        />
        {goalStats.linked > 0 && (
          <p className="mt-3 text-body-sm text-muted-foreground">
            {goalStats.linked} Quest{goalStats.linked === 1 ? "" : "s"} currently linked to this goal, none resolved yet.
          </p>
        )}
      </div>
    );
  }

  // Founder Decision (Journey/Guidance chunk): a one-line, purely-derived
  // summary of where currentPosition sits relative to the intended
  // path's last value — not a new number, just the existing comparison
  // stated in words instead of left for the reader to compute from the
  // chart. deriveGoalStats' completed/linked count is a second, distinct
  // fact (resolution outcome, not position) shown alongside it.
  const intendedEnd = trajectory.intended.length > 0
    ? trajectory.intended[trajectory.intended.length - 1].position
    : 0;
  const positionDelta = trajectory.currentPosition - intendedEnd;
  const summaryLine = positionDelta === 0
    ? "You're exactly on your intended path."
    : positionDelta > 0
      ? `You're ${positionDelta} step${positionDelta === 1 ? "" : "s"} ahead of where you intended to be.`
      : `You're ${Math.abs(positionDelta)} step${Math.abs(positionDelta) === 1 ? "" : "s"} behind where you intended to be.`;

  const goalStats = deriveGoalStats(state.quests);

  // Founder Decision (Journey transparency chunk): Quest.goalName is a
  // snapshot of whatever the primary goal was AT THE TIME a Quest was
  // linked (see types/quest.ts) — it does not update retroactively if
  // the goal changes later. deriveTrajectory intentionally still counts
  // all of it as evidence (see deriveGoalStats' own comment on this same
  // point), so the numbers above don't silently change meaning the
  // moment someone edits their goal text. What changes here is
  // disclosure, not computation: when some of the plotted evidence was
  // recorded under a goal that no longer matches the current one, that
  // fact is stated plainly rather than left for the reader to notice (or
  // not) on their own.
  const previousGoalEvidenceCount = trajectory.actual.filter(
    (point) => point.quest.goalName && point.quest.goalName !== profile?.primary_goal,
  ).length;

  // Founder Decision (Journey finalization chunk): "useful historical
  // context" — the most recent resolved, goal-linked Quests, most recent
  // first, reusing trajectory.actual (already computed above, already
  // traceable to a real Quest per point — no new derivation, no new
  // fabrication). Capped at 5 so this stays a glance, not a second copy
  // of Quest History.
  const recentEvidence = [...trajectory.actual].reverse().slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your journey"
        title="Your trajectory."
        description="Where you intended to go, and where your actions have actually taken you."
      />
      <p className="mt-3 text-body-md text-foreground">{summaryLine}</p>
      <p className="mt-1 text-body-sm text-muted-foreground">
        {goalStats.completed} of {goalStats.linked} linked Quest{goalStats.linked === 1 ? "" : "s"} completed.
      </p>
      {previousGoalEvidenceCount > 0 && (
        <p className="mt-1 text-body-sm text-muted-foreground">
          {previousGoalEvidenceCount} of these {previousGoalEvidenceCount === 1 ? "was" : "were"} recorded under a previous goal, before it changed to "{profile?.primary_goal}."
        </p>
      )}
      <div className="mt-8">
        <TrajectoryChart trajectory={trajectory} goalLabel={profile?.primary_goal ?? undefined} />
      </div>
      {recentEvidence.length > 0 && (
        <div className="mt-8">
          <p className="text-label text-muted-foreground">Recent evidence</p>
          <ul className="mt-3 space-y-2">
            {recentEvidence.map((point) => {
              const fromPreviousGoal = Boolean(point.quest.goalName && point.quest.goalName !== profile?.primary_goal);
              return (
                <li
                  key={point.quest.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-2.5 text-body-sm"
                >
                  {point.outcome === "completed"
                    ? <Check className="size-4 shrink-0 text-foreground/70" aria-hidden="true" />
                    : <X className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                  <span className="flex-1 truncate text-foreground">{point.quest.title}</span>
                  {fromPreviousGoal && (
                    <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                      Previous goal
                    </span>
                  )}
                  <span className="shrink-0 text-muted-foreground">{point.timestamp.split("T")[0]}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
