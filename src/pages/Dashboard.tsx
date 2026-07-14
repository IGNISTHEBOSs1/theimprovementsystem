import { useNavigate } from "react-router-dom";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { QuietProgress } from "@/components/dashboard/QuietProgress";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { state, loading, saving, completeQuest } = useDashboardData(user?.id);
  const activeQuest = state.quests.find((quest) => !quest.completed && !quest.failed);
  const name = profile?.username || "there";
  const chooseQuest = () => navigate("/quests");

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title={`Welcome back, ${name}.`}
        description="A quiet place to reconnect with what matters and take the next meaningful step."
      />

      <div className="mt-10 space-y-8">
        <DirectionCard name={name} />

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

        {!loading && !activeQuest && <RecoveryState onChooseQuest={chooseQuest} />}
      </div>
    </div>
  );
}
