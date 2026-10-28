import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Repeat, Settings2, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TIS_SPRINGS } from "@/lib/motion-tokens";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { QuestPriority, QuestRole } from "@/types/quest";
import type { CadencePreset } from "@/hooks/useDashboardData";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRIORITIES: QuestPriority[] = ["Essential", "Important", "Optional"];
const CADENCE_PRESETS: CadencePreset[] = ["Once", "Daily", "Weekdays", "Weekends", "Weekly", "Custom"];

interface TodaysCommitmentProps {
  committing: boolean;
  onCommit: (
    commitment: string,
    linkedToGoal: boolean,
    cadence: CadencePreset,
    customDays: number[],
    priority: QuestPriority,
    role: QuestRole,
  ) => void;
  onCancel?: () => void;
  goalLabel?: string;
  initialRole?: QuestRole;
  initialValues?: { title: string; priority: QuestPriority; linkedToGoal: boolean; role?: QuestRole };
  completedGoalQuests?: number;
  focusAvailable?: boolean;
  routineAvailable?: boolean;
}

export function TodaysCommitment({
  committing,
  onCommit,
  onCancel,
  goalLabel,
  initialRole,
  initialValues,
  completedGoalQuests = 0,
  focusAvailable = true,
  routineAvailable = true,
}: TodaysCommitmentProps) {
  const [commitment, setCommitment] = useState(initialValues?.title ?? "");
  const defaultRole: QuestRole =
    initialRole ?? initialValues?.role ?? (focusAvailable ? "focus" : "routine");
  const [role, setRole] = useState<QuestRole>(defaultRole);
  const [linkedToGoal, setLinkedToGoal] = useState(initialValues?.linkedToGoal ?? Boolean(goalLabel));
  const [showOptions, setShowOptions] = useState(Boolean(initialValues && initialValues.priority !== "Essential"));

  const [cadence, setCadence] = useState<CadencePreset>(
    defaultRole === "routine" ? "Daily" : "Once",
  );
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [priority, setPriority] = useState<QuestPriority>(
    initialValues?.priority ?? (defaultRole === "focus" ? "Essential" : "Important"),
  );

  const handleRoleChange = (newRole: QuestRole) => {
    setRole(newRole);
    if (newRole === "focus") {
      setCadence("Once");
      setPriority("Essential");
    } else {
      setCadence("Daily");
      setPriority("Important");
    }
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const cadenceInvalid = showOptions && cadence === "Custom" && customDays.length === 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commitment.trim() || committing || cadenceInvalid) return;
    onCommit(
      commitment.trim(),
      linkedToGoal,
      showOptions ? cadence : role === "routine" ? "Daily" : "Once",
      showOptions ? customDays : [],
      showOptions ? priority : role === "focus" ? "Essential" : "Important",
      role,
    );
  };

  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]"
      aria-labelledby="todays-commitment-heading"
      onKeyDown={(e) => {
        if (e.key === "Escape" && onCancel && !committing) {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">New commitment</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={committing}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1.5 py-0.5 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <h2 id="todays-commitment-heading" className="mt-1.5 text-base sm:text-lg font-semibold tracking-tight text-foreground">
        What are you committing to?
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        {/* STEP 1: NAME THE COMMITMENT */}
        <div>
          <Label htmlFor="commitment-title" className="text-xs font-medium text-foreground block mb-1.5">
            1. Name your commitment
          </Label>
          <Input
            id="commitment-title"
            name="title"
            autoComplete="off"
            value={commitment}
            onChange={(event) => setCommitment(event.target.value)}
            placeholder="e.g. Master system architecture or 20-min daily run…"
            aria-label="Your commitment"
            disabled={committing}
            className="min-h-11 bg-background"
            autoFocus
          />
        </div>

        {/* STEP 2: CHOOSE ROLE: PRIMARY FOCUS OR ROUTINE */}
        <div>
          <Label className="text-xs font-medium text-foreground block mb-1.5">
            2. Choose commitment role
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Primary Focus Option */}
            <button
              type="button"
              disabled={committing || (!focusAvailable && role !== "focus")}
              onClick={() => handleRoleChange("focus")}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]",
                role === "focus"
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border/80 bg-background/60 hover:bg-muted/40",
                !focusAvailable && role !== "focus" && "opacity-50 cursor-not-allowed hover:bg-background/60",
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                role === "focus" ? "border-primary bg-primary text-white" : "border-border bg-muted/40 text-muted-foreground"
              )}>
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Primary Focus</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    1 slot
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Your dominant, non-negotiable action for today.
                </p>
                {!focusAvailable && role !== "focus" && (
                  <span className="text-[10px] text-amber-500 font-medium mt-1 inline-block">
                    Slot currently occupied
                  </span>
                )}
              </div>
            </button>

            {/* Supporting Routine Option */}
            <button
              type="button"
              disabled={committing || (!routineAvailable && role !== "routine")}
              onClick={() => handleRoleChange("routine")}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]",
                role === "routine"
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border/80 bg-background/60 hover:bg-muted/40",
                !routineAvailable && role !== "routine" && "opacity-50 cursor-not-allowed hover:bg-background/60",
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                role === "routine" ? "border-primary bg-primary text-white" : "border-border bg-muted/40 text-muted-foreground"
              )}>
                <Repeat className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Supporting Routine</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    Max 2
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  A regular repeating practice that protects momentum.
                </p>
                {!routineAvailable && role !== "routine" && (
                  <span className="text-[10px] text-amber-500 font-medium mt-1 inline-block">
                    Both routine slots occupied
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* STEP 3: LINK TO CURRENT GOAL */}
        {goalLabel && (
          <div className="pt-1">
            <Label className="text-xs font-medium text-foreground block mb-1.5">
              3. Link to North Star goal
            </Label>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border/70 bg-background/60">
              <Checkbox
                id="linked-to-goal"
                checked={linkedToGoal}
                onCheckedChange={(checked) => setLinkedToGoal(checked === true)}
                disabled={committing}
                className="size-4"
              />
              <Label
                htmlFor="linked-to-goal"
                className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none font-medium flex-1 truncate"
              >
                <Target className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{goalLabel}</span>
              </Label>
            </div>
            {linkedToGoal && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-mono text-primary animate-in fade-in duration-200">
                <Check className="size-3 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Counts toward North Star • Step #{completedGoalQuests + 1} of 90
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: OPTIONAL SETTINGS (PROGRESSIVE DISCLOSURE) */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              4. Schedule & Priority
            </span>
            <button
              type="button"
              onClick={() => setShowOptions((v) => !v)}
              disabled={committing}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1.5 py-0.5 cursor-pointer"
              aria-expanded={showOptions}
            >
              <Settings2 className="size-3.5" aria-hidden="true" />
              <span>{showOptions ? "Hide options" : "Custom cadence & priority"}</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={TIS_SPRINGS.settle}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 sm:p-4 text-xs mt-2">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <span className="w-16 font-medium text-muted-foreground shrink-0">Priority</span>
                    <ToggleGroup
                      type="single"
                      value={priority}
                      onValueChange={(val) => {
                        if (val) setPriority(val as QuestPriority);
                      }}
                      disabled={committing}
                      className="flex-wrap justify-start gap-1.5"
                      aria-label="Priority"
                    >
                      {PRIORITIES.map((level) => (
                        <ToggleGroupItem
                          key={level}
                          value={level}
                          size="sm"
                          className="h-7 px-2.5 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                        >
                          {level}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <span className="w-16 font-medium text-muted-foreground shrink-0">Cadence</span>
                    <ToggleGroup
                      type="single"
                      value={cadence}
                      onValueChange={(val) => {
                        if (val) setCadence(val as CadencePreset);
                      }}
                      disabled={committing}
                      className="flex-wrap justify-start gap-1.5"
                      aria-label="Cadence"
                    >
                      {CADENCE_PRESETS.map((preset) => (
                        <ToggleGroupItem
                          key={preset}
                          value={preset}
                          size="sm"
                          className="h-7 px-2.5 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                        >
                          {preset}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  {cadence === "Custom" && (
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className="w-16 font-medium text-muted-foreground shrink-0">Days</span>
                      <ToggleGroup
                        type="multiple"
                        value={customDays.map(String)}
                        onValueChange={(vals) => setCustomDays(vals.map(Number).sort())}
                        disabled={committing}
                        className="flex-wrap justify-start gap-1.5"
                        aria-label="Repeat on which days"
                      >
                        {DAY_LABELS.map((label, i) => (
                          <ToggleGroupItem
                            key={i}
                            value={String(i)}
                            size="sm"
                            className="h-7 w-9 px-0 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 font-medium"
                          >
                            {label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            className="min-h-11 px-6 font-semibold"
            disabled={committing || !commitment.trim() || cadenceInvalid}
          >
            {committing ? "Committing…" : `Commit to ${role === "focus" ? "Primary Focus" : "Supporting Routine"}`}
            {!committing && <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />}
          </Button>
        </div>
      </form>
    </section>
  );
}
