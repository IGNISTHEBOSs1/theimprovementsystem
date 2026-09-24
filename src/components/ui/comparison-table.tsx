import * as React from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { Flame } from "lucide-react";

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
import { SystemLogo } from "@/components/branding/Logo";
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
    name: "Other Habit Apps",
    highlighted: false,
    cta: "Fragile Streaks",
  },
  {
    name: "The Improvement System",
    highlighted: true,
    cta: "Log In",
  },
] as const;

const groups: FeatureGroup[] = [
  {
    section: "Trajectory & Consistency",
    features: [
      {
        label: "±10% Mathematical Safety Buffer",
        values: [false, true],
      },
      {
        label: "Strict 1 Focus + 2 Routines Cap",
        values: [false, true],
      },
      {
        label: "Guilt-Free Life Absorption",
        values: [false, true],
      },
      {
        label: "Deterministic 90-Day Vector",
        values: [false, true],
      },
    ],
  },
  {
    section: "Privacy & Architecture",
    features: [
      {
        label: "100% Local Encrypted Vault",
        values: [false, true],
      },
      {
        label: "Zero Confetti / Casino Streaks",
        values: [false, true],
      },
      {
        label: "Under 2-Minute Daily Execution",
        values: ["-", true],
      },
      {
        label: "Free Forever (No Paywalls)",
        values: [false, true],
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
          "mx-auto flex size-5 items-center justify-center rounded-md transition-transform",
          highlighted ? "bg-foreground text-background shadow-xs" : "bg-muted text-muted-foreground",
        )}
      >
        <RiCheckLine
          className="size-3.5 stroke-[2.5]"
          aria-hidden
        />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="mx-auto flex size-5 items-center justify-center rounded-md bg-muted/50 text-muted-foreground/60">
        <RiCloseLine className="size-3.5" aria-hidden />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  // Null sign: "-" or "—"
  return (
    <span
      className={cn(
        "mx-auto flex size-5 items-center justify-center text-xs font-tech-mono font-medium",
        highlighted ? "text-foreground" : "text-muted-foreground/60",
      )}
      aria-hidden
    >
      —
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
                  {/* Leftmost Column Header: Basis */}
                  <TableHead className="sticky top-0 z-20 w-[44%] sm:w-[46%] border-b border-white/10 bg-card/90 align-bottom p-4">
                    <span className="inline-block text-xs font-tech-mono font-bold tracking-wider text-muted-foreground uppercase">
                      Basis
                    </span>
                  </TableHead>

                  {/* Middle Column: Random Habit App Logo */}
                  <TableHead className="sticky top-0 z-20 border-b border-white/10 text-center align-bottom p-4 bg-card/90">
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center text-muted-foreground shadow-xs">
                        <Flame className="size-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-display font-semibold text-muted-foreground">
                        Other Habit Apps
                      </span>
                      <span className="text-[10px] font-tech-mono text-muted-foreground/60">
                        Rigid Streaks
                      </span>
                    </div>
                  </TableHead>

                  {/* Rightmost Column: TIS Logo */}
                  <TableHead className="sticky top-0 z-20 border-b border-white/10 text-center align-bottom p-4 bg-white/[0.04]">
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-1 rounded-xl bg-card border border-white/20 shadow-xs backdrop-blur-md">
                        <SystemLogo size={24} />
                      </div>
                      <span className="text-xs sm:text-sm font-display font-bold text-foreground">
                        The Improvement System
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-foreground text-background">
                        Buffer Engine
                      </span>
                    </div>
                  </TableHead>
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
                  <TableCell className="py-4 px-4" />
                  {plans.map((plan) => (
                    <TableCell
                      key={`cta-${plan.name}`}
                      className={cn(
                        "py-4 px-4 text-center align-middle",
                        plan.highlighted && "bg-white/[0.04]",
                      )}
                    >
                      <Button
                        size="sm"
                        variant={plan.highlighted ? "default" : "outline"}
                        disabled={!plan.highlighted}
                        className={cn(
                          "w-full text-xs font-display font-medium shadow-xs h-9",
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
