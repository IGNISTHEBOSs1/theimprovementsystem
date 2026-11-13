import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { cn } from "@/lib/utils";
import { type Quest, getQuestRole } from "@/types/quest";

function HistoryItem({ quest }: { quest: Quest }) {
  const isCompleted = quest.completed;
  const role = getQuestRole(quest);
  const dateStr = quest.resolvedAt || quest.createdAt;
  const resolvedDate = dateStr
    ? new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <li className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
      {/* LEFT: Status icon, task title, and goal connection */}
      <div className="flex min-w-0 items-start gap-3 sm:items-center flex-1">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5 sm:mt-0 border transition-colors",
            isCompleted
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : "bg-muted/60 text-muted-foreground border-border/70"
          )}
          aria-hidden="true"
        >
          {isCompleted ? <Check className="size-4 stroke-[2.5]" /> : <X className="size-4 stroke-[2]" />}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-sm sm:text-base font-semibold text-foreground line-clamp-2 break-words leading-snug",
                !isCompleted && "text-muted-foreground font-normal line-through opacity-80"
              )}
            >
              {quest.title}
            </span>

            {/* Commitment Role Badge */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border shrink-0",
                role === "focus"
                  ? "bg-primary/10 text-primary border-primary/25 font-semibold"
                  : "bg-muted/60 text-muted-foreground border-border/70"
              )}
            >
              {role === "focus" ? "Primary Focus" : "Routine"}
            </span>
          </div>

          {/* Clear Goal Connection with Full Naturally Wrapping Name */}
          {quest.linkedToGoal && quest.goalName && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border border-primary/20 bg-primary/10 text-primary shrink-0 mt-0.5">
                <Target className="size-2.5 shrink-0" aria-hidden="true" />
                <span>Goal</span>
              </span>
              <p className="text-xs text-foreground/90 font-medium break-words leading-relaxed">
                {quest.goalName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Date & Status Pill */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0 shrink-0 text-xs">
        <span className="font-mono text-xs text-muted-foreground">{resolvedDate}</span>

        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-mono font-medium border",
            isCompleted
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : "bg-muted text-muted-foreground border-border/70"
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
  const completionRate = useMemo(
    () => (resolved.length > 0 ? Math.round((completedCount / resolved.length) * 100) : 0),
    [resolved.length, completedCount]
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
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 pb-3 sm:py-10">
      <PageHeader
        eyebrow="Personal Record"
        title="Commitment history."
        description="Chronological record of completed daily focus commitments, routines, and North Star progress."
      >
        <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5 rounded-xl border-border/80 text-xs font-semibold">
          <Link to="/profile">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to profile</span>
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
            <p className="text-xs font-semibold text-muted-foreground">Your history</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quest history.
            </h2>
            <p className="mt-2 text-body-md text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button size="lg" className="mt-4" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : resolved.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-7 text-center" aria-label="No quest history yet">
            <p className="text-body-md text-muted-foreground">
              Nothing here yet. Completed and missed commitments will appear here as you resolve them.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {/* Grounded Telemetry Plinth */}
            <div className="milled-slab rounded-xl p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-14 shrink-0 flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <span className="font-mono font-bold text-lg leading-none">{completionRate}%</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Rate</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Historical Telemetry</p>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground mt-0.5">
                      {completionRate}% All-Time Follow-Through Rate
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {completedCount} honored · {failedCount} missed · {resolved.length} total commitments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-3 py-1 text-xs font-mono font-semibold border",
                      completionRate >= 80
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : completionRate >= 60
                        ? "border-border bg-muted/60 text-foreground"
                        : "border-border/60 bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {completionRate >= 80 ? "✓ Strong Momentum" : completionRate >= 60 ? "Steady Rhythm" : "Rebuilding Flow"}
                  </span>
                </div>
              </div>

              {/* Recessed Progress Gauge */}
              <div className="space-y-1.5 pt-1">
                <div className="recessed-track h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-smooth"
                    style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
                    role="progressbar"
                    aria-valuenow={completionRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="All-time follow-through rate"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "all" | "completed" | "failed")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto p-1 rounded-xl milled-slab">
                  <TabsTrigger
                    value="all"
                    className="text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all active:scale-95"
                  >
                    All ({resolved.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all active:scale-95"
                  >
                    Completed ({completedCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="failed"
                    className="text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all active:scale-95"
                  >
                    Missed ({failedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden="true" />
                <Input
                  name="search"
                  type="search"
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by title or goal…"
                  className="pl-8 text-xs h-9 bg-background/80 rounded-xl border-border/80 shadow-2xs"
                  aria-label="Filter quests"
                />
              </div>
            </div>

            {/* UNIFIED RECEIPT LEDGER CONTAINER */}
            {filteredQuests.length > 0 ? (
              <div className="milled-slab rounded-xl shadow-xs overflow-hidden">
                <ul className="divide-y divide-border/50" aria-label="Filtered quest history list">
                  {filteredQuests.map((quest) => (
                    <HistoryItem key={quest.id} quest={quest} />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="milled-slab rounded-xl p-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  No commitments match {search ? `"${search}"` : "this filter"}.
                </p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-primary active:scale-95"
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
