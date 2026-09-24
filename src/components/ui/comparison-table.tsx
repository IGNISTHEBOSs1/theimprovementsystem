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

type ComparisonRow = {
  basis: string;
  subBasis?: string;
  otherText: string;
  tisText: string;
};

// 4 high-signal, punchy comparison criteria (reduced basis for instant clarity on both mobile and PC)
const comparisons: ComparisonRow[] = [
  {
    basis: "When life happens (missed day)",
    subBasis: "Illness, late flights, emergencies",
    otherText: "Resets streak to Day 0 (guilt & churn)",
    tisText: "±10% buffer absorbs it (trajectory unbroken)",
  },
  {
    basis: "Daily task load",
    subBasis: "Cognitive overhead & willpower",
    otherText: "Endless 15–20 item checklist overwhelm",
    tisText: "Strict 1 Focus + 2 Routines (<2 min execution)",
  },
  {
    basis: "Psychological model",
    subBasis: "Motivation vs trajectory",
    otherText: "Binary pass/fail streaks & casino badges",
    tisText: "Quiet 90-day mathematical momentum",
  },
  {
    basis: "Privacy & cost",
    subBasis: "Data sovereignty & paywalls",
    otherText: "Paywalled streaks & cloud data harvesting",
    tisText: "100% Free forever & local encrypted vault",
  },
];

interface ComparisonTableProps {
  onSelectPlan?: (planName: string) => void;
}

