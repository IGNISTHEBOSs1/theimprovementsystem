import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { TrajectoryChart } from "@/components/journey/TrajectoryChart";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveTrajectory } from "@/lib/trajectory";

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
  // plotted would misrepresent "no data" as "flat progress."
  if (!hasEvidence) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <PageHeader
          eyebrow="Your journey"
          title="Your trajectory is still forming."
          description={`Complete a Quest linked to "${profile?.primary_goal}" and it will start appearing here.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your journey"
        title="Your trajectory."
        description="Where you intended to go, and where your actions have actually taken you."
      />
      <div className="mt-8">
        <TrajectoryChart trajectory={trajectory} goalLabel={profile?.primary_goal ?? undefined} />
      </div>
    </div>
  );
}
