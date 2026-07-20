import { useNavigate } from "react-router-dom";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { QuietProgress } from "@/components/dashboard/QuietProgress";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { state, loading, saving, completeQuest } = useDashboardDataContext();
  const activeQuest = state.quests.find((quest) => !quest.completed && !quest.failed);
  const name = profile?.username || "there";
  const chooseQuest = () => navigate("/quests");

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
