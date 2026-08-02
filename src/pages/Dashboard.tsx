import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { QuietProgress } from "@/components/dashboard/QuietProgress";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, profileError, fetchProfile } = useAuth();
  const { state, loading, saving, completeQuest } = useDashboardDataContext();
  const activeQuest = state.quests.find((quest) => !quest.completed && !quest.failed);
  const name = profile?.username || "there";
  const chooseQuest = () => navigate("/quests");

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
        <DirectionCard name={name} />
      </div>

      {/* ── Tier 2 — Primary Action ─────────────────────────────────────
          Exactly one dominant element occupies this tier: the active
          Quest if one exists, or the Recovery message if it doesn't.
          These are never rendered together — showing both produced two
          competing "start something" buttons for the same situation. */}
      <div className="mt-9">
        {loading ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
          </section>
        ) : activeQuest ? (
          <PrimaryActionPanel
            quest={activeQuest}
            completing={saving}
            onComplete={() => void completeQuest(activeQuest.id)}
            onChooseQuest={chooseQuest}
          />
        ) : (
          <RecoveryState onChooseQuest={chooseQuest} />
        )}
      </div>

      {/* ── Tier 3 — Evidence of progress ───────────────────────────────
          Deliberately narrower and positioned below the dominant action
          rather than beside it, so it reads as subordinate rather than
          competing for attention. Gated behind `loading` so a returning
          user never briefly sees Level 1 / 0 XP before their real
          progress loads. */}
      <div className="mt-6 max-w-md">
        {loading ? (
          <section className="rounded-2xl bg-card/30 p-5 sm:p-6" aria-label="Loading progress">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-muted" />
          </section>
        ) : (
          <QuietProgress
            level={state.level}
            currentXp={state.currentXp}
            maxXp={state.maxXp}
            totalQuestsCompleted={state.totalQuestsCompleted}
          />
        )}
      </div>
    </div>
  );
}
