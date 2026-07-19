import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuestCard } from "@/components/quests/QuestCard";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";

export default function Quests() {
  const { state, loading, saving, completeQuest } = useDashboardDataContext();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your quests"
        title="All active quests."
        description="Every quest available to you right now, in one place."
      />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quests">
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : state.quests.length === 0 ? (
          <section className="rounded-2xl border border-border bg-muted/30 p-6" aria-labelledby="no-quests-heading">
            <p id="no-quests-heading" className="text-body-md text-muted-foreground">
              You have no quests right now.
            </p>
          </section>
        ) : (
          <ul className="space-y-3">
            {state.quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                completing={saving}
                onComplete={completeQuest}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
