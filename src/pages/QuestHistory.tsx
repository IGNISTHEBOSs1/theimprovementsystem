import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuestCard } from "@/components/quests/QuestCard";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";

// Quest History is an archive, not another active surface. It reads the
// same state.quests array Dashboard/Quests already load — nothing here
// queries anything new, and nothing here can mark a quest active again.
// completed/failed quests already carry a completing-button-free render
// path in QuestCard, so that component is reused as-is rather than
// building a second, parallel quest-row component.
export default function QuestHistory() {
  const { state, loading, error, reload } = useDashboardDataContext();

  const completed = state.quests
    .filter((quest) => quest.completed)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const failed = state.quests
    .filter((quest) => quest.failed)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const noOp = () => {};

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title="Quest history."
        description="What you've completed and what you missed."
      >
        <Button variant="ghost" asChild className="shrink-0">
          <Link to="/profile">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to profile
          </Link>
        </Button>
      </PageHeader>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quest history">
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
          <section
            className="rounded-2xl border border-border bg-card p-7"
            aria-label="Quest history unavailable"
          >
            <p className="text-label text-muted-foreground">Your history</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quest history.
            </h2>
            <p className="mt-2 text-body-md text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : completed.length === 0 && failed.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="No quest history yet">
            <p className="text-body-md text-muted-foreground">
              Nothing here yet. Completed and missed quests will show up as you go.
            </p>
          </section>
        ) : (
          <div className="flex flex-col gap-8">
            <section aria-labelledby="completed-heading">
              <h2 id="completed-heading" className="text-label text-muted-foreground mb-3">
                Completed
              </h2>
              {completed.length > 0 ? (
                <ul className="space-y-3">
                  {completed.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} onComplete={noOp} />
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-muted-foreground">None yet.</p>
              )}
            </section>

            <section aria-labelledby="failed-heading">
              <h2 id="failed-heading" className="text-label text-muted-foreground mb-3">
                Missed
              </h2>
              {failed.length > 0 ? (
                <ul className="space-y-3">
                  {failed.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} onComplete={noOp} />
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-muted-foreground">None yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
