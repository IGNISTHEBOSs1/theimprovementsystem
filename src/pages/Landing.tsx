import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Target,
  ArrowRight,
  Brain,
  TrendingUp,
  Activity,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
  X,
  ChevronRight,
  Lock,
  Compass,
  Menu,
  Clock,
  Database,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';

// ── DATA: The Three Core Principles of TIS (6th-Grade Reading Level) ──
const principles = [
  {
    step: '01',
    eyebrow: 'DAILY CLARITY',
    title: 'One Focus Each Day',
    desc: 'Pick your single most important win every morning. Finish it first. Never drown in 20-item to-do lists again.',
    tag: 'Zero Overwhelm',
    metric: '1 Focus / Day',
  },
  {
    step: '02',
    eyebrow: 'HABIT STABILITY',
    title: 'Two Supporting Routines',
    desc: 'Pair your focus with two simple habits. They keep your daily rhythm steady without draining your willpower.',
    tag: 'Daily Cadence',
    metric: '2 Routines Cap',
  },
  {
    step: '03',
    eyebrow: 'RESILIENT PROGRESS',
    title: 'The ±10% Buffer Cone',
    desc: 'Sick days and busy travels happen. Our buffer absorbs off-days so your 90-day momentum never restarts at zero.',
    tag: 'No Broken Streaks',
    metric: '±10% Safety Buffer',
  },
];

// ── DATA: Side-by-Side Architectural Comparison (Clear, Simple Copy) ──
const comparisonFeatures = [
  {
    dimension: 'Streak Policy',
    otherTitle: 'Rigid 100% Streaks',
    otherDesc: 'Miss one day to illness or travel, and your streak resets to zero. Causes guilt and makes you quit.',
    tisTitle: 'The ±10% Buffer Cone',
    tisDesc: 'Life has bumps. Your safety buffer safely absorbs off-days so your 90-day progress stays unbroken.',
  },
  {
    dimension: 'Daily Task Load',
    otherTitle: '20+ Item To-Do Lists',
    otherDesc: 'Endless task backlogs swell constantly. You spend more time sorting tasks than doing real work.',
    tisTitle: '1 Focus + 2 Routines',
    tisDesc: 'Strict cap on daily work. High clarity, zero decision fatigue, and guaranteed follow-through.',
  },
  {
    dimension: 'Motivation & Rewards',
    otherTitle: 'Casino Confetti & Fake Badges',
    otherDesc: 'Loud cartoon bells, fake XP, and nagging red dots designed to keep you glued to your phone.',
    tisTitle: 'Quiet Math & Real Evidence',
    tisDesc: 'Calm velocity curves and verifiable completion history. Built for focused adults who value results.',
  },
  {
    dimension: 'Privacy & Ownership',
    otherTitle: 'Cloud Lock-in & Ad Profiling',
    otherDesc: 'Needs constant internet, tracks your personal habits for advertisers, and locks data in proprietary silos.',
    tisTitle: '100% Private & Offline-First',
    tisDesc: 'Works completely offline. Your focus data stays securely on your device with client-side encryption.',
  },
];

// ── DATA: Instrument Suite Console Tabs ──
const instruments = [
  {
    id: 'trajectory',
    name: 'Trajectory Horizon',
    icon: TrendingUp,
    badge: 'PREDICTIVE MATH',
    summary: 'Calculates your true velocity against your 90-day target horizon.',
  },
  {
    id: 'mentor',
    name: 'Diagnostic Mentor',
    icon: Brain,
    badge: 'QUIET GUIDANCE',
    summary: 'Offers calm, evidence-based feedback without generic motivational fluff.',
  },
  {
    id: 'buffer',
    name: 'Pace Buffer',
    icon: Compass,
    badge: 'PACE STABILITY',
    summary: 'Protects you from both burnout sprints and drifting off track.',
  },
  {
    id: 'vault',
    name: 'Local-First Vault',
    icon: Lock,
    badge: 'ZERO TRACKING',
    summary: 'Keeps 100% of your personal habits offline with end-to-end encryption.',
  },
];

