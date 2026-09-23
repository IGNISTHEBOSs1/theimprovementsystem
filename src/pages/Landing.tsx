import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Target,
  ArrowRight,
  Activity,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Play,
  Pause,
  MousePointer,
  Layers,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';
import ComparisonTable from '@/components/ui/comparison-table';

// ── MONOCHROMATIC AMBIENT BACKGROUND (QUIET WAVES, ZERO GREEN, ZERO SWIPING BALLS) ──
function MonochromaticMeshBackground() {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    const render = () => {
      time += 0.004;
      ctx.clearRect(0, 0, width, height);

      // Monochromatic wave lines (Zinc & pure white opacities)
      const waveLines = [
        { amp: 26, freq: 0.0014, speed: 0.8, color: 'rgba(255, 255, 255, 0.04)', yOffset: height * 0.46, lineWidth: 1.2 },
        { amp: 34, freq: 0.0011, speed: 0.6, color: 'rgba(255, 255, 255, 0.03)', yOffset: height * 0.56, lineWidth: 1.4 },
        { amp: 22, freq: 0.0018, speed: 1.0, color: 'rgba(255, 255, 255, 0.025)', yOffset: height * 0.66, lineWidth: 1.0 },
      ];

      waveLines.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        for (let x = 0; x <= width; x += 8) {
          const mouseDist = Math.hypot(x / width - mousePos.x, wave.yOffset / height - mousePos.y);
          const mouseInfluence = Math.max(0, 1 - mouseDist * 2.5) * 16;
          const y =
            wave.yOffset +
            Math.sin(x * wave.freq + time * wave.speed) * wave.amp +
            Math.cos(x * wave.freq * 0.5 + time * 0.5) * 8 +
            mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldReduceMotion, mousePos.x, mousePos.y]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Precision Trajectory Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0.1) 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0.1) 85%)',
        }}
      />

      {/* Kinetic Monochromatic Canvas */}
      {!shouldReduceMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
      )}

      {/* Monochromatic Diffusions */}
      <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-white/[0.02] dark:bg-white/[0.03] blur-[140px]" />
      <div className="absolute top-1/2 -right-32 w-[440px] h-[440px] rounded-full bg-zinc-800/10 dark:bg-zinc-700/10 blur-[150px]" />
      <div className="absolute -bottom-32 left-1/3 w-[420px] h-[420px] rounded-full bg-white/[0.015] dark:bg-white/[0.025] blur-[140px]" />
    </div>
  );
}

