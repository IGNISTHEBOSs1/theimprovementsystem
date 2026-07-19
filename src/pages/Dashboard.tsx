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

      {/* ── Tier 2 — Next Meaningful Action + Evidence of Progress ─────
          Same tier, side by side: Action and Progress are genuinely
          related (both describe current effort), so proximity groups
          them. The Action column is given more flexible width so it
          visibly dominates — not a fixed ratio, just fr-based growth. */}
      <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-stretch">
        {loading ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
          </section>
        ) : (
          <PrimaryActionPanel
            quest={activeQuest}
            completing={saving}
            onComplete={() => activeQuest && void completeQuest(activeQuest.id)}
            onChooseQuest={chooseQuest}
          />
        )}

        <QuietProgress
          level={state.level}
          currentXp={state.currentXp}
          maxXp={state.maxXp}
          totalQuestsCompleted={state.totalQuestsCompleted}
        />
      </div>

      {/* ── Tier 3 — Supporting information ─────────────────────────── */}
      {!loading && !activeQuest && (
        <div className="mt-6">
          <RecoveryState onChooseQuest={chooseQuest} />
        </div>
      )}
    </div>
  );
}
