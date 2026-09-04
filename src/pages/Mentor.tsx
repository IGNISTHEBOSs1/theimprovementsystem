import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";

// Founder Decision (Mentor finalization chunk): the Mentor's only job is
// to say back, in words, patterns that are already true of the user's
// real Quest history — never to decide anything for them, never to
// invent a fact that isn't in state.quests. deriveGuidance (lib/guidance.ts)
// is a pure, deterministic function: no LLM call, no external API, no
// randomness — same quests in, same guidance out, every time. This page
// is a thin presentational shell around it; all the actual reasoning
// lives in that one pure function, same separation as Journey/trajectory.
export default function Mentor() {
  const { state, loading, error, reload } = useDashboardDataContext();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Loading your mentor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-2xl border border-border bg-card p-7" aria-label="Mentor unavailable">
          <p className="text-label text-muted-foreground">Your mentor</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your history.</h2>
          <p className="mt-2 text-body-md text-muted-foreground">This is usually temporary. You can try again now.</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const guidance = deriveGuidance(state.quests);

  // No pattern has met either rule's threshold yet (see lib/guidance.ts) —
  // this is the honest "nothing to say yet" state, not an empty error.
  // Never fabricate a message just to fill the page.
  if (guidance.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <PlaceholderExperience
          icon={MessageSquare}
          title="No clear pattern yet."
          message="As you commit to and resolve more Quests, your Mentor will point out real patterns in what's working and what isn't — never a guess, only what's actually there."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your mentor"
        title="What your history is showing."
        description="Grounded in your own Quests — never a guess, never a score, never a judgment."
      />
      <ul className="mt-6 space-y-3">
        {guidance.map((message) => (
          <li
            key={message.id}
            className="rounded-2xl border border-border/60 bg-card/40 p-5 text-body-md leading-6 text-foreground"
          >
            {message.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
