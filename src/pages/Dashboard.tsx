import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { deriveGoalStats, deriveTrajectory } from "@/lib/trajectory";
import { deriveGuidance } from "@/lib/guidance";
import type { Quest } from "@/types/quest";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, profileError, fetchProfile } = useAuth();
  const { state, loading, error, saving, activeQuests, lastMissedQuest, completeQuest, reload } = useDashboardDataContext();
  const name = profile?.username || "there";
  const chooseQuest = () => navigate("/quests");
  const [completeError, setCompleteError] = useState(false);

  // Founder Decision (Recovery/Guidance chunk): recommitting to a missed
  // one-shot Quest hands its title/priority/goal-link to the Quest page's
  // commit form as a starting point, rather than making the user retype
  // what they already said once. Quests.tsx reads this via location.state
  // and clears it after consuming it (see that file) so navigating back
  // doesn't silently re-prefill.
  const handleRecommit = (quest: Quest) => {
    navigate("/quests", {
      state: {
        prefill: {
          title: quest.title,
          priority: quest.priority,
          linkedToGoal: Boolean(quest.linkedToGoal),
        },
      },
    });
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  // Gate on this component's own profile-loading state (not just the outer
  // ProtectedRoute's) so a returning user is never briefly shown the
  // first-launch state while `profile` is still resolving. See Phase 1 —
  // Milestone 1 — First Launch (do not modify returning-user behavior).
  if (profileLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
        </section>
      </div>
    );
  }

  // An unresolved profile (fetch exhausted its retries) must never be
  // treated as a returning user's Dashboard, nor as a first-launch user —
  // we simply don't know which one they are. This is a distinct third
  // state from "loading" and "resolved". Recoverable per Interaction Law
  // VI: calm, informative, and offers a direct way back (retry).
  if (profileError || !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section
          className="rounded-2xl border border-border bg-card p-7"
          aria-label="Profile unavailable"
        >
          <p className="text-label text-muted-foreground">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your profile.
          </h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button
            variant="neon"
            size="lg"
            className="mt-4"
            onClick={() => user && void fetchProfile(user.id)}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  if (!profile.has_completed_first_launch) {
    return <FirstLaunchState name={name} />;
  }

  // A failed game_state load (retries exhausted) must never render as if
  // it were a legitimate fresh account — see useDashboardData.error. This
  // is the same class of distinction Dashboard already makes for
  // profileError above, applied to the sibling table.
  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section
          className="rounded-2xl border border-border bg-card p-7"
          aria-label="Progress unavailable"
        >
          <p className="text-label text-muted-foreground">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your progress.
          </h2>
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

  const guidance = deriveGuidance(state.quests);
  const trajectory = deriveTrajectory(state.quests);
  const contextualLink = guidance.length > 0
    ? { to: "/mentor", label: "Your Mentor has a note based on your history." }
    : trajectory.actual.length > 0
      ? { to: "/journey", label: "See how your recent actions compare to your intended path." }
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      {/* ── Tier 1 — Identity / Current State ──────────────────────────
          PageHeader (identity) and DirectionCard (direction) are two
          distinct responsibilities that read as one ambient band: tight
          internal spacing, no card chrome, no border. Nothing here
          competes with Tier 2 — it establishes state, not action. */}
      <div className="space-y-5">
        <PageHeader
          eyebrow="Your system"
          title={`Welcome back, ${name}.`}
          description="A quiet place to reconnect with what matters and take the next meaningful step."
        />
        <DirectionCard name={name} goalStats={profile?.primary_goal ? deriveGoalStats(state.quests) : undefined} />
      </div>

      {/* ── Tier 2 — Primary Action ─────────────────────────────────────
          Founder Decision (multi-active Quest chunk): with multiple
          Quests now allowed active at once, Tier 2 shows the
          highest-priority active Quest as the single dominant element
          (activeQuests is priority-then-createdAt sorted by the data
          layer — index 0 is that Quest), or the Recovery message if none
          exist. Remaining active Quests are demoted to a smaller,
          secondary list below — never competing visually with the
          primary panel, and never rendered in place of it. */}
      <div className="mt-9">
        {loading ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
          </section>
        ) : activeQuests.length > 0 ? (
          <>
            <PrimaryActionPanel
              quest={activeQuests[0]}
              completing={saving}
              onComplete={() => void handleComplete(activeQuests[0].id)}
              onChooseQuest={chooseQuest}
            />
            {completeError && (
              <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                That didn't go through. You can try again.
              </p>
            )}
            {activeQuests.length > 1 && (
              <div className="mt-5">
                <p className="text-label text-muted-foreground">Also active</p>
                <ul className="mt-3 space-y-2">
                  {activeQuests.slice(1).map((quest) => (
                    <li
                      key={quest.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-body-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>
                          {quest.priority}
                        </Badge>
                        <span className="text-foreground">{quest.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="min-h-9"
                        disabled={saving}
                        onClick={() => void handleComplete(quest.id)}
                      >
                        Mark complete
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <RecoveryState onChooseQuest={chooseQuest} lastMissedQuest={lastMissedQuest} onRecommit={handleRecommit} />
        )}
      </div>

      {/* Founder Decision (Dashboard loop chunk): a single, minimal link
          out — never a summary, never a repeated stat (Journey/Mentor
          already own those), and never rendered when there's nothing
          real to point at. "Meaningful" is defined the same way each
          page itself would: Journey has something once there's at least
          one resolved, goal-linked Quest; Mentor has something once
          deriveGuidance actually returns a message. Both recompute from
          the same state already loaded here — no new fetch. */}
      {contextualLink && (
        <div className="mt-8">
          <Link to={contextualLink.to} className="text-body-sm text-primary underline-offset-4 hover:underline">
            {contextualLink.label}
          </Link>
        </div>
      )}
    </div>
  );
}