// ── THE THREE PILLARS (CONCISE, ≤3 LINES, PUNCHY CADENCE) ──
const principles = [
  {
    step: '01',
    eyebrow: 'DAILY CLARITY',
    title: 'One Focus Each Day',
    shortLabel: 'Focus',
    desc: 'Pick your single highest-leverage task each morning. Finish it first, free of endless 20-item backlog overwhelm.',
    metric: '1 Focus / Day',
    rule: 'Zero Backlog Overload',
    icon: Target,
  },
  {
    step: '02',
    eyebrow: 'HABIT STABILITY',
    title: 'Two Supporting Routines',
    shortLabel: 'Routines',
    desc: 'Anchor two lightweight companion habits that maintain your daily baseline without exhausting your willpower.',
    metric: '2 Routines Cap',
    rule: 'Protected Willpower',
    icon: Layers,
  },
  {
    step: '03',
    eyebrow: 'RESILIENT PROGRESS',
    title: 'The ±10% Buffer Cone',
    shortLabel: 'Buffer',
    desc: 'Illness and busy travels happen. Our mathematical buffer safely absorbs off-days so your 90-day progress never dies.',
    metric: '±10% Safety Buffer',
    rule: 'No Broken Streaks',
    icon: Compass,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  // Task Completion State for Live Trajectory Engine
  const [focusDone, setFocusDone] = useState<boolean>(true);
  const [routine1Done, setRoutine1Done] = useState<boolean>(true);
  const [routine2Done, setRoutine2Done] = useState<boolean>(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Video Sneak Peek Walkthrough Engine
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState<boolean>(true);
  const [walkthroughStep, setWalkthroughStep] = useState<number>(0);
  const [videoElapsedSec, setVideoElapsedSec] = useState<number>(4);
  const [simCursorPos, setSimCursorPos] = useState({ x: 68, y: 34 });
  const [isClicking, setIsClicking] = useState<boolean>(false);

  // ── TRAJECTORY MATHEMATICS & SEAMLESS C1 CONTINUITY ──
  const completedCount = (focusDone ? 1 : 0) + (routine1Done ? 1 : 0) + (routine2Done ? 1 : 0);

  // Dynamic velocity index based on task thrust
  const todayScore = (focusDone ? 35 : 0) + (routine1Done ? 10 : 0) + (routine2Done ? 10 : 0) + 45;
  const velocityNum = parseFloat((todayScore / 80).toFixed(2));
  const velocity = velocityNum.toFixed(2);
  const isAhead = velocityNum >= 1.05;
  const isInBuffer = velocityNum >= 0.90 && velocityNum < 1.05;
  const daysMargin = focusDone
    ? routine1Done && routine2Done
      ? 16
      : routine1Done || routine2Done
      ? 11
      : 6
    : routine1Done || routine2Done
    ? 1
    : -4;

  // Coordinate Grid: 500 x 210
  const startX = 32;
  const startY = 166;
  const todayX = 220;
  const endX = 465;
  const targetHorizonY = 54;

  // Today's vertical position based on completed tasks
  const todayY = focusDone
    ? routine1Done && routine2Done
      ? 84
      : routine1Done || routine2Done
      ? 94
      : 104
    : routine1Done || routine2Done
    ? 118
    : 134;

  // Projected Day 90 endpoint
  const projectedEndY = focusDone
    ? routine1Done && routine2Done
      ? 28
      : routine1Done || routine2Done
      ? 40
      : 52
    : routine1Done || routine2Done
    ? 68
    : 86;

  // ── SEAMLESS C1 CONTINUOUS ATTACHMENT ──
  // The slope approaching Today is derived from the incoming vector from Day 28 (x=150, y=142) to (todayX, todayY).
  const inDx = todayX - 150; // 70
  const inDy = todayY - 142;
  const tangentSlope = inDy / inDx;
  const ctrlDx = 46;
  const ctrlDy = ctrlDx * tangentSlope;

  // Past Historical Curve (Day 1 -> Today)
  const historicalPath = `M ${startX},${startY} C ${startX + 50},${startY - 6} ${todayX - ctrlDx},${todayY - ctrlDy} ${todayX},${todayY}`;

  // Projected Trajectory Line (Today -> Day 90) starts EXACTLY from (todayX, todayY) with identical tangent
  const projectedPath = `M ${todayX},${todayY} C ${todayX + ctrlDx},${todayY + ctrlDy} ${endX - 55},${projectedEndY + 6} ${endX},${projectedEndY}`;

  // Elastic ±10% Buffer Cone starting EXACTLY at (todayX, todayY) with 0 width and expanding to Day 90
  const bufferUpperPath = `M ${todayX},${todayY} C ${todayX + ctrlDx},${todayY + ctrlDy - 8} ${endX - 55},${projectedEndY - 20} ${endX},${projectedEndY - 22}`;
  const bufferLowerPath = `M ${todayX},${todayY} C ${todayX + ctrlDx},${todayY + ctrlDy + 8} ${endX - 55},${projectedEndY + 20} ${endX},${projectedEndY + 22}`;
  const bufferPolygon = `M ${todayX},${todayY} C ${todayX + ctrlDx},${todayY + ctrlDy - 8} ${endX - 55},${projectedEndY - 20} ${endX},${projectedEndY - 22} L ${endX},${projectedEndY + 22} C ${endX - 55},${projectedEndY + 20} ${todayX + ctrlDx},${todayY + ctrlDy + 8} ${todayX},${todayY} Z`;

  // ── SNEAK PEEK AUTO-PLAYING SIMULATED MOUSE ENGINE ──
  const stepActions = useCallback((step: number) => {
    switch (step) {
      case 0:
        // Move to Primary Focus checkbox
        setSimCursorPos({ x: 60, y: 34 });
        setIsClicking(false);
        break;
      case 1:
        // Click Primary Focus
        setIsClicking(true);
        setFocusDone(true);
        break;
      case 2:
        // Move to Routine 1
        setIsClicking(false);
        setSimCursorPos({ x: 60, y: 54 });
        break;
      case 3:
        // Click Routine 1
        setIsClicking(true);
        setRoutine1Done(true);
        break;
      case 4:
        // Move to Trajectory graph node
        setIsClicking(false);
        setSimCursorPos({ x: 26, y: 46 });
        break;
      case 5:
        // Inspect the buffer cone
        setSimCursorPos({ x: 38, y: 32 });
        break;
      case 6:
        // Move to Routine 2
        setSimCursorPos({ x: 60, y: 70 });
        break;
      case 7:
        // Click Routine 2 to trigger peak momentum
        setIsClicking(true);
        setRoutine2Done(true);
        break;
      case 8:
        // Move along peak trajectory
        setIsClicking(false);
        setSimCursorPos({ x: 44, y: 22 });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (!isPlayingWalkthrough) return;
    const interval = setInterval(() => {
      setWalkthroughStep((prev) => {
        const next = (prev + 1) % 9;
        stepActions(next);
        setVideoElapsedSec(Math.round(((next + 1) / 9) * 16));
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlayingWalkthrough, stepActions]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground selection:bg-white/20 selection:text-white">
      {/* ── MONOCHROMATIC MESH BACKGROUND ── */}
      <MonochromaticMeshBackground />

      {/* ── MINIMAL TOP NAVBAR (NO SECTION TEXT LINKS) ── */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 md:px-8 py-3 liquid-glass-nav border-b border-border/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1 rounded-xl bg-card border border-border shadow-xs shrink-0">
              <SystemLogo size={26} />
            </div>
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground uppercase truncate">
                The Improvement System
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-tech-mono font-medium tracking-wider bg-muted text-muted-foreground border border-border">
                <span className="size-1.5 rounded-full bg-foreground" />
                LOCAL ENCLAVE
              </span>
            </div>
          </div>

          {/* Action Buttons Only */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 touch-target"
            >
              Sign In
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs px-3.5 py-1.5 font-display font-medium shadow-xs touch-target"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: CADENCE & SNEAK PEEK (<3s CLARITY, NO WALL OF TEXT) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 sm:pt-16 sm:pb-16 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/80 border border-border/80 mb-4 shadow-xs"
        >
          <Sparkles className="size-3.5 text-foreground shrink-0" />
          <span className="text-[11px] font-tech-mono font-medium text-foreground tracking-wider uppercase">
            Deterministic Personal Trajectory • Zero Rigid Streaks
          </span>
        </motion.div>

        {/* Crisp Headline with Editorial Font Contrast */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] mb-4 text-foreground max-w-3xl mx-auto"
        >
          One focus a day.{' '}
          <span className="font-serif-display italic font-normal text-muted-foreground block sm:inline">
            A buffer that protects your streak.
          </span>
        </motion.h1>

        {/* Strictly ≤ 3 Lines Subheading (Cadence, Clear, Concise) */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6"
        >
          Miss one day in typical habit apps, and your streak resets to zero. We give you 1 primary win, 2 routines, and a ±10% mathematical buffer so real life never kills your progress.
        </motion.p>

        {/* Primary CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <Button
            size="lg"
            variant="default"
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-7 py-5 font-display text-sm sm:text-base font-semibold shadow-md touch-target"
          >
            <span>Start Your System</span>
            <ArrowRight className="size-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              const el = document.getElementById('sneak-peek-frame');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-5 text-sm font-medium text-muted-foreground hover:text-foreground border-border touch-target"
          >
            <span>Watch Live Sneak Peek</span>
          </Button>
        </motion.div>

        {/* ── PRODUCT SNEAK PEEK VIDEO / CONSOLE (INTERACTIVE + SIMULATED MOUSE WALKTHROUGH) ── */}
        <motion.div
          id="sneak-peek-frame"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative max-w-5xl mx-auto text-left"
        >
          {/* Hardware Frame with Monochromatic Specular Rim */}
          <div className="relative rounded-2xl md:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden tis-specular-box">
            {/* Top Bar: Recorded Session HUD */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/40 text-xs font-tech-mono">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="ml-2 text-[11px] text-muted-foreground hidden sm:inline">
                  LIVE PRODUCT SNEAK PEEK // DAY 41 OF 90
                </span>
              </div>

              {/* Mode Switch & Live State */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border border-border/80 text-[10px] text-muted-foreground">
                  <span className={`size-1.5 rounded-full ${isPlayingWalkthrough ? 'bg-foreground animate-pulse' : 'bg-muted-foreground'}`} />
                  <span>{isPlayingWalkthrough ? 'Simulated Walkthrough' : 'Interactive Playground'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlayingWalkthrough(!isPlayingWalkthrough)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[11px] font-medium transition-colors touch-target"
                  title={isPlayingWalkthrough ? 'Pause Walkthrough' : 'Play Walkthrough'}
                >
                  {isPlayingWalkthrough ? (
                    <>
                      <Pause className="size-3" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3" />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inner Workspace: Trajectory Left + Daily Anchor Right */}
            <div className="p-4 sm:p-6 md:p-8 relative">
              {/* Simulated Mouse Cursor (Visible during auto-walkthrough) */}
              {isPlayingWalkthrough && (
                <motion.div
                  className="absolute pointer-events-none z-30 transition-all duration-700 ease-out hidden md:block"
                  style={{
                    left: `${simCursorPos.x}%`,
                    top: `${simCursorPos.y}%`,
                  }}
                >
                  <div className="relative">
                    <MousePointer className="size-5 text-foreground drop-shadow-md -rotate-12 fill-foreground stroke-background stroke-2" />
                    {isClicking && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0.9 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute -top-1 -left-1 size-6 rounded-full border-2 border-foreground bg-foreground/20"
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground shrink-0">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-foreground uppercase tracking-tight">
                        Deterministic Momentum Vector
                      </span>
                      <span className="text-[10px] font-tech-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        DAY 41 OF 90
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-tech-mono mt-0.5">
                      90-Day horizon recalibrates smoothly as daily anchors complete
                    </p>
                  </div>
                </div>

                {/* Velocity Readout */}
                <div className="flex items-center gap-3 bg-muted/30 border border-border/80 rounded-xl px-3.5 py-1.5">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-tech-mono uppercase tracking-wider">
                      Velocity Index
                    </div>
                    <div className="font-tech-mono font-bold text-sm sm:text-base text-foreground flex items-center justify-end gap-1.5">
                      <span>{velocity}x</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background font-bold">
                        {isAhead ? 'AHEAD' : isInBuffer ? 'IN BUFFER' : 'RECALIBRATE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Console Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
                {/* Left: Dynamic Trajectory Plane */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 sm:p-4 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-tech-mono text-muted-foreground mb-2 gap-2">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <span className="size-2 rounded-full bg-foreground" />
                        Seamless Trajectory Vector
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-muted-foreground/30 border border-border" />
                        ±10% Mathematical Buffer
                      </span>
                      <span className="text-foreground font-semibold">Day 1 → Day 90</span>
                    </div>

                    {/* SVG Trajectory Canvas */}
                    <div className="relative h-44 sm:h-52 w-full">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 500 210"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id="monochromeBufferGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.03" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
                          </linearGradient>
                          <filter id="monochromeGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Baseline & Target Horizon Guidelines */}
                        <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                        <line x1={startX} y1={targetHorizonY} x2={endX} y2={targetHorizonY} stroke="currentColor" strokeOpacity="0.22" strokeDasharray="4 4" />
                        <text x={endX - 4} y={targetHorizonY - 6} textAnchor="end" fill="currentColor" opacity="0.6" fontSize="9" fontFamily="monospace">
                          TARGET HORIZON (1.0x)
                        </text>

                        {/* Vertical Indicator: TODAY Milestone */}
                        <line x1={todayX} y1={24} x2={todayX} y2={186} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="2 2" />
                        <text x={todayX} y={198} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace" fontWeight="bold">
                          TODAY
                        </text>

                        {/* Milestone Labels */}
                        <text x={startX} y={198} textAnchor="start" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                          D1
                        </text>
                        <text x={125} y={198} textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                          D24
                        </text>
                        <text x={345} y={198} textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                          D68
                        </text>
                        <text x={endX} y={198} textAnchor="end" fill="currentColor" opacity="0.8" fontSize="8" fontFamily="monospace">
                          D90 GOAL
                        </text>

                        {/* ±10% Buffer Cone Polygon (Attached directly to Today coordinate, widening into the future) */}
                        <path d={bufferPolygon} fill="url(#monochromeBufferGrad)" className="transition-all duration-700 ease-out" />
                        <path d={bufferUpperPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.35" className="transition-all duration-700 ease-out" />
                        <path d={bufferLowerPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.35" className="transition-all duration-700 ease-out" />

                        {/* Past Historical Curve (Attached seamlessly to Today) */}
                        <path
                          d={historicalPath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeOpacity="0.65"
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />

                        {/* Past History Nodes */}
                        <circle cx={startX} cy={startY} r="3" fill="currentColor" opacity="0.6" />
                        <circle cx={90} cy={160} r="2.5" fill="currentColor" opacity="0.6" />
                        <circle cx={150} cy={142} r="2.5" fill="currentColor" opacity="0.7" />

                        {/* Updatable Projected Trajectory Line (Originates EXACTLY from Today coordinate with matching tangent) */}
                        <path
                          d={projectedPath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          filter="url(#monochromeGlow)"
                          className="transition-all duration-700 ease-out"
                        />

                        {/* TODAY Anchor Node (Crisp, Stationary, Zero Ping/Swiping Bug) */}
                        <circle
                          cx={todayX}
                          cy={todayY}
                          r="5.5"
                          fill="currentColor"
                          className="transition-all duration-700 ease-out"
                        />
                        <circle
                          cx={todayX}
                          cy={todayY}
                          r="9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeOpacity="0.4"
                          className="transition-all duration-700 ease-out"
                        />

                        {/* End Target Node Marker at Day 90 */}
                        <circle
                          cx={endX}
                          cy={projectedEndY}
                          r="5"
                          fill="currentColor"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>

                      {/* Embedded Telemetry Status Badge */}
                      <div className="absolute right-2 top-2 px-2.5 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-tech-mono text-foreground backdrop-blur-md shadow-sm">
                        {isAhead ? `+${daysMargin}d Ahead • Accelerating` : isInBuffer ? 'Inside ±10% Buffer' : 'Buffer Absorbing Drift'}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Strip Under Graph */}
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl border border-border/80 bg-background/60 text-center">
                    <div>
                      <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Trajectory Horizon</span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm mt-0.5 text-foreground">
                        {isAhead ? `+${daysMargin}d Margin` : isInBuffer ? 'Protected' : '-4d Off-Pace'}
                      </p>
                    </div>
                    <div className="border-x border-border/50 px-1">
                      <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Buffer Tolerance</span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm text-foreground mt-0.5">
                        ±10% Safety Cone
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Daily Execution</span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm text-foreground mt-0.5">
                        {completedCount}/3 Checked
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Tactile Daily Anchor Console */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                  <div className="p-4 rounded-xl border border-border/80 bg-card/80 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-foreground" />
                        <span className="font-display font-semibold text-xs text-foreground tracking-wide uppercase">
                          DAILY ANCHOR (1 FOCUS + 2 ROUTINES)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlayingWalkthrough(false);
                          setFocusDone(false);
                          setRoutine1Done(false);
                          setRoutine2Done(false);
                        }}
                        className="text-[10px] font-tech-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded bg-muted/60 hover:bg-muted transition-colors touch-target"
                        title="Reset daily items"
                      >
                        <RotateCcw className="size-3" />
                        Reset
                      </button>
                    </div>

                    {/* Primary Focus Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setIsPlayingWalkthrough(false);
                        setFocusDone(!focusDone);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsPlayingWalkthrough(false);
                          setFocusDone(!focusDone);
                        }
                      }}
                      className={`mt-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                        focusDone
                          ? 'border-foreground/40 bg-muted/60 shadow-xs'
                          : 'border-border/80 bg-background hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`size-6 rounded-lg border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${
                            focusDone
                              ? 'bg-foreground border-foreground text-background'
                              : 'border-border bg-background/80 text-transparent'
                          }`}
                        >
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-tech-mono font-semibold uppercase tracking-wider text-foreground">
                              PRIMARY FOCUS
                            </span>
                            <span className="text-[9px] font-tech-mono px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                              +35% THRUST
                            </span>
                          </div>
                          <p
                            className={`text-xs sm:text-sm font-medium mt-1 leading-snug transition-colors ${
                              focusDone ? 'line-through text-muted-foreground' : 'text-foreground font-semibold'
                            }`}
                          >
                            Finalize core mathematical buffer specification
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Routine 1 */}
                    <div className="space-y-2 mt-2.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setIsPlayingWalkthrough(false);
                          setRoutine1Done(!routine1Done);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsPlayingWalkthrough(false);
                            setRoutine1Done(!routine1Done);
                          }
                        }}
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                          routine1Done
                            ? 'border-border/80 bg-muted/40'
                            : 'border-border/60 bg-background hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              routine1Done
                                ? 'border-foreground bg-foreground text-background'
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
                            Morning Deep Reading (45m)
                          </span>
                        </div>
                        <span className="text-[9px] font-tech-mono text-muted-foreground shrink-0 ml-2">
                          +10% CADENCE
                        </span>
                      </div>

                      {/* Routine 2 */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setIsPlayingWalkthrough(false);
                          setRoutine2Done(!routine2Done);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsPlayingWalkthrough(false);
                            setRoutine2Done(!routine2Done);
                          }
                        }}
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                          routine2Done
                            ? 'border-border/80 bg-muted/40'
                            : 'border-border/60 bg-background hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              routine2Done
                                ? 'border-foreground bg-foreground text-background'
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
                        <span className="text-[9px] font-tech-mono text-muted-foreground shrink-0 ml-2">
                          +10% HABIT SEAL
                        </span>
                      </div>
                    </div>

                    {/* Execution Bar */}
                    <div className="mt-3.5 pt-3 border-t border-border/40">
                      <div className="flex justify-between text-[11px] font-tech-mono mb-1.5">
                        <span className="text-muted-foreground">Cadence Progress</span>
                        <span className="font-bold text-foreground">
                          {completedCount === 3
                            ? '100% (Peak Velocity)'
                            : completedCount === 2
                            ? '66% (Accelerating)'
                            : completedCount === 1
                            ? '33% (On Track)'
                            : '0% (Buffer Absorbing)'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-500 rounded-full"
                          style={{ width: `${(completedCount / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Video Player Timeline & Controls */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-border/60 bg-muted/30 text-xs font-tech-mono">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayingWalkthrough(!isPlayingWalkthrough)}
                  className="size-7 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center transition-colors touch-target"
                  title={isPlayingWalkthrough ? 'Pause' : 'Play'}
                >
                  {isPlayingWalkthrough ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
                </button>
                <span className="text-[11px] text-muted-foreground">
                  00:{videoElapsedSec.toString().padStart(2, '0')} / 00:16
                </span>
              </div>

              {/* Progress Scrubber */}
              <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs mx-6">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-300"
                    style={{ width: `${(videoElapsedSec / 16) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingWalkthrough(false);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Take Control
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── METRICS TELEMETRY STRIP (CONCRETE DATA, ZERO FLUFF) ── */}
      <section className="relative z-10 border-y border-border/60 bg-card/40 backdrop-blur-md py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">1 Focus</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Daily Commitment Cap
              </p>
            </div>
            <div className="p-2">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">±10%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Mathematical Buffer
              </p>
            </div>
            <div className="p-2">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">90 Days</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Trajectory Horizon
              </p>
            </div>
            <div className="p-2">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">100%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Offline Local-First Vault
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE STEPS: SMOOTH, SLOWER HOVER EXPANSION (INACTIVE SHRINKS TO SQUARE) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-tech-mono font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            THE THREE PILLARS
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Three Steps to{' '}
            <span className="font-serif-display italic font-normal text-muted-foreground">
              Quiet Follow-Through
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            Eliminate decision fatigue and sustain lifelong momentum with three simple rules.
          </p>
        </div>

        {/* Smooth, slower hover expansion: active enlarges, inactive shrinks to square */}
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center min-h-[300px]">
          {principles.map((p, index) => {
            const isHovered = hoveredStep === index;
            const isOtherHovered = hoveredStep !== null && hoveredStep !== index;
            const Icon = p.icon;

            // Inactive cards shrink to a square on desktop
            if (isOtherHovered) {
              return (
                <motion.div
                  key={p.step}
                  layout
                  transition={{ layout: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.35 } }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => setHoveredStep(index)}
                  className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl p-4 cursor-pointer hover:border-foreground/30 transition-colors tis-specular-box w-full md:w-44 md:h-44 aspect-square flex-shrink-0 flex flex-col items-center justify-between text-center select-none"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-tech-mono font-extrabold text-xs text-muted-foreground">
                      {p.step}
                    </span>
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  </div>

                  <div className="size-10 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center text-foreground">
                    <Icon className="size-5" />
                  </div>

                  <span className="text-[11px] font-tech-mono text-muted-foreground font-medium uppercase tracking-wider truncate w-full">
                    {p.shortLabel}
                  </span>
                </motion.div>
              );
            }

            // Normal / Enlarged active card
            return (
              <motion.div
                key={p.step}
                layout
                transition={{ layout: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.35 } }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setHoveredStep(hoveredStep === index ? null : index)}
                className={`group relative rounded-2xl border p-5 sm:p-7 backdrop-blur-xl flex flex-col justify-between cursor-pointer transition-colors tis-specular-box ${
                  isHovered
                    ? 'border-foreground/50 shadow-2xl z-10 bg-card w-full md:flex-1 min-h-[300px]'
                    : 'border-border/80 bg-card/70 shadow-lg w-full md:flex-1 min-h-[300px]'
                }`}
              >
                {/* Top specular highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-tech-mono font-extrabold text-2xl sm:text-3xl text-foreground/80 group-hover:text-foreground transition-colors">
                      {p.step}
                    </span>
                    <span className="text-[10px] font-tech-mono px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border">
                      {p.metric}
                    </span>
                  </div>

                  <div className="text-[10px] font-tech-mono text-muted-foreground uppercase tracking-wider mb-1">
                    {p.eyebrow}
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-2 leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                {/* Operating Rule Badge */}
                <div className="mt-5 pt-3.5 border-t border-border/50 flex items-center justify-between text-xs font-tech-mono">
                  <span className="text-muted-foreground">Operating Rule</span>
                  <span className="font-semibold text-foreground">{p.rule}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SIDE-BY-SIDE ARCHITECTURAL COMPARISON (SHADCN TABLE STRUCTURE) ── */}
      <ComparisonTable onSelectPlan={() => navigate('/auth')} />

      {/* ── FINAL CALL TO ACTION (MONOCHROMATIC LIQUID GLASS DOCK) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-7 sm:p-12 md:p-14 border border-border/80 bg-card/90 shadow-2xl overflow-hidden tis-specular-box"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-tech-mono font-semibold text-muted-foreground uppercase tracking-widest">
              INITIALIZE YOUR SYSTEM
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 mb-3 leading-tight">
              One focus today.{' '}
              <span className="font-serif-display italic font-normal text-muted-foreground block">
                Compounding evidence forever.
              </span>
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              Step away from the endless to-do churn. Commit to 1 daily focus, protect your buffer, and build an unbreakable record of growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="default"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-5 font-display text-sm sm:text-base font-semibold shadow-lg touch-target"
              >
                <span>Enter The System</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-tech-mono text-muted-foreground mt-6 pt-4 border-t border-border/40">
              <span className="flex items-center gap-1">
                <Check className="size-3 text-foreground" />
                Instant Setup
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-foreground" />
                No Credit Card Required
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="size-3 text-foreground" />
                100% Private Offline Vault
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MINIMALIST FOOTER (NO DEMO PROMISES) ── */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SystemLogo size={26} />
            <div>
              <span className="font-display font-semibold text-sm text-foreground">
                The Improvement System
              </span>
              <p className="text-[10px] text-muted-foreground font-tech-mono">
                Personal Trajectory Engine • Quiet Follow-Through
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-tech-mono text-muted-foreground">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors touch-target"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors touch-target"
            >
              Start Free Vault
            </button>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-muted-foreground/60">© 2026 The Improvement System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
