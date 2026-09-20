import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { AppTour } from "@/components/onboarding/AppTour";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { deriveGoalStats, deriveTrajectory, deriveCurrentStreak } from "@/lib/trajectory";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import type { Quest } from "@/types/quest";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, profileError, fetchProfile } = useAuth();
  const { state, loading, error, saving, activeQuests, lastMissedQuest, completeQuest, reload, todayStr } = useDashboardDataContext();
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
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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

  const guidance = deriveGuidance(state.quests, profile?.timezone || "UTC");
  const insights = deriveInsights(state.quests);
  const trajectory = deriveTrajectory(state.quests);
  const currentStreak = todayStr ? deriveCurrentStreak(state.quests, todayStr, profile?.timezone || "UTC") : 0;
  const contextualLink = (guidance.length > 0 || insights.length > 0)
    ? { to: "/mentor", label: "Your Mentor has a note based on your history." }
    : trajectory.actual.length > 0
      ? { to: "/journey", label: "See how your recent actions compare to your intended path." }
      : null;

  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
      <AppTour />

      {/* ── Cockpit Status Header (Compact, Glanceable & Above-the-Fold) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div>
          <p className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
            {todayDateFormatted}
          </p>
          <h1 className="text-display-md font-bold text-foreground mt-0.5">
            Welcome back, {name}.
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-medium text-foreground">
              <Flame className="size-3.5 text-primary" aria-hidden="true" />
              <span>{currentStreak} day streak</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/70 bg-card/60 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span>{activeQuests.length}/3 Active</span>
          </div>
        </div>
      </header>

      {/* ── Tier 1 Action — Today's Focus (Immediately Visible Without Scrolling) ── */}
      <div className="mt-6">
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
                <ul className="mt-3 space-y-2.5">
                  {activeQuests.slice(1).map((quest) => (
                    <li
                      key={quest.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-body-sm shadow-[var(--shadow-card)]"
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>
                          {quest.priority}
                        </Badge>
                        <span className="text-foreground font-medium">{quest.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="min-h-9 hover:bg-primary/10 hover:text-primary transition-colors"
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

      {/* ── Tier 2 Direction — Ambient Guidance (Below Action) ── */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <DirectionCard
          name={name}
          goalStats={profile?.primary_goal ? deriveGoalStats(state.quests) : undefined}
          streak={currentStreak > 0 ? currentStreak : undefined}
        />
      </div>

      {/* ── Contextual Link ── */}
      {contextualLink && (
        <div className="mt-6">
          <Link to={contextualLink.to} className="text-body-sm text-primary underline-offset-4 hover:underline">
            {contextualLink.label}
          </Link>
        </div>
      )}
    </div>
  );
}
