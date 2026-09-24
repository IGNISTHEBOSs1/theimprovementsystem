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
  MousePointer,
  Layers,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';
import ComparisonTable from '@/components/ui/comparison-table';
import { cn } from '@/lib/utils';

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

  // Target element refs for precision human mouse simulation
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const focusBoxRef = useRef<HTMLDivElement | null>(null);
  const routine1BoxRef = useRef<HTMLDivElement | null>(null);
  const routine2BoxRef = useRef<HTMLDivElement | null>(null);
  const graphNodeRef = useRef<HTMLDivElement | null>(null);
  const todayCircleRef = useRef<SVGCircleElement | null>(null);
  const velocityBadgeRef = useRef<HTMLDivElement | null>(null);
  const resetBtnRef = useRef<HTMLButtonElement | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video Sneak Peek Walkthrough Engine
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState<boolean>(true);
  const [videoElapsedSec, setVideoElapsedSec] = useState<number>(0);
  const [simCursorPos, setSimCursorPos] = useState<{ x: number; y: number }>({ x: 260, y: 140 });
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [activePressedTarget, setActivePressedTarget] = useState<string | null>(null);
  const [cursorLabel, setCursorLabel] = useState<string>('1 Focus / Day');

  // User activity tracker: immediately hides simulated cursor on touch/click, resumes tour after 4s of idle
  const handleUserActivity = useCallback(() => {
    setIsPlayingWalkthrough(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsPlayingWalkthrough(true);
    }, 4000); // 4 seconds of inactivity
  }, []);

  // Responsive desktop detection for Three Steps hover expansion
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Passive user activity listener on console container (prevents mobile touch conflict/glitches)
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    const onUserInteract = () => handleUserActivity();
    el.addEventListener('click', onUserInteract, { passive: true });
    return () => el.removeEventListener('click', onUserInteract);
  }, [handleUserActivity]);

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

  // Keep a ref to todayY so position calculations always read the latest value without triggering effect reruns
  const todayYRef = useRef(todayY);
  useEffect(() => {
    todayYRef.current = todayY;
  }, [todayY]);

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

  // ── FIXED NOMINAL ±10% BUFFER CORRIDOR ──
  // The buffer corridor is a stationary mathematical tolerance zone around the nominal baseline target (54).
  // It remains fixed so the user's dynamic trajectory line moves relative to it (Ahead, In Buffer, Absorbing Drift).
  const bufferUpperPath = `M ${todayX},96 C ${todayX + 60},84 ${endX - 60},40 ${endX},36`;
  const bufferLowerPath = `M ${todayX},112 C ${todayX + 60},104 ${endX - 60},68 ${endX},72`;
  const bufferPolygon = `M ${todayX},96 C ${todayX + 60},84 ${endX - 60},40 ${endX},36 L ${endX},72 C ${endX - 60},68 ${todayX + 60},104 ${todayX},112 Z`;

  // ── HUMAN-LIKE SNEAK PEEK AUTO-PLAYING SIMULATED MOUSE ENGINE ──
  useEffect(() => {
    if (!isPlayingWalkthrough) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let tickerId: ReturnType<typeof setInterval> | null = null;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    let startTime = Date.now();
    tickerId = setInterval(() => {
      if (cancelled) return;
      const elapsed = Math.floor((Date.now() - startTime) / 1000) % 16;
      setVideoElapsedSec(elapsed);
    }, 200);

    const getTargetPos = (
      el: HTMLElement | SVGElement | null,
      fallback: { x: number; y: number }
    ) => {
      if (!consoleRef.current || !el) return fallback;
      const parentRect = consoleRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (parentRect.width === 0 || elRect.width === 0) return fallback;
      const rawX = elRect.left - parentRect.left + elRect.width / 2;
      const rawY = elRect.top - parentRect.top + elRect.height / 2;
      return {
        x: Math.max(16, Math.min(parentRect.width - 24, rawX)),
        y: Math.max(16, Math.min(parentRect.height - 24, rawY)),
      };
    };

    const runScript = async () => {
      // Small initial delay so DOM layout completes
      await wait(150);
      if (cancelled) return;

      while (!cancelled) {
        startTime = Date.now();
        setVideoElapsedSec(0);

        // Reset tasks to uncompleted for fresh demonstration
        setFocusDone(false);
        setRoutine1Done(false);
        setRoutine2Done(false);
        setIsClicking(false);
        setActivePressedTarget(null);
        setCursorLabel('1 Focus / Day');

        // Initial cursor resting position
        const initTarget = getTargetPos(focusBoxRef.current, { x: 300, y: 180 });
        setSimCursorPos({ x: initTarget.x - 40, y: Math.max(30, initTarget.y - 70) });

        // Phase 1: Glide into Primary Focus checkbox
        await wait(1000);
        if (cancelled) return;
        const focusPos = getTargetPos(focusBoxRef.current, { x: 300, y: 180 });
        setSimCursorPos(focusPos);

        // Hover pause
        await wait(600);
        if (cancelled) return;

        // Click down on Primary Focus
        setIsClicking(true);
        setActivePressedTarget('focus');
        setCursorLabel('+35% Thrust');
        setFocusDone(true);
        await wait(320);
        if (cancelled) return;

        // Release click
        setIsClicking(false);
        setActivePressedTarget(null);

        // Admire trajectory surge
        await wait(1100);
        if (cancelled) return;

        // Phase 2: Glide to Routine 1
        setCursorLabel('Routine 01 (Reading)');
        const r1Pos = getTargetPos(routine1BoxRef.current, { x: 300, y: 240 });
        setSimCursorPos(r1Pos);
        await wait(750);
        if (cancelled) return;

        // Hover & click Routine 1
        await wait(300);
        if (cancelled) return;
        setIsClicking(true);
        setActivePressedTarget('routine1');
        setCursorLabel('+10% Cadence');
        setRoutine1Done(true);
        await wait(320);
        if (cancelled) return;

        // Release Routine 1
        setIsClicking(false);
        setActivePressedTarget(null);
        await wait(700);
        if (cancelled) return;

        // Phase 3: Glide across to Trajectory Graph Today Milestone
        setCursorLabel('Today Milestone');
        const todayPos = getTargetPos(todayCircleRef.current, { x: 180, y: 130 });
        setSimCursorPos(todayPos);
        await wait(1200);
        if (cancelled) return;

        // Trace along ±10% buffer cone
        setCursorLabel('±10% Safety Buffer');
        setSimCursorPos({ x: todayPos.x + 45, y: todayPos.y - 12 });
        await wait(1400);
        if (cancelled) return;

        // Phase 4: Glide down to Routine 2
        setCursorLabel('Routine 02 (Review)');
        const r2Pos = getTargetPos(routine2BoxRef.current, { x: 300, y: 300 });
        setSimCursorPos(r2Pos);
        await wait(850);
        if (cancelled) return;

        // Hover & click Routine 2
        await wait(300);
        if (cancelled) return;
        setIsClicking(true);
        setActivePressedTarget('routine2');
        setCursorLabel('Peak Velocity (1.25x)');
        setRoutine2Done(true);
        await wait(320);
        if (cancelled) return;

        // Release Routine 2
        setIsClicking(false);
        setActivePressedTarget(null);
        await wait(800);
        if (cancelled) return;

        // Phase 5: Glide to Velocity Index badge in HUD
        const badgePos = getTargetPos(velocityBadgeRef.current, { x: 420, y: 55 });
        setSimCursorPos(badgePos);
        await wait(1500);
        if (cancelled) return;

        // Phase 6: Glide to Reset button
        setCursorLabel('Reset Loop');
        const resetPos = getTargetPos(resetBtnRef.current, { x: 420, y: 170 });
        setSimCursorPos(resetPos);
        await wait(800);
        if (cancelled) return;

        // Click Reset
        setIsClicking(true);
        setActivePressedTarget('reset');
        setFocusDone(false);
        setRoutine1Done(false);
        setRoutine2Done(false);
        await wait(320);
        if (cancelled) return;

        setIsClicking(false);
        setActivePressedTarget(null);
        await wait(800);
        if (cancelled) return;
      }
    };

    runScript();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (tickerId) clearInterval(tickerId);
    };
  }, [isPlayingWalkthrough]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground selection:bg-white/20 selection:text-white">
      {/* ── MONOCHROMATIC MESH BACKGROUND ── */}
      <MonochromaticMeshBackground />

      {/* ── MINIMAL TOP NAVBAR (LIQUID FROSTED GLASS & SPECULAR EDGE) ── */}
      <header className="sticky top-0 z-50 px-3.5 sm:px-6 md:px-8 py-2 sm:py-3.5 backdrop-blur-2xl bg-background/70 border-b border-white/10 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 rounded-xl bg-card/80 border border-white/10 shadow-xs shrink-0 backdrop-blur-md">
              <SystemLogo size={22} className="sm:hidden" />
              <SystemLogo size={26} className="hidden sm:block" />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground uppercase truncate">
                The Improvement System
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-tech-mono font-medium tracking-wider bg-muted/60 text-muted-foreground border border-border/80">
                <span className="size-1.5 rounded-full bg-foreground" />
                LOCAL ENCLAVE
              </span>
            </div>
          </div>

          {/* Action Buttons Only - Single Log In Action */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs px-3 sm:px-4 h-8 sm:h-9 font-display font-medium shadow-xs"
            >
              <span>Log In</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: CADENCE & SNEAK PEEK (<3s CLARITY, SPACIOUS BREATHING ROOM) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8 sm:pt-16 sm:pb-16 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/70 backdrop-blur-md border border-white/10 mb-4 sm:mb-5 shadow-xs"
        >
          <Sparkles className="size-3.5 text-foreground shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-tech-mono font-medium text-foreground tracking-wider uppercase">
            <span className="hidden sm:inline">Deterministic Personal Trajectory • Zero Rigid Streaks</span>
            <span className="sm:hidden">Zero Rigid Streaks • 90-Day Horizon</span>
          </span>
        </motion.div>

        {/* Crisp Headline with Editorial Font Contrast (Strictly Hero H1 Only) */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.18] sm:leading-[1.12] mb-3 sm:mb-5 text-foreground max-w-3xl mx-auto px-2"
        >
          One focus a day.{' '}
          <span className="font-serif-display italic font-normal text-muted-foreground block sm:inline">
            A buffer that protects your streak.
          </span>
        </motion.h1>

        {/* Strictly ≤ 3 Lines Subheading (Cadence, Clear, Concise, Airy on Mobile) */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-muted-foreground text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
        >
          <span className="hidden sm:inline">
            Miss one day in typical habit apps, and your streak resets to zero. We give you 1 primary win, 2 routines, and a ±10% mathematical buffer so real life never kills your progress.
          </span>
          <span className="sm:hidden">
            Typical habit apps reset to zero on one missed day. We protect your momentum with 1 focus, 2 routines, and a ±10% buffer cone.
          </span>
        </motion.p>

        {/* Primary CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-10 px-3 max-w-sm sm:max-w-none mx-auto"
        >
          <Button
            variant="default"
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 font-display text-xs sm:text-sm font-semibold shadow-md active:scale-[0.98]"
          >
            <span>Log In</span>
            <ArrowRight className="size-3.5 sm:size-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const el = document.getElementById('sneak-peek-frame');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-10 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground border-border/80 bg-card/60 backdrop-blur-md active:scale-[0.98]"
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
          {/* Hardware Frame with Liquid Frosted Glass and Monochromatic Specular Rim */}
          <div className="relative rounded-2xl md:rounded-3xl border border-white/15 dark:border-white/10 bg-card/85 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.3),0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden tis-specular-box">
            {/* Top Bar: Recorded Session HUD (Zero Play/Pause Buttons) */}
            <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 dark:border-white/10 bg-muted/30 text-xs font-tech-mono backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-600/40 border border-zinc-500/50" />
                <span className="ml-2 text-[11px] text-muted-foreground hidden sm:inline">
                  LIVE PRODUCT SNEAK PEEK // DAY 41 OF 90
                </span>
                <span className="ml-1 text-[10px] text-muted-foreground sm:hidden">
                  DAY 41 OF 90
                </span>
              </div>

              {/* Live State Badge (Auto-reappears after ~3-5s inactivity) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-border/80 text-[10px] text-muted-foreground backdrop-blur-sm shadow-xs">
                  <span className={`size-1.5 rounded-full ${isPlayingWalkthrough ? 'bg-foreground animate-pulse' : 'bg-muted-foreground'}`} />
                  <span>{isPlayingWalkthrough ? 'Guided Tour' : 'Interactive Mode'}</span>
                </div>
              </div>
            </div>

            {/* Inner Workspace: Trajectory Left + Daily Anchor Right */}
            <div
              ref={consoleRef}
              className="p-3.5 sm:p-6 md:p-8 relative overflow-hidden"
            >
              {/* Simulated Human Mouse Cursor (Visible on all viewports during walkthrough) */}
              <AnimatePresence>
                {isPlayingWalkthrough && (() => {
                  const isPillFlipped = Boolean(
                    consoleRef.current
                      ? simCursorPos.x > (consoleRef.current.clientWidth - 135) && simCursorPos.x > 120
                      : simCursorPos.x > 180
                  );

                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: simCursorPos.x,
                        y: simCursorPos.y,
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        x: { type: 'spring', damping: 24, stiffness: 160, mass: 0.6 },
                        y: { type: 'spring', damping: 24, stiffness: 160, mass: 0.6 },
                        opacity: { duration: 0.2 },
                      }}
                      style={{ left: 0, top: 0 }}
                      className="absolute pointer-events-none z-30 flex items-start"
                    >
                      <div className="relative -top-1 -left-1 shrink-0">
                        <motion.div
                          animate={{
                            scale: isClicking ? 0.82 : 1,
                            rotate: isClicking ? -16 : -10,
                          }}
                          transition={{ duration: 0.12 }}
                        >
                          <MousePointer className="size-5 text-foreground drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] fill-foreground stroke-background stroke-[1.5]" />
                        </motion.div>
                        {isClicking && (
                          <motion.div
                            initial={{ scale: 0.3, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="absolute -top-1.5 -left-1.5 size-6 rounded-full border-2 border-foreground bg-foreground/25 pointer-events-none"
                          />
                        )}
                      </div>

                      {/* Contextual Action Pill (Clamped inside edges, flips left when near right margin) */}
                      <AnimatePresence mode="wait">
                        {cursorLabel && (
                          <motion.div
                            key={cursorLabel}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "absolute top-0 px-2.5 py-0.5 rounded-full bg-foreground text-background text-[10px] font-tech-mono font-bold tracking-wider uppercase shadow-lg select-none whitespace-nowrap pointer-events-none",
                              isPillFlipped ? "right-full mr-2.5" : "left-full ml-2.5"
                            )}
                          >
                            {cursorLabel}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/10 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="size-9 sm:size-10 rounded-xl bg-muted/80 border border-white/10 flex items-center justify-center text-foreground shrink-0 backdrop-blur-md">
                    <Activity className="size-4 sm:size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs sm:text-sm text-foreground uppercase tracking-tight">
                        Deterministic Momentum Vector
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        DAY 41 OF 90
                      </span>
                    </div>
                    <p className="hidden sm:block text-xs text-muted-foreground font-tech-mono mt-0.5">
                      90-Day horizon updates smoothly as daily anchors complete
                    </p>
                  </div>
                </div>

                {/* Velocity Readout */}
                <div
                  ref={velocityBadgeRef}
                  className="flex items-center gap-3 bg-muted/40 border border-white/10 rounded-xl px-3 sm:px-3.5 py-1.5 backdrop-blur-md"
                >
                  <div className="text-right">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground font-tech-mono uppercase tracking-wider">
                      Velocity Index
                    </div>
                    <div className="font-tech-mono font-bold text-xs sm:text-base text-foreground flex items-center justify-end gap-1.5">
                      <span>{velocity}x</span>
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background font-bold">
                        {isAhead ? 'AHEAD' : isInBuffer ? 'IN BUFFER' : 'ABSORBING DRIFT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Console Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6 items-center">
                {/* Left: Dynamic Trajectory Plane */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="rounded-xl border border-white/10 bg-background/80 dark:bg-card/40 backdrop-blur-xl p-3 sm:p-4 shadow-inner tis-specular-box">
                    <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-tech-mono text-muted-foreground mb-2 gap-2">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <span className="size-2 rounded-full bg-foreground" />
                        Seamless Trajectory Vector
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-muted-foreground/30 border border-border" />
                        ±10% Safety Buffer
                      </span>
                      <span className="text-foreground font-semibold">D1 → D90</span>
                    </div>

                    {/* SVG Trajectory Canvas */}
                    <div ref={graphNodeRef} className="relative h-40 sm:h-52 w-full">
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

                        {/* ±10% Buffer Cone Polygon */}
                        <path d={bufferPolygon} fill="url(#monochromeBufferGrad)" className="transition-all duration-700 ease-out" />
                        <path d={bufferUpperPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.35" className="transition-all duration-700 ease-out" />
                        <path d={bufferLowerPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.35" className="transition-all duration-700 ease-out" />

                        {/* Past Historical Curve */}
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

                        {/* Updatable Projected Trajectory Line */}
                        <path
                          d={projectedPath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          filter="url(#monochromeGlow)"
                          className="transition-all duration-700 ease-out"
                        />

                        {/* TODAY Anchor Node */}
                        <circle
                          ref={todayCircleRef}
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
                      <div className="absolute right-2 top-2 px-2.5 py-1 rounded-md bg-card/90 border border-white/10 text-[10px] font-tech-mono text-foreground backdrop-blur-md shadow-sm">
                        {isAhead ? `+${daysMargin}d Ahead • Accelerating` : isInBuffer ? 'Inside ±10% Buffer' : 'Buffer Absorbing Drift'}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Strip Under Graph (Spacious on Mobile) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl border border-white/10 bg-background/60 dark:bg-card/30 backdrop-blur-md text-center">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono text-muted-foreground uppercase">
                        <span className="hidden sm:inline">Trajectory </span>Horizon
                      </span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm mt-0.5 text-foreground">
                        {isAhead ? `+${daysMargin}d Margin` : isInBuffer ? 'Protected' : '-4d Off-Pace'}
                      </p>
                    </div>
                    <div className="border-x border-border/50 px-1">
                      <span className="text-[9px] sm:text-[10px] font-tech-mono text-muted-foreground uppercase">
                        <span className="hidden sm:inline">Buffer </span>Tolerance
                      </span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm text-foreground mt-0.5">
                        ±10% Cone
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-tech-mono text-muted-foreground uppercase">
                        <span className="hidden sm:inline">Daily </span>Tasks
                      </span>
                      <p className="font-tech-mono font-bold text-xs sm:text-sm text-foreground mt-0.5">
                        {completedCount}/3 Done
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Tactile Daily Anchor Console */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                  <div className="p-3.5 sm:p-4 rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-md tis-specular-box">
                    <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-foreground" />
                        <span className="font-display font-semibold text-xs text-foreground tracking-wide uppercase">
                          DAILY ANCHOR (1 FOCUS + 2 ROUTINES)
                        </span>
                      </div>
                      <button
                        ref={resetBtnRef}
                        type="button"
                        onClick={() => {
                          handleUserActivity();
                          setFocusDone(false);
                          setRoutine1Done(false);
                          setRoutine2Done(false);
                        }}
                        className={`text-[10px] font-tech-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded bg-muted/60 hover:bg-muted transition-all touch-target ${
                          activePressedTarget === 'reset' ? 'scale-95 bg-muted text-foreground' : ''
                        }`}
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
                        handleUserActivity();
                        setFocusDone(!focusDone);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleUserActivity();
                          setFocusDone(!focusDone);
                        }
                      }}
                      className={`mt-2.5 sm:mt-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                        activePressedTarget === 'focus' ? 'scale-[0.98] ring-1 ring-foreground/30 shadow-sm' : ''
                      } ${
                        focusDone
                          ? 'border-foreground/40 bg-muted/60 shadow-xs'
                          : 'border-border/80 bg-background/90 hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          ref={focusBoxRef}
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
                    <div className="space-y-2 mt-2 sm:mt-2.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          handleUserActivity();
                          setRoutine1Done(!routine1Done);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleUserActivity();
                            setRoutine1Done(!routine1Done);
                          }
                        }}
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                          activePressedTarget === 'routine1' ? 'scale-[0.98] ring-1 ring-foreground/30 shadow-sm' : ''
                        } ${
                          routine1Done
                            ? 'border-border/80 bg-muted/40'
                            : 'border-border/60 bg-background/90 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            ref={routine1BoxRef}
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
                          handleUserActivity();
                          setRoutine2Done(!routine2Done);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleUserActivity();
                            setRoutine2Done(!routine2Done);
                          }
                        }}
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                          activePressedTarget === 'routine2' ? 'scale-[0.98] ring-1 ring-foreground/30 shadow-sm' : ''
                        } ${
                          routine2Done
                            ? 'border-border/80 bg-muted/40'
                            : 'border-border/60 bg-background/90 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            ref={routine2BoxRef}
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
                    <div className="mt-3 pt-2.5 sm:pt-3 border-t border-border/40">
                      <div className="flex justify-between text-[10px] sm:text-[11px] font-tech-mono mb-1.5">
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

            {/* Bottom Bar: Timeline Scrubber (Zero Play/Pause Buttons, Pure Inactivity Logic) */}
            <div className="flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 border-t border-white/10 dark:border-white/10 bg-muted/30 text-xs font-tech-mono backdrop-blur-md">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="relative flex size-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlayingWalkthrough ? 'animate-ping bg-foreground' : 'bg-muted-foreground'}`} />
                  <span className={`relative inline-flex size-2 rounded-full ${isPlayingWalkthrough ? 'bg-foreground' : 'bg-muted-foreground'}`} />
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                  00:{videoElapsedSec.toString().padStart(2, '0')} / 00:16
                </span>
              </div>

              {/* Progress Scrubber */}
              <div className="flex items-center gap-2 flex-1 max-w-xs mx-3 sm:mx-6">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-300"
                    style={{ width: `${(videoElapsedSec / 16) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-[10px] font-tech-mono text-muted-foreground/70 hidden sm:inline">
                  {isPlayingWalkthrough ? 'Tap any card to interact' : 'Resumes automatically in 4s'}
                </span>
                <span className="text-[9px] font-tech-mono text-muted-foreground/70 sm:hidden">
                  {isPlayingWalkthrough ? 'Tap to test' : 'Auto-resumes'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── METRICS TELEMETRY STRIP (LIQUID GLASS & CONCRETE INVARIANTS) ── */}
      <section className="relative z-10 border-y border-white/10 dark:border-white/10 bg-card/50 dark:bg-card/30 backdrop-blur-2xl py-8 sm:py-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-card/30 border border-white/5 backdrop-blur-sm">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">1 Focus</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Daily Cap
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-card/30 border border-white/5 backdrop-blur-sm">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">±10%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Safety Buffer
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-card/30 border border-white/5 backdrop-blur-sm">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">90 Days</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Trajectory
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-card/30 border border-white/5 backdrop-blur-sm">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">100%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Offline Vault
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE STEPS: SMOOTH, SLOWER HOVER EXPANSION (INACTIVE SHRINKS TO SQUARE ON DESKTOP) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs font-tech-mono font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            THE THREE PILLARS
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Three Steps to Quiet Follow-Through
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            Eliminate decision fatigue and sustain lifelong momentum with three simple rules.
          </p>
        </div>

        {/* The Three Steps: Smart Shrinking on Desktop, Uniform Static Stack on Mobile */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch justify-center">
          {principles.map((p, index) => {
            const isHovered = isDesktop && hoveredStep === index;
            const isOtherHovered = isDesktop && hoveredStep !== null && hoveredStep !== index;

            return (
              <motion.div
                key={p.step}
                layout
                transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.25 } }}
                onMouseEnter={() => isDesktop && setHoveredStep(index)}
                onMouseLeave={() => isDesktop && setHoveredStep(null)}
                className={cn(
                  "group relative rounded-2xl border p-5 sm:p-6 backdrop-blur-2xl flex flex-col justify-between transition-all duration-500 tis-specular-box min-h-[250px] sm:min-h-[280px]",
                  // Mobile: clean static cards, no enlargement jumps
                  "w-full",
                  // Desktop: smart flex proportions (hovered expands, siblings shrink smartly with all content intact)
                  isDesktop && (
                    isHovered
                      ? "md:flex-[1.4] border-white/25 shadow-2xl bg-card/90 z-10"
                      : isOtherHovered
                      ? "md:flex-[0.8] border-white/10 bg-card/50 opacity-80 hover:opacity-100"
                      : "md:flex-1 border-white/10 bg-card/65 shadow-lg"
                  )
                )}
              >
                {/* Top specular highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="font-tech-mono font-extrabold text-2xl sm:text-3xl text-foreground/80 group-hover:text-foreground transition-colors">
                      {p.step}
                    </span>
                    <span className="text-[10px] font-tech-mono px-2.5 py-0.5 rounded-full bg-muted/80 text-foreground border border-border">
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
                <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-border/50 flex items-center justify-between text-xs font-tech-mono">
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
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-14 border border-white/15 dark:border-white/10 bg-card/80 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden tis-specular-box"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-tech-mono font-semibold text-muted-foreground uppercase tracking-widest">
              INITIALIZE YOUR SYSTEM
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 mb-3 leading-tight">
              One focus today. Compounding evidence forever.
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto">
              <span className="hidden sm:inline">
                Step away from the endless to-do churn. Commit to 1 daily focus, protect your buffer, and build an unbreakable record of growth.
              </span>
              <span className="sm:hidden">
                Commit to 1 daily focus, protect your buffer, and build an unbreakable record of personal growth.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="default"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto h-11 sm:h-12 px-8 font-display text-xs sm:text-sm font-semibold shadow-lg active:scale-[0.98]"
              >
                <span>Log In</span>
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
              className="hover:text-foreground transition-colors touch-target font-medium"
            >
              Log In
            </button>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-muted-foreground/60">© 2026 The Improvement System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