export default function ComparisonTable({ onSelectPlan }: ComparisonTableProps) {
  const [mobileTab, setMobileTab] = React.useState<"tis" | "other">("tis");

  return (
    <section id="comparison-section" className="flex w-full justify-center bg-transparent px-3.5 sm:px-6 md:px-8 py-12 sm:py-20 text-foreground relative z-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Section Header: Philosophical framing instead of aggressive attack */}
        <div className="mb-6 sm:mb-8 max-w-2xl mx-auto text-center sm:text-left">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 font-tech-mono text-[11px] tracking-wider uppercase border-white/20 dark:border-white/10 bg-white/[0.04] dark:bg-zinc-900/40 backdrop-blur-md shadow-xs"
          >
            <RiSparkling2Line className="size-3.5 mr-1.5 text-foreground" />
            Architectural Comparison
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            A different way to think about consistency
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            <span className="hidden sm:inline">
              Traditional streak systems optimize for uninterrupted perfection. The Improvement System is engineered to absorb life's disruptions so your 90-day trajectory stays unbroken.
            </span>
            <span className="sm:hidden">
              Traditional systems punish missed days. Our mathematical buffer absorbs life so your trajectory continues.
            </span>
          </p>
        </div>

        {/* ── MOBILE VIEW: RESPONSIVE SEGMENTED CONTROL (RULE 4 OF BRAND INVARIANTS) ── */}
        <div className="block sm:hidden">
          {/* Segmented Pill Selector (Liquid Frosted Glass) */}
          <div className="flex items-center p-1 rounded-2xl bg-white/[0.05] dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-white/15 mb-4 tis-specular-box shadow-lg">
            <button
              type="button"
              onClick={() => setMobileTab("tis")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-display font-semibold transition-all duration-200",
                mobileTab === "tis"
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SystemLogo size={16} />
              <span>The Improvement System</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("other")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-display font-medium transition-all duration-200",
                mobileTab === "other"
                  ? "bg-muted text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="size-3.5 text-muted-foreground" />
              <span>Conventional Apps</span>
            </button>
          </div>

          {/* Mobile Comparison Cards (Liquid Frosted Glass Tiles) */}
          <div className="space-y-3">
            {comparisons.map((row) => (
              <div
                key={row.basis}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 backdrop-blur-xl shadow-lg tis-specular-box",
                  mobileTab === "tis"
                    ? "bg-white/[0.06] dark:bg-zinc-900/40 border-white/25 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    : "bg-white/[0.02] dark:bg-zinc-950/30 border-white/10 dark:border-white/[0.08]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    {row.basis}
                  </span>
                  {row.subBasis && (
                    <span className="text-[10px] text-muted-foreground font-tech-mono">
                      {row.subBasis}
                    </span>
                  )}
                </div>

                {mobileTab === "tis" ? (
                  <div className="flex items-start gap-2.5 pt-1">
                    <span className="flex size-5 items-center justify-center rounded bg-foreground text-background shrink-0 mt-0.5 shadow-xs">
                      <RiCheckLine className="size-3.5 stroke-[2.5]" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold text-foreground leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      {row.tisText}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 pt-1">
                    <span className="flex size-5 items-center justify-center rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
                      <RiCloseLine className="size-3.5" aria-hidden />
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {row.otherText}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-5">
            <Button
              size="sm"
              variant="default"
              className="w-full text-xs font-display font-semibold shadow-md h-10 active:scale-[0.98] rounded-xl"
              onClick={() => onSelectPlan?.("The Improvement System")}
            >
              <span>Start My 90 Days</span>
              <RiArrowRightLine className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* ── DESKTOP VIEW: CLEAN 3-COLUMN SIDE-BY-SIDE MATRIX (LIQUID FROSTED GLASS) ── */}
        <div className="hidden sm:block relative">
          <div className="overflow-x-auto rounded-2xl md:rounded-3xl border border-white/20 dark:border-white/15 bg-white/[0.03] dark:bg-zinc-950/35 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.35)] tis-specular-box transition-all duration-300">
            <Table className="table-fixed w-full text-xs sm:text-sm">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/15 dark:border-white/10 bg-white/[0.04] dark:bg-white/[0.02]">
                  {/* Left Column: Basis */}
                  <TableHead className="w-[38%] border-b border-white/15 dark:border-white/10 bg-transparent align-bottom p-3.5 sm:p-4">
                    <span className="inline-block text-[10px] sm:text-xs font-tech-mono font-bold tracking-wider text-muted-foreground uppercase">
                      Basis of Design
                    </span>
                  </TableHead>

                  {/* Middle Column: Other Habit Apps */}
                  <TableHead className="w-[31%] border-b border-white/15 dark:border-white/10 text-center align-bottom p-3.5 sm:p-4 bg-transparent">
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="size-7 sm:size-8 rounded-xl bg-white/[0.05] dark:bg-zinc-800/40 border border-white/15 dark:border-white/10 flex items-center justify-center text-muted-foreground shadow-xs backdrop-blur-md">
                        <Flame className="size-3.5 sm:size-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-display font-semibold text-muted-foreground">
                        Other Habit Apps
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono text-muted-foreground/70">
                        Rigid Streaks
                      </span>
                    </div>
                  </TableHead>

                  {/* Right Column: The Improvement System */}
                  <TableHead className="w-[31%] border-b border-white/15 dark:border-white/10 text-center align-bottom p-3.5 sm:p-4 bg-white/[0.06] dark:bg-white/[0.04] border-l border-white/15 dark:border-white/10">
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-1 rounded-xl bg-card/80 border border-white/20 shadow-xs backdrop-blur-md">
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
                {comparisons.map((row) => (
                  <TableRow
                    key={row.basis}
                    className="hover:bg-white/[0.04] dark:hover:bg-white/[0.02] border-b border-white/10 dark:border-white/[0.06] transition-colors"
                  >
                    {/* Basis Column */}
                    <TableCell className="py-3 px-3 sm:px-4 align-top sm:align-middle">
                      <p className="font-semibold text-xs sm:text-sm text-foreground leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        {row.basis}
                      </p>
                      {row.subBasis && (
                        <p className="text-[11px] text-muted-foreground font-tech-mono mt-0.5">
                          {row.subBasis}
                        </p>
                      )}
                    </TableCell>

                    {/* Other Habit Apps Column */}
                    <TableCell className="py-3 px-2.5 sm:px-3 text-center sm:text-left align-top sm:align-middle">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2">
                        <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-muted/70 text-muted-foreground shrink-0 mt-0.5 shadow-xs">
                          <RiCloseLine className="size-3 sm:size-3.5" aria-hidden />
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                          {row.otherText}
                        </span>
                      </div>
                    </TableCell>

                    {/* TIS Column (Highlighted Glass Column) */}
                    <TableCell className="py-3 px-2.5 sm:px-3 text-center sm:text-left align-top sm:align-middle bg-white/[0.05] dark:bg-white/[0.03] border-l border-white/15 dark:border-white/10">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2">
                        <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-foreground text-background shadow-xs shrink-0 mt-0.5">
                          <RiCheckLine className="size-3 sm:size-3.5 stroke-[2.5]" aria-hidden />
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-foreground leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          {row.tisText}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Bottom CTA Action Row (All 3 columns guaranteed to remain aligned) */}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-4 px-3 sm:px-4" />
                  <TableCell className="py-4 px-2.5 sm:px-4 text-center align-middle">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full text-[11px] sm:text-xs font-display font-medium h-8 sm:h-9 opacity-40 cursor-not-allowed text-muted-foreground border-white/10"
                    >
                      <span>Fragile Streaks</span>
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 px-2.5 sm:px-4 text-center align-middle bg-white/[0.06] dark:bg-white/[0.04] border-l border-white/15 dark:border-white/10">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full text-[11px] sm:text-xs font-display font-semibold shadow-xs h-8 sm:h-9 active:scale-[0.98]"
                      onClick={() => onSelectPlan?.("The Improvement System")}
                    >
                      <span>Start My 90 Days</span>
                      <RiArrowRightLine className="size-3.5 ml-1 hidden sm:inline" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