// ── AMBIENT LIVE MOTION BACKGROUND (GPU-ACCELERATED & ACCESSIBLE) ──
function LiveMotionBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Precision Trajectory Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Floating Ambient Light 1: Primary Emerald Field */}
      <motion.div
        className="absolute -top-28 -left-20 w-[380px] sm:w-[580px] h-[380px] sm:h-[580px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/12 blur-[90px] sm:blur-[130px] will-change-transform"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 45, 15, 0],
                y: [0, 35, -15, 0],
                scale: [1, 1.06, 0.96, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Ambient Light 2: Teal Trajectory Field */}
      <motion.div
        className="absolute top-1/3 -right-24 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full bg-teal-500/8 dark:bg-teal-500/10 blur-[100px] sm:blur-[140px] will-change-transform"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -50, -15, 0],
                y: [0, 40, 15, 0],
                scale: [1, 0.95, 1.05, 1],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Ambient Light 3: Lower Horizon Field */}
      <motion.div
        className="absolute -bottom-24 left-1/4 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-emerald-600/6 dark:bg-emerald-600/8 blur-[90px] sm:blur-[120px] will-change-transform"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 30, -30, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.04, 0.95, 1],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  // Navigation & Interactive States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consistency, setConsistency] = useState<number>(86);
  const [focusDone, setFocusDone] = useState<boolean>(true);
  const [routine1Done, setRoutine1Done] = useState<boolean>(true);
  const [routine2Done, setRoutine2Done] = useState<boolean>(false);
  const [activeComparisonTab, setActiveComparisonTab] = useState<'sideBySide' | 'other' | 'tis'>('sideBySide');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('trajectory');

  // Calculations for Simulator
  const completedCount = (focusDone ? 1 : 0) + (routine1Done ? 1 : 0) + (routine2Done ? 1 : 0);
  const dailyBoost = (focusDone ? 6 : 0) + (routine1Done ? 2 : 0) + (routine2Done ? 2 : 0);
  const effectiveConsistency = Math.min(100, Math.max(50, consistency + dailyBoost));
  const velocity = (effectiveConsistency / 80).toFixed(2);
  const velocityNum = parseFloat(velocity);
  const isAhead = velocityNum >= 1.05;
  const isInBuffer = velocityNum >= 0.95 && velocityNum < 1.05;
  const daysSaved = Math.max(1, Math.round(((effectiveConsistency - 50) / 50) * 28));

  // Precise SVG Trajectory Coordinates (Fixed 360 x 170 coordinate plane)
  const startX = 24;
  const startY = 135;
  const endX = 336;
  const targetY = 32;
  const actualY = Math.round(startY - ((effectiveConsistency - 45) / 55) * (startY - targetY));
  const actualControlY = Math.round((startY + actualY) / 2 + 6);
  const plannedPath = `M ${startX},${startY} Q 180,82 ${endX},${targetY}`;
  const actualPath = `M ${startX},${startY} Q 180,${actualControlY} ${endX},${actualY}`;
  const bufferUpper = `M ${startX},${startY - 6} Q 180,68 ${endX},${targetY - 14}`;
  const bufferLower = `M ${startX},${startY + 6} Q 180,98 ${endX},${targetY + 14}`;
  const bufferPolygon = `M ${startX},${startY} Q 180,68 ${endX},${targetY - 14} L ${endX},${targetY + 14} Q 180,98 ${startX},${startY} Z`;

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* ── LIVE MOTION BACKGROUND ── */}
      <LiveMotionBackground />

      {/* ── ENFORCED LIQUID GLASS TOP NAVBAR ── */}
      <header className="sticky top-0 z-50 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 liquid-glass-nav transition-all duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Identity (TIS Canonical) */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shrink-0">
              <SystemLogo size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground uppercase truncate">
                  The Improvement System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TRAJECTORY ENGINE
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider hidden md:block">
                QUIET PERSONAL FOCUS • NO GIMMICKS
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <button
              type="button"
              onClick={() => scrollToSection('method')}
              className="hover:text-foreground transition-colors py-1 touch-target"
            >
              The Method
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('comparison')}
              className="hover:text-foreground transition-colors py-1 touch-target"
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('simulator')}
              className="hover:text-foreground transition-colors py-1 touch-target"
            >
              Simulator
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('instruments')}
              className="hover:text-foreground transition-colors py-1 touch-target"
            >
              Instruments
            </button>
          </nav>

          {/* Action Row */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-2.5 sm:px-3 touch-target"
            >
              Sign In
            </Button>
            <Button
              variant="neon"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs px-3 sm:px-3.5 py-1.5 font-display font-medium shadow-sm hover:shadow-emerald-500/20 touch-target"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted/50 touch-target"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Liquid Glass Styling */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-3 pt-3 border-t border-border/60 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('method')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Target className="size-3.5 text-emerald-400" />
                  <span>The Method</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('comparison')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Shield className="size-3.5 text-emerald-400" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('simulator')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Activity className="size-3.5 text-emerald-400" />
                  <span>Simulator</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('instruments')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Sliders className="size-3.5 text-emerald-400" />
                  <span>Instruments</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── TIER 1: HERO SECTION (<3s Comprehension, 6th-Grade Reading Level) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-14 sm:pt-14 sm:pb-20 md:pt-16 md:pb-24">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-4 shadow-sm"
          >
            <Sparkles className="size-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono font-medium text-emerald-300 tracking-wide uppercase">
              QUIET TRAJECTORY ENGINE • NO RIGID STREAKS
            </span>
          </motion.div>

          {/* Crisp Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] mb-4 text-foreground"
          >
            One focus a day.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              A buffer that protects your streak.
            </span>
          </motion.h1>

          {/* 6th-Grade Reading Level Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Most habit apps reset your streak to zero if you get sick or have a busy day.
            The Improvement System is different: commit to 1 daily focus and 2 routines.
            Our ±10% buffer absorbs life&apos;s bumps so your 90-day progress never dies.
          </motion.p>

          {/* 3-Second Core Pillars Pill Strip (Instant Scanning) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto mb-7 text-left sm:text-center"
          >
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <span className="font-mono text-emerald-400 font-bold text-xs uppercase">1 Primary Focus</span>
              <span className="text-[11px] text-muted-foreground">No messy to-do lists</span>
            </div>
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 backdrop-blur-sm">
              <span className="font-mono text-emerald-400 font-bold text-xs uppercase">±10% Buffer Cone</span>
              <span className="text-[11px] text-muted-foreground">Sick days won&apos;t kill streaks</span>
            </div>
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <span className="font-mono text-emerald-400 font-bold text-xs uppercase">Quiet Math</span>
              <span className="text-[11px] text-muted-foreground">Real evidence, no fake XP</span>
            </div>
          </motion.div>

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              variant="neon"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-7 py-5 font-display text-sm sm:text-base font-semibold shadow-lg shadow-emerald-500/15 touch-target"
            >
              <span>Start Your System</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => scrollToSection('comparison')}
              className="w-full sm:w-auto px-6 py-5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/70 hover:border-border touch-target"
            >
              <span>See Side-by-Side</span>
              <ChevronRight className="size-4 ml-1 opacity-60" />
            </Button>
          </motion.div>
        </div>

        {/* ── TIER 1 PROOF: INTERACTIVE TRAJECTORY & FOCUS SIMULATOR ── */}
        <motion.div
          id="simulator"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative max-w-4xl mx-auto scroll-mt-20"
        >
          {/* Liquid Glass Outer Frame */}
          <div className="relative rounded-2xl md:rounded-3xl border border-white/10 liquid-glass-card p-4 sm:p-6 md:p-8 shadow-2xl overflow-hidden">
            {/* Top specular highlight line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Header of the Simulator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="size-9 sm:size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Activity className="size-4 sm:size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground">
                      LIVE TRAJECTORY SIMULATOR
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      INTERACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                    Test how daily focus and execution rates reshape your 90-day progress
                  </p>
                </div>
              </div>

              {/* Dynamic Status Metric */}
              <div className="flex items-center gap-3 bg-background/60 border border-border/70 rounded-xl px-3 py-1.5">
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                    Velocity Index
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-foreground flex items-center justify-end gap-1.5">
                    <span className={isAhead ? 'text-emerald-400' : isInBuffer ? 'text-amber-400' : 'text-rose-400'}>
                      {velocity}x
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {isAhead ? 'AHEAD' : isInBuffer ? 'IN BUFFER' : 'RECALIBRATE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid: Visual Curve Left, Interactive Daily Anchor Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
              {/* Left Column: Trajectory Curve + Execution Rate Slider */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* SVG Visualizer */}
                <div className="relative rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono text-muted-foreground mb-2 gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      Live Trajectory
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
                      ±10% Buffer Cone
                    </span>
                    <span className="hidden sm:inline">90-Day Target</span>
                  </div>

                  {/* SVG Canvas with Proportional ViewBox (360x170) */}
                  <div className="relative h-40 sm:h-44 w-full">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 360 170"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="tisCurveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="tisBufferConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.16" />
                        </linearGradient>
                      </defs>

                      {/* Horizon & Coordinate Guidelines */}
                      <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                      <line x1={startX} y1="80" x2={endX} y2="80" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                      <line x1={startX} y1={targetY} x2={endX} y2={targetY} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />

                      {/* Buffer Area (±10% cone) */}
                      <path d={bufferPolygon} fill="url(#tisBufferConeGrad)" />
                      <path d={bufferUpper} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />
                      <path d={bufferLower} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />

                      {/* Planned Ideal Baseline */}
                      <path d={plannedPath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4" />

                      {/* Dynamic Actual Curve reacting to inputs */}
                      <path
                        d={actualPath}
                        fill="none"
                        stroke="url(#tisCurveGradient)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />

                      {/* Current Node Marker */}
                      <circle
                        cx={endX}
                        cy={actualY}
                        r="5"
                        fill="#10b981"
                        className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      />
                    </svg>

                    {/* Dynamic Status Badge */}
                    <div className="absolute right-2 top-2 px-2 py-1 rounded-md bg-background/85 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
                      {isAhead ? `+${daysSaved} Days Margin` : isInBuffer ? 'Protected by Buffer' : 'Recalibrate Pace'}
                    </div>
                  </div>
                </div>

                {/* Execution Rate Slider with 1-Tap Presets */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-background/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-emerald-400" />
                      Deliberate Execution Rate
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {consistency}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={consistency}
                    onChange={(e) => setConsistency(parseInt(e.target.value))}
                    aria-label="Deliberate Execution Rate Simulator Slider"
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg appearance-none touch-target"
                  />

                  {/* 1-Tap Preset Quick Buttons for Mobile & Desktop */}
                  <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setConsistency(65)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-colors touch-target ${
                        consistency <= 70
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                          : 'border-border/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      65% Slipping
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsistency(85)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-colors touch-target ${
                        consistency > 70 && consistency <= 88
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'border-border/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      85% Target Pace
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsistency(96)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-colors touch-target ${
                        consistency > 88
                          ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                          : 'border-border/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      96% Peak Horizon
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Tactile Daily Anchor Console (All Items Fully Interactive) */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                <div className="p-4 rounded-xl border border-border/80 bg-background/80 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-emerald-400" />
                      <span className="font-display font-semibold text-xs text-foreground tracking-wide uppercase">
                        TODAY&apos;S ANCHOR (1 FOCUS + 2 ROUTINES)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusDone(false);
                        setRoutine1Done(false);
                        setRoutine2Done(false);
                      }}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors touch-target"
                      title="Reset Daily Simulator"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                  </div>

                  {/* Primary Focus Card (Interactive Click) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFocusDone(!focusDone)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFocusDone(!focusDone);
                      }
                    }}
                    className={`mt-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                      focusDone
                        ? 'border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/5'
                        : 'border-border/80 bg-card hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-6 rounded-lg border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0 ${
                          focusDone
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'border-border/80 bg-background/60 text-transparent hover:border-emerald-500/50'
                        }`}
                      >
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                            PRIMARY FOCUS
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {focusDone ? 'COMPLETED' : 'ANCHOR'}
                          </span>
                        </div>
                        <p
                          className={`text-xs sm:text-sm font-medium mt-1 leading-snug transition-colors ${
                            focusDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          Ship core engine architecture & buffer specs
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Two Routines (Both Fully Interactive) */}
                  <div className="space-y-2 mt-2.5">
                    {/* Routine 1 */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setRoutine1Done(!routine1Done)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setRoutine1Done(!routine1Done);
                        }
                      }}
                      className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                        routine1Done
                          ? 'border-emerald-500/30 bg-card/60'
                          : 'border-border/60 bg-card/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            routine1Done
                              ? 'border-emerald-500/40 bg-emerald-500 text-white'
                              : 'border-border bg-background'
                          }`}
                        >
                          {routine1Done && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs truncate transition-colors ${
                            routine1Done ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}
                        >
                          45m Deep Reading
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400/80 shrink-0 ml-2">ROUTINE 1</span>
                    </div>

                    {/* Routine 2 */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setRoutine2Done(!routine2Done)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setRoutine2Done(!routine2Done);
                        }
                      }}
                      className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                        routine2Done
                          ? 'border-emerald-500/30 bg-card/60'
                          : 'border-border/60 bg-card/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            routine2Done
                              ? 'border-emerald-500/40 bg-emerald-500 text-white'
                              : 'border-border bg-background'
                          }`}
                        >
                          {routine2Done && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs truncate transition-colors ${
                            routine2Done ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}
                        >
                          Evening Trajectory Review
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">ROUTINE 2</span>
                    </div>
                  </div>

                  {/* Daily Cadence Progress Meter */}
                  <div className="mt-3.5 pt-3 border-t border-border/40">
                    <div className="flex justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-muted-foreground">Daily Cadence Status</span>
                      <span className="text-emerald-400 font-bold">
                        {completedCount === 3
                          ? '100% (Protected)'
                          : completedCount === 2
                          ? '66% (In Buffer)'
                          : completedCount === 1
                          ? '33% (Building Momentum)'
                          : '0% (Anchor Pending)'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${(completedCount / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                  <p className="text-[11px] text-muted-foreground">
                    💡 Click any daily item above to see the trajectory curve adjust in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── METRICS TELEMETRY STRIP ── */}
      <section className="relative z-10 border-y border-border/60 bg-card/30 backdrop-blur-md py-5 sm:py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">1 Focus</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">
                Daily Commitment Cap
              </p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-emerald-400">±10%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">
                Resilience Buffer
              </p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">90 Days</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">
                Trajectory Horizon
              </p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">100%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">
                Private & Offline-First
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIER 2: SIDE-BY-SIDE ARCHITECTURAL COMPARISON ── */}
      <section id="comparison" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
            THE ARCHITECTURAL DIFFERENCE
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 tracking-tight">
            Why Typical Habit Apps Fail You
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            Rigid streaks create anxiety and guilt. See how mathematical buffers keep you moving forward when life gets busy.
          </p>

          {/* Mobile Switcher (Allows quick 1-tap view on small screens) */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-6 p-1 rounded-xl border border-border/80 bg-background/80 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setActiveComparisonTab('sideBySide')}
              className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-colors touch-target ${
                activeComparisonTab === 'sideBySide'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setActiveComparisonTab('other')}
              className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-colors touch-target ${
                activeComparisonTab === 'other'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Other Apps
            </button>
            <button
              type="button"
              onClick={() => setActiveComparisonTab('tis')}
              className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-colors touch-target ${
                activeComparisonTab === 'tis'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              The System
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Column 1: Typical Habit Apps */}
          <div
            className={`rounded-2xl border border-rose-500/25 bg-rose-500/[0.02] dark:bg-rose-950/10 p-5 sm:p-7 backdrop-blur-xl flex flex-col justify-between shadow-sm ${
              activeComparisonTab === 'tis' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <X className="size-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      Standard Habit Apps
                    </h3>
                    <p className="text-[10px] font-mono text-rose-400">FRAGILE & GUILT-DRIVEN</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  THE CHURN TRAP
                </span>
              </div>

              <div className="space-y-3.5">
                {comparisonFeatures.map((item, index) => (
                  <div key={index} className="p-3.5 rounded-xl border border-border/60 bg-background/60">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      {item.dimension}
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400 font-display font-semibold text-xs mb-1">
                      <X className="size-3.5 shrink-0 stroke-[2.5]" />
                      <span>{item.otherTitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.otherDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-500/15 text-[11px] font-mono text-rose-400/80 text-center">
              Result: 92% of users quit within 30 days due to broken streaks.
            </div>
          </div>

          {/* Column 2: The Improvement System */}
          <div
            className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-950/20 p-5 sm:p-7 backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden ${
              activeComparisonTab === 'other' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Top highlight bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      The Improvement System
                    </h3>
                    <p className="text-[10px] font-mono text-emerald-400">MATHEMATICALLY RESILIENT</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-3.5">
                {comparisonFeatures.map((item, index) => (
                  <div key={index} className="p-3.5 rounded-xl border border-emerald-500/30 bg-card/60 shadow-sm">
                    <div className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider mb-1">
                      {item.dimension}
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-display font-semibold text-xs mb-1">
                      <Check className="size-3.5 shrink-0 stroke-[3]" />
                      <span>{item.tisTitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.tisDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-400 text-center font-medium">
              Result: Lifelong momentum that compounds quietly through busy seasons.
            </div>
          </div>
        </div>
      </section>

      {/* ── TIER 3: THE 3-STEP PROGRESSION METHODOLOGY ── */}
      <section id="method" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            HOW IT WORKS
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Three Steps to Quiet Follow-Through
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            Eliminate decision fatigue with three simple operating rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p, index) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group relative rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-7 backdrop-blur-xl shadow-lg hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/40 transition-colors" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                    {p.step}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {p.tag}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  {p.eyebrow}
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-2 leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Operating Rule</span>
                <span className="text-emerald-400 font-semibold">{p.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TIER 4: INTERACTIVE INSTRUMENT CONSOLE (HIERARCHY REPLACING BENTO SCROLL) ── */}
      <section id="instruments" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            PRECISION TOOLING
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Instrument Cluster
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            Explore the four core modules designed for calm, distraction-free execution.
          </p>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-3xl mx-auto">
          {instruments.map((inst) => {
            const Icon = inst.icon;
            const isSelected = selectedInstrument === inst.id;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => setSelectedInstrument(inst.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 touch-target ${
                  isSelected
                    ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm font-semibold'
                    : 'border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/70'
                }`}
              >
                <Icon className={`size-3.5 ${isSelected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                <span>{inst.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Instrument Cockpit Display */}
        <div className="max-w-4xl mx-auto rounded-2xl md:rounded-3xl border border-border/80 liquid-glass-card p-5 sm:p-8 shadow-xl">
          {selectedInstrument === 'trajectory' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      PREDICTIVE HORIZON
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Trajectory Horizon Modeling
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  90-Day Vector
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Rather than demanding 100% daily perfection, the system calculates velocity against your 90-day target. At an 85% execution rate, you still finish comfortably ahead of schedule.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Completion Target</span>
                  <p className="font-mono font-bold text-sm text-foreground mt-1">90 Days</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Fixed Horizon</p>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Buffer Tolerance</span>
                  <p className="font-mono font-bold text-sm text-emerald-400 mt-1">±10% Range</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Elastic buffer</p>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Current Velocity</span>
                  <p className="font-mono font-bold text-sm text-foreground mt-1">{velocity}x</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Ahead of baseline</p>
                </div>
              </div>
            </div>
          )}

          {selectedInstrument === 'mentor' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Brain className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      CALM REASONING
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      The Diagnostic Mentor
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Fluff
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Objective feedback strictly grounded in your logged completion evidence. No cheesy quotes, no guilt-tripping, and no notification spam.
              </p>

              <div className="p-4 rounded-xl border border-border/80 bg-background/80 font-mono text-xs space-y-2 text-muted-foreground">
                <div className="text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  &gt; TELEMETRY LOG #084 • ANALYSIS COMPLETE
                </div>
                <div className="pl-4 border-l border-border/60 space-y-1">
                  <div>Status: Inside Resilience Buffer</div>
                  <div>Variance: -1.2% (Normal week-to-week fluctuation)</div>
                  <div className="text-foreground pt-1">&gt; Recommendation: Keep your 1 primary focus today. Do not overcompensate.</div>
                </div>
              </div>
            </div>
          )}

          {selectedInstrument === 'buffer' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Compass className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      PACE STABILITY
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Pace Buffer Guidance
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Anti-Burnout
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Prevents both overexertion and drift. The system keeps you operating in your sweet spot so you build lifelong follow-through without burning out.
              </p>

              <div className="p-4 rounded-xl border border-border/70 bg-background/80 space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Cadence Stability Rating</span>
                  <span className="text-emerald-400 font-bold">Optimal (94%)</span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-1">
                  <span>Under-recovery Risk: Low</span>
                  <span>Overexertion Risk: Zero</span>
                </div>
              </div>
            </div>
          )}

          {selectedInstrument === 'vault' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      PRIVACY FIRST
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Local-First Encrypted Vault
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Offline
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your goals and focus habits are deeply personal. The Improvement System works completely offline with client-side persistence and end-to-end sync encryption. No ad trackers, no profiling, and zero data selling.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Database className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-medium text-foreground">Local SQLite / IndexedDB</p>
                    <p className="text-[10px] text-muted-foreground">Device persistence</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Shield className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-medium text-foreground">Client Encryption</p>
                    <p className="text-[10px] text-muted-foreground">Zero-knowledge keys</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Zap className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-medium text-foreground">Zero Third-Party Pixels</p>
                    <p className="text-[10px] text-muted-foreground">No ad network beacons</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TIER 5: FINAL CALL TO ACTION (LIQUID GLASS DOCK) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-7 sm:p-12 md:p-14 text-center border border-emerald-500/30 liquid-glass-card shadow-2xl overflow-hidden"
        >
          {/* Edge illumination */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
              INITIALIZE YOUR SYSTEM
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 mb-3 leading-tight">
              One focus today.
              <br />
              <span className="text-emerald-400">Compounding evidence forever.</span>
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mb-8 leading-relaxed">
              Step away from the endless to-do churn. Commit to 1 daily focus, protect your buffer, and build an unbreakable record of growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="neon"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-5 font-display text-sm sm:text-base font-semibold shadow-lg shadow-emerald-500/20 touch-target"
              >
                <span>Enter The System</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/80 touch-target"
              >
                <span>Open Telemetry Demo</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-muted-foreground/80 mt-6 pt-4 border-t border-border/40">
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-400" />
                Instant Setup
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-400" />
                No Credit Card Required
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-emerald-400" />
                Under 2 Minutes Daily
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MINIMALIST FOOTER ── */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SystemLogo size={28} />
            <div>
              <span className="font-display font-semibold text-sm text-foreground">
                The Improvement System
              </span>
              <p className="text-[10px] text-muted-foreground font-mono">
                Personal Trajectory Engine • Quiet Follow-Through
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-muted-foreground">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors touch-target"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="hover:text-foreground transition-colors touch-target"
            >
              Telemetry Dashboard
            </button>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-muted-foreground/60">© 2026 The Improvement System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
