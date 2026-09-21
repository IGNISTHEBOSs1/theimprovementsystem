import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
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
    <li className="flex flex-col gap-2.5 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
      {/* LEFT AXIS: Hard-aligned status icon & task title (Receipt Left Edge) */}
      <div className="flex min-w-0 items-start gap-3 sm:items-center flex-1">
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-lg mt-0.5 sm:mt-0 border transition-colors",
            isCompleted
              ? "bg-primary/10 text-primary border-primary/25"
              : "bg-muted/50 text-muted-foreground border-border/70"
          )}
          aria-hidden="true"
        >
          {isCompleted ? <Check className="size-3.5 stroke-[2.5]" /> : <X className="size-3.5 stroke-[2]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium text-foreground truncate",
                !isCompleted && "text-muted-foreground"
              )}
            >
              {quest.title}
            </span>
          </div>

          {/* Goal pill on mobile (Show, Don't Tell: no redundant 'Supports:' text) */}
          {quest.linkedToGoal && quest.goalName && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:hidden truncate">
              <Target className="size-3 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{quest.goalName}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AXIS: Goal pill (desktop), Priority, Date & Status (Receipt Right Edge) */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-9 sm:pl-0 shrink-0 text-xs">
        {/* Desktop Goal Pill */}
        {quest.linkedToGoal && quest.goalName && (
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/50 max-w-[150px] truncate">
            <Target className="size-2.5 text-primary shrink-0" aria-hidden="true" />
            <span className="truncate">{quest.goalName}</span>
          </div>
        )}

        {/* Priority (Relational emphasis: only Important/elevated gets badge) */}
        {quest.priority !== "Essential" ? (
          <span
            className={cn(
              "font-medium text-[11px] px-1.5 py-0.5 rounded border",
              quest.priority === "Important"
                ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                : "text-muted-foreground bg-muted/30 border-border/60"
            )}
          >
            {quest.priority}
          </span>
        ) : null}

        <span className="font-mono text-xs text-muted-foreground/80">{resolvedDate}</span>

        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border",
            isCompleted
              ? "bg-primary/10 text-primary border-primary/25"
              : "bg-muted/40 text-muted-foreground border-border/60 font-mono"
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
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "failed">("all");
  const [search, setSearch] = useState("");

  const resolved = useMemo(
    () => state.quests.filter((q) => q.completed || q.failed),
    [state.quests]
  );

  const completedCount = useMemo(
    () => resolved.filter((q) => q.completed).length,
    [resolved]
  );
  const failedCount = useMemo(
    () => resolved.filter((q) => q.failed).length,
    [resolved]
  );

  const filteredQuests = useMemo(() => {
    return resolved.filter((q) => {
      if (activeTab === "completed" && !q.completed) return false;
      if (activeTab === "failed" && !q.failed) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesGoal = q.goalName?.toLowerCase().includes(query) ?? false;
        return matchesTitle || matchesGoal;
      }
      return true;
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
                  className="pl-8 text-xs h-9 bg-background"
                  aria-label="Filter quests"
                />
              </div>
            </div>

            {/* UNIFIED RECEIPT LEDGER CONTAINER */}
            {filteredQuests.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
                <ul className="divide-y divide-border/60" aria-label="Filtered quest history list">
                  {filteredQuests.map((quest) => (
                    <HistoryItem key={quest.id} quest={quest} />
                  ))}
                </ul>
              </div>
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
