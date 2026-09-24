import * as React from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiSparkling2Line,
} from "@remixicon/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type CellValue = boolean | string;

type Feature = {
  label: string;
  values: [CellValue, CellValue];
};

type FeatureGroup = {
  section: string;
  features: Feature[];
};

const plans = [
  {
    name: "Rigid Streak Apps",
    price: "$12 / mo",
    cadence: "Subscription Churn Trap",
    highlighted: false,
    cta: "Fragile Streaks",
  },
  {
    name: "The Improvement System",
    price: "Free Forever",
    cadence: "100% Private Offline Vault",
    highlighted: true,
    cta: "Log In",
  },
] as const;

const groups: FeatureGroup[] = [
  {
    section: "Core Differentiators",
    features: [
      {
        label: "Missed Day Protocol",
        values: ["Streak resets to 0 (Guilt)", "±10% Buffer Cone (Absorbed)"],
      },
      {
        label: "Daily Task Load",
        values: ["Endless 20+ item backlog", "Strict 1 Focus + 2 Routines cap"],
      },
      {
        label: "Feedback & Motivation",
        values: ["Casino confetti & fake XP", "Quiet mathematical velocity"],
      },
      {
        label: "100% Offline Vault",
        values: [false, true],
      },
      {
        label: "Daily Time Required",
        values: ["15+ mins sorting tasks", "Under 2 minutes execution"],
      },
    ],
  },
];

function Cell({
  value,
  highlighted,
}: {
  value: CellValue;
  highlighted: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className={cn(
          "mx-auto flex size-5 items-center justify-center rounded",
          highlighted ? "bg-foreground text-background" : "bg-muted-foreground/30 text-foreground",
        )}
      >
        <RiCheckLine
          className="size-3.5 stroke-[2.5]"
          aria-hidden
        />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="mx-auto flex size-5 items-center justify-center rounded bg-muted/60 text-muted-foreground">
        <RiCloseLine className="size-3.5" aria-hidden />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-xs sm:text-sm font-medium",
        highlighted ? "text-foreground font-semibold" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

interface ComparisonTableProps {
  onSelectPlan?: (planName: string) => void;
}

export default function ComparisonTable({ onSelectPlan }: ComparisonTableProps) {
  return (
    <section className="flex w-full justify-center bg-background px-4 sm:px-6 py-12 sm:py-20 text-foreground relative z-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 max-w-2xl mx-auto text-center sm:text-left">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-tech-mono text-[11px] tracking-wider uppercase border-border/80 bg-muted/40 backdrop-blur-sm">
            <RiSparkling2Line className="size-3.5 mr-1.5 text-foreground" />
            Architectural Comparison
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground">
            Why rigid streaks fail you
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            <span className="hidden sm:inline">
              Miss one day and conventional trackers reset you to zero. The Improvement System uses a mathematical buffer so your 90-day trajectory stays unbroken.
            </span>
            <span className="sm:hidden">
              Miss one day and typical trackers reset you to zero. Our mathematical buffer absorbs life.
            </span>
          </p>
        </div>

        <div className="relative">
          <div className="overflow-x-auto rounded-2xl border border-white/15 dark:border-white/10 bg-card/75 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.25)] tis-specular-box">
            <Table className="table-fixed w-full text-sm">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/10">
                  <TableHead className="sticky top-0 z-20 w-[42%] sm:w-[46%] border-b border-white/10 bg-card/90 align-bottom p-4">
                    <span className="inline-block text-xs font-tech-mono font-bold tracking-wider text-muted-foreground uppercase">
                      Core Dimensions
                    </span>
                  </TableHead>
                  {plans.map((plan) => (
                    <TableHead
                      key={plan.name}
                      className={cn(
                        "sticky top-0 z-20 border-b border-white/10 text-center align-bottom p-4",
                        plan.highlighted ? "bg-white/[0.04]" : "bg-card/90",
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {plan.highlighted && (
                          <span className="text-[10px] font-tech-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-foreground text-background mb-1">
                            Recommended
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-display font-bold text-foreground">
                          {plan.name}
                        </span>
                        <span className="text-base sm:text-lg font-tech-mono font-bold text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-[11px] font-normal text-muted-foreground font-tech-mono">
                          {plan.cadence}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {groups.map((group) => (
                  <React.Fragment key={group.section}>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableCell
                        colSpan={3}
                        className="py-2.5 px-4 text-[11px] font-tech-mono font-bold tracking-widest text-foreground uppercase"
                      >
                        {group.section}
                      </TableCell>
                    </TableRow>
                    {group.features.map((feature) => (
                      <TableRow
                        key={`${group.section}-${feature.label}`}
                        className="hover:bg-muted/20 border-b border-border/40 transition-colors"
                      >
                        <TableCell className="py-3 px-4 font-medium text-xs sm:text-sm text-foreground">
                          {feature.label}
                        </TableCell>
                        {feature.values.map((value, i) => (
                          <TableCell
                            key={`${feature.label}-${plans[i].name}`}
                            className={cn(
                              "py-3 px-3 text-center align-middle",
                              plans[i].highlighted && "bg-white/[0.02]",
                            )}
                          >
                            <Cell
                              value={value}
                              highlighted={plans[i].highlighted}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}

                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-5 px-4" />
                  {plans.map((plan) => (
                    <TableCell
                      key={`cta-${plan.name}`}
                      className={cn(
                        "py-5 px-4 text-center align-middle",
                        plan.highlighted && "bg-white/[0.04]",
                      )}
                    >
                      <Button
                        size="sm"
                        variant={plan.highlighted ? "default" : "outline"}
                        disabled={!plan.highlighted}
                        className={cn(
                          "w-full text-xs font-display font-medium shadow-sm touch-target",
                          !plan.highlighted && "opacity-40 cursor-not-allowed text-muted-foreground",
                        )}
                        onClick={() => plan.highlighted && onSelectPlan?.(plan.name)}
                      >
                        <span>{plan.cta}</span>
                        {plan.highlighted && <RiArrowRightLine className="size-3.5 ml-1.5" />}
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
