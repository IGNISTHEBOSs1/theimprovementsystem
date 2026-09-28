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
  kineticText: string;
};

// 4 high-signal, punchy comparison criteria (reduced basis for instant clarity on both mobile and PC)
const comparisons: ComparisonRow[] = [
  {
    basis: "When life happens (missed day)",
    subBasis: "Illness, late flights, emergencies",
    otherText: "Resets streak to Day 0 (guilt & churn)",
    kineticText: "±10% trajectory buffer absorbs it (vector unbroken)",
  },
  {
    basis: "Daily task load",
    subBasis: "Cognitive overhead & willpower",
    otherText: "Endless 15–20 item checklist overwhelm",
    kineticText: "Strict 1 Focus + 2 Routines (<2 min execution)",
  },
  {
    basis: "Core metric of progress",
    subBasis: "Static count vs dynamic vector",
    otherText: "Static binary streak counters & badges",
    kineticText: "Dynamic 90-day trajectory & velocity index",
  },
  {
    basis: "Privacy & cost",
    subBasis: "Data sovereignty & paywalls",
    otherText: "Paywalled streaks & cloud data harvesting",
    kineticText: "100% Free forever & local encrypted vault",
  },
];

interface ComparisonTableProps {
  onSelectPlan?: (planName: string) => void;
}

export default function ComparisonTable({ onSelectPlan }: ComparisonTableProps) {
  const [mobileTab, setMobileTab] = React.useState<"kinetic" | "other">("kinetic");

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
              Streaks are static counters that shatter at the first interruption. Kinetic prioritizes Trajectory—a dynamic, velocity-driven engine with a ±10% buffer that absorbs life's volatility.
            </span>
            <span className="sm:hidden">
              Streaks are static; trajectory is dynamic. Our ±10% buffer absorbs life so your vector continues.
            </span>
          </p>
        </div>

        {/* ── MOBILE VIEW: SIDE-BY-SIDE TICK & CROSS COMPARISON ── */}
        <div className="block sm:hidden">
          {/* Header Legend */}
          <div className="grid grid-cols-2 gap-2 mb-3 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-display text-muted-foreground">
              <span className="flex size-4 items-center justify-center rounded bg-muted/80 text-muted-foreground shrink-0 shadow-xs">
                <RiCloseLine className="size-3" aria-hidden />
              </span>
              <span>Conventional Apps</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-foreground">
              <span className="flex size-4 items-center justify-center rounded bg-foreground text-background shrink-0 shadow-xs">
                <RiCheckLine className="size-3 stroke-[2.5]" aria-hidden />
              </span>
              <span>Kinetic</span>
            </div>
          </div>

          {/* Mobile Comparison Cards with Side-by-Side Tick & Cross */}
          <div className="space-y-3">
            {comparisons.map((row) => (
              <div
                key={row.basis}
                className="p-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/[0.04] dark:bg-zinc-900/40 backdrop-blur-xl shadow-lg kinetic-specular-box"
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10 dark:border-white/5">
                  <span className="font-semibold text-xs text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    {row.basis}
                  </span>
                  {row.subBasis && (
                    <span className="text-[9px] text-muted-foreground font-tech-mono">
                      {row.subBasis}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Conventional Apps: Cross ✗ */}
                  <div className="p-2.5 rounded-xl border border-white/10 dark:border-white/5 bg-black/[0.03] dark:bg-zinc-950/40 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-4 items-center justify-center rounded bg-muted text-muted-foreground shrink-0 shadow-xs">
                        <RiCloseLine className="size-3" aria-hidden />
                      </span>
                      <span className="text-[10px] font-tech-mono text-muted-foreground">
                        Static Streaks
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-snug">
                      {row.otherText}
                    </span>
                  </div>

                  {/* Kinetic: Tick ✓ */}
                  <div className="p-2.5 rounded-xl border border-white/25 dark:border-white/15 bg-white/[0.08] dark:bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-4 items-center justify-center rounded bg-foreground text-background shrink-0 shadow-xs">
                        <RiCheckLine className="size-3 stroke-[2.5]" aria-hidden />
                      </span>
                      <span className="text-[10px] font-tech-mono font-bold text-foreground">
                        Trajectory Engine
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-foreground leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      {row.kineticText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-5">
            <Button
              size="sm"
              variant="default"
              data-cuelume-press="press"
              data-cuelume-release="release"
              data-cuelume-hover="tick"
              className="w-full text-xs font-display font-semibold shadow-md h-10 active:scale-[0.98] rounded-xl group"
              onClick={() => onSelectPlan?.("Kinetic")}
            >
              <span>Start My 90 Days</span>
              <RiArrowRightLine className="size-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* ── DESKTOP VIEW: CLEAN 3-COLUMN SIDE-BY-SIDE MATRIX (LIQUID FROSTED GLASS) ── */}
        <div className="hidden sm:block relative">
          <div className="overflow-x-auto rounded-2xl md:rounded-3xl border border-white/20 dark:border-white/15 bg-white/[0.03] dark:bg-zinc-950/35 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.35)] kinetic-specular-box transition-all duration-300">
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
                        Static Streaks
                      </span>
                    </div>
                  </TableHead>

                  {/* Right Column: Kinetic */}
                  <TableHead className="w-[31%] border-b border-white/15 dark:border-white/10 text-center align-bottom p-3.5 sm:p-4 bg-white/[0.06] dark:bg-white/[0.04] border-l border-white/15 dark:border-white/10">
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-1 rounded-xl bg-card/80 border border-white/20 shadow-xs backdrop-blur-md">
                        <SystemLogo size={24} />
                      </div>
                      <span className="text-xs sm:text-sm font-display font-bold text-foreground">
                        Kinetic
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-foreground text-background">
                        Trajectory Engine
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

                    {/* Kinetic Column (Highlighted Glass Column) */}
                    <TableCell className="py-3 px-2.5 sm:px-3 text-center sm:text-left align-top sm:align-middle bg-white/[0.05] dark:bg-white/[0.03] border-l border-white/15 dark:border-white/10">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2">
                        <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-foreground text-background shadow-xs shrink-0 mt-0.5">
                          <RiCheckLine className="size-3 sm:size-3.5 stroke-[2.5]" aria-hidden />
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-foreground leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          {row.kineticText}
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
                      <span>Static Streaks</span>
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 px-2.5 sm:px-4 text-center align-middle bg-white/[0.06] dark:bg-white/[0.04] border-l border-white/15 dark:border-white/10">
                    <Button
                      size="sm"
                      variant="default"
                      data-cuelume-press="press"
                      data-cuelume-release="release"
                      data-cuelume-hover="tick"
                      className="w-full text-[11px] sm:text-xs font-display font-semibold shadow-xs h-8 sm:h-9 active:scale-[0.98] group"
                      onClick={() => onSelectPlan?.("Kinetic")}
                    >
                      <span>Start My 90 Days</span>
                      <RiArrowRightLine className="size-3.5 ml-1 hidden sm:inline transition-transform duration-200 group-hover:translate-x-1" />
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
