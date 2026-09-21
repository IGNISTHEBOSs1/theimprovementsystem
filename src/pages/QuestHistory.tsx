import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { cn } from "@/lib/utils";
import type { Quest } from "@/types/quest";

function HistoryItem({ quest }: { quest: Quest }) {
  const isCompleted = quest.completed;
  const dateStr = quest.resolvedAt || quest.createdAt;
  const resolvedDate = dateStr
    ? new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-3.5 transition-colors hover:bg-card sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full mt-0.5 sm:mt-0",
            isCompleted ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border/60"
          )}
          aria-hidden="true"
        >
          {isCompleted ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PRIORITY_BADGE_CLASSES[quest.priority])}>
              {quest.priority}
            </Badge>
            <span className="font-medium text-foreground text-sm truncate">{quest.title}</span>
          </div>
          {quest.linkedToGoal && quest.goalName && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
              <Target className="size-3 shrink-0" aria-hidden="true" />
              <span>Supports: {quest.goalName}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-10 sm:pl-0 shrink-0">
        <span className="font-mono text-xs text-muted-foreground">{resolvedDate}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            isCompleted
              ? "bg-primary/10 text-primary border border-primary/25"
              : "bg-muted text-muted-foreground border border-border/60"
          )}
        >
          {isCompleted ? "Completed" : "Missed"}
        </span>
      </div>
    </li>
  );
}

export default function QuestHistory() {
  const { state, loading, error, reload } = useDashboardDataContext();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "failed">("all");

  const resolved = useMemo(() => {
    return state.quests
      .filter((quest) => quest.completed || quest.failed)
      .sort((a, b) => (b.resolvedAt || b.createdAt).localeCompare(a.resolvedAt || a.createdAt));
  }, [state.quests]);

  const completedCount = useMemo(() => resolved.filter((q) => q.completed).length, [resolved]);
  const failedCount = useMemo(() => resolved.filter((q) => q.failed).length, [resolved]);

  const filteredQuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resolved.filter((quest) => {
      // Tab filter
      if (activeTab === "completed" && !quest.completed) return false;
      if (activeTab === "failed" && !quest.failed) return false;

      // Text search
      if (!query) return true;
      const titleMatch = quest.title.toLowerCase().includes(query);
      const goalMatch = Boolean(quest.goalName?.toLowerCase().includes(query));
      return titleMatch || goalMatch;
    });
  }, [resolved, activeTab, search]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-8 sm:px-8 sm:py-10 sm:pb-12">
      <PageHeader
        eyebrow="Your system"
        title="Quest history."
        description="Search and review your past commitments and outcomes."
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
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
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
        ) : resolved.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-7 text-center" aria-label="No quest history yet">
            <p className="text-body-md text-muted-foreground">
              Nothing here yet. Completed and missed quests will appear here as you resolve them.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {/* Filter Tabs & Search Bar Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "all" | "completed" | "failed")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                  <TabsTrigger value="all" className="text-xs">
                    All ({resolved.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">
                    Completed ({completedCount})
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs">
                    Missed ({failedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by title or goal..."
                  className="pl-8 text-xs h-9"
                  aria-label="Filter quests"
                />
              </div>
            </div>

            {/* List of Filtered Items */}
            {filteredQuests.length > 0 ? (
              <ul className="space-y-2" aria-label="Filtered quest history list">
                {filteredQuests.map((quest) => (
                  <HistoryItem key={quest.id} quest={quest} />
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-card/40 p-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  No quests match {search ? `"${search}"` : "this filter"}.
                </p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-primary"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
