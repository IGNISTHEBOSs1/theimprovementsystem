import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <li className="flex flex-col gap-2.5 px-4 py-3.5 transition-colors hover:bg-[#181B24]/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
      {/* LEFT AXIS: Hard-aligned status icon & task title (Receipt Left Edge) */}
      <div className="flex min-w-0 items-start gap-3 sm:items-center flex-1">
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-lg mt-0.5 sm:mt-0 border transition-colors",
            isCompleted
              ? "bg-white/10 text-white border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
              : "bg-[#181B24] text-muted-foreground border-[rgba(148,163,184,0.14)]"
          )}
          aria-hidden="true"
        >
          {isCompleted ? <Check className="size-3.5 stroke-[2.5]" /> : <X className="size-3.5 stroke-[2]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold text-foreground font-sans truncate",
                !isCompleted && "text-muted-foreground font-normal line-through"
              )}
            >
              {quest.title}
            </span>
          </div>

          {/* Goal pill on mobile */}
          {quest.linkedToGoal && quest.goalName && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:hidden truncate">
              <Target className="size-3 text-zinc-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{quest.goalName}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AXIS: Goal pill (desktop), Priority, Date & Status (Receipt Right Edge) */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-9 sm:pl-0 shrink-0 text-xs">
        {/* Desktop Goal Pill */}
        {quest.linkedToGoal && quest.goalName && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#181B24] px-2.5 py-0.5 text-[11px] text-muted-foreground border border-[rgba(148,163,184,0.14)] max-w-[170px] truncate shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)]">
            <Target className="size-3 text-zinc-400 shrink-0" aria-hidden="true" />
            <span className="truncate text-foreground font-medium">{quest.goalName}</span>
          </div>
        )}

        {/* Priority */}
        {quest.priority !== "Essential" ? (
          <span
            className={cn(
              "font-mono text-[11px] px-2 py-0.5 rounded-md border",
              quest.priority === "Important"
                ? "text-foreground bg-[#181B24] border-[rgba(148,163,184,0.18)]"
                : "text-muted-foreground bg-[#181B24]/60 border-[rgba(148,163,184,0.12)]"
            )}
          >
            {quest.priority}
          </span>
        ) : null}

        <span className="font-mono text-xs text-muted-foreground tnum">{resolvedDate}</span>

        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-mono tnum font-semibold border",
            isCompleted
              ? "bg-white/10 text-white border-white/20"
              : "bg-[#181B24] text-muted-foreground border-[rgba(148,163,184,0.14)]"
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
            <div className="h-16 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
            <div className="h-16 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
            <div className="h-16 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
          </div>
        ) : error ? (
          <section
            className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            aria-label="Quest history unavailable"
          >
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your history</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quest history.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button size="lg" className="mt-4 rounded-xl px-6 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)]" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : resolved.length === 0 ? (
          <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 text-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)]" aria-label="No quest history yet">
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Completed and missed quests will appear here as you resolve them.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {/* Momentum & All-Time Completion Rate Anchor */}
            <div className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-11 shrink-0 flex items-center justify-center rounded-xl bg-[#181B24] border border-white/20 text-white font-mono font-bold text-xs tnum shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
                  {completionRate}%
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-sans">
                    {completionRate}% All-Time Completion Rate
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 tnum font-mono">
                    {completedCount} of {resolved.length} commitments honored to date
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-mono tnum px-2.5 py-1 rounded-full",
                    completionRate >= 80
                      ? "border-white/20 bg-white/10 text-white font-semibold shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                      : completionRate >= 60
                      ? "border-[rgba(148,163,184,0.2)] bg-[#181B24] text-foreground/90 font-medium"
                      : "border-[rgba(148,163,184,0.14)] bg-[#181B24] text-muted-foreground"
                  )}
                >
                  {completionRate >= 80 ? "✓ Strong Momentum" : completionRate >= 60 ? "Steady Rhythm" : "Rebuilding Flow"}
                </Badge>
              </div>
            </div>

            {/* Filter Tabs & Search Bar Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "all" | "completed" | "failed")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto h-10 p-1 rounded-xl bg-[#181B24] border border-[rgba(148,163,184,0.14)]">
                  <TabsTrigger value="all" className="text-xs font-mono tnum rounded-lg data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-[rgba(148,163,184,0.14)] active:scale-[0.98]">
                    All ({resolved.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs font-mono tnum rounded-lg data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-[rgba(148,163,184,0.14)] active:scale-[0.98]">
                    Completed ({completedCount})
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs font-mono tnum rounded-lg data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-[rgba(148,163,184,0.14)] active:scale-[0.98]">
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
                  className="pl-8 text-xs h-10 rounded-xl bg-[#181B24] border-[rgba(148,163,184,0.14)] text-foreground placeholder:text-muted-foreground/60 shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.3)] focus-visible:ring-white/40"
                  aria-label="Filter quests"
                />
              </div>
            </div>

            {/* UNIFIED RECEIPT LEDGER CONTAINER */}
            {filteredQuests.length > 0 ? (
              <div className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.45)] overflow-hidden">
                <ul className="divide-y divide-[rgba(148,163,184,0.1)]" aria-label="Filtered quest history list">
                  {filteredQuests.map((quest) => (
                    <HistoryItem key={quest.id} quest={quest} />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A]/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No quests match {search ? `"${search}"` : "this filter"}.
                </p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-white hover:text-zinc-300 hover:bg-[#181B24] rounded-xl active:scale-[0.98]"
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
