import { useState, useRef, useEffect } from 'react';
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

// ── DATA: The Three Core Principles of TIS (Concise, ≤ 3 Lines) ──
const principles = [
  {
    step: '01',
    eyebrow: 'DAILY CLARITY',
    title: 'One Focus Each Day',
    desc: 'Pick your single highest-leverage win every morning. Finish it first, free of endless 20-item backlog overwhelm.',
    tag: 'Zero Overwhelm',
    metric: '1 Focus / Day',
    image: '/images/tis_focus_monolith.jpg',
  },
  {
    step: '02',
    eyebrow: 'HABIT STABILITY',
    title: 'Two Supporting Routines',
    desc: 'Anchor two lightweight companion routines that sustain your daily momentum without exhausting your willpower.',
    tag: 'Daily Cadence',
    metric: '2 Routines Cap',
    image: '/images/tis_routines_cadence.jpg',
  },
  {
    step: '03',
    eyebrow: 'RESILIENT PROGRESS',
    title: 'The ±10% Buffer Cone',
    desc: 'Illness and busy travels happen. Our mathematical buffer safely absorbs off-days so your 90-day progress never dies.',
    tag: 'No Broken Streaks',
    metric: '±10% Safety Buffer',
    image: '/images/tis_buffer_cone.jpg',
  },
];

// ── DATA: Side-by-Side Architectural Comparison (Decluttered & Clean) ──
const comparisonFeatures = [
  {
    dimension: 'Streak Policy',
    otherTitle: 'Rigid 100% Streaks',
    otherDesc: 'Miss 1 day, reset to zero. Creates guilt and eventual abandonment.',
    tisTitle: 'The ±10% Buffer Cone',
    tisDesc: 'Safely absorbs off-days so your 90-day trajectory stays unbroken.',
  },
  {
    dimension: 'Daily Workload',
    otherTitle: '20+ Item Task Backlogs',
    otherDesc: 'Endless to-do lists that cause chronic decision fatigue.',
    tisTitle: '1 Focus + 2 Routines Cap',
    tisDesc: 'Strict cap guarantees high clarity and guaranteed follow-through.',
  },
  {
    dimension: 'Motivation Model',
    otherTitle: 'Fake XP & Cartoon Confetti',
    otherDesc: 'Loud casino bells and dopamine tricks that wear off quickly.',
    tisTitle: 'Quiet Mathematical Velocity',
    tisDesc: 'Calm velocity curves and verifiable completion evidence.',
  },
  {
    dimension: 'Data Privacy',
    otherTitle: 'Cloud Lock-in & Ad Profiling',
    otherDesc: 'Monetizes personal routines through invasive third-party ad beacons.',
    tisTitle: '100% Private Offline Vault',
    tisDesc: 'Works completely offline with client-side encrypted storage.',
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

// ── MOTIONSITES-INSPIRED LIVE MOTION BACKGROUND (KINETIC WAVE MESH & AMBIENT REFRACTIONS) ──
function LiveMotionBackground() {
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
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      // Render 4 interwoven harmonic wave trajectories (inspired by MotionSites "Neon Pulse" & "Crystal Wave")
      const waveLines = [
        { amp: 38, freq: 0.0016, speed: 1.0, color: 'rgba(16, 185, 129, 0.22)', yOffset: height * 0.44, lineWidth: 1.8 },
        { amp: 52, freq: 0.0012, speed: 0.72, color: 'rgba(20, 184, 166, 0.25)', yOffset: height * 0.54, lineWidth: 2.0 },
        { amp: 32, freq: 0.0020, speed: 1.35, color: 'rgba(52, 211, 153, 0.16)', yOffset: height * 0.64, lineWidth: 1.4 },
        { amp: 46, freq: 0.0014, speed: 0.90, color: 'rgba(13, 148, 136, 0.18)', yOffset: height * 0.72, lineWidth: 1.6 },
      ];

      waveLines.forEach((wave, waveIdx) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        for (let x = 0; x <= width; x += 6) {
          const mouseDist = Math.hypot(x / width - mousePos.x, wave.yOffset / height - mousePos.y);
          const mouseInfluence = Math.max(0, 1 - mouseDist * 2.2) * 28;
          const y =
            wave.yOffset +
            Math.sin(x * wave.freq + time * wave.speed) * wave.amp +
            Math.cos(x * wave.freq * 0.5 + time * 0.6) * 12 +
            mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Render luminous trailing data nodes along the waves
        const nodeX = ((time * 70 * (waveIdx + 1) * 0.7) % (width + 100)) - 50;
        const nodeY =
          wave.yOffset +
          Math.sin(nodeX * wave.freq + time * wave.speed) * wave.amp +
          Math.cos(nodeX * wave.freq * 0.5 + time * 0.6) * 12;

        if (nodeX >= 0 && nodeX <= width) {
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
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
      {/* Precision Trajectory Coordinate Grid with Radial Vignette */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.15) 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.15) 85%)',
        }}
      />

      {/* Kinetic Wave Canvas */}
      {!shouldReduceMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />
      )}

      {/* Floating Ambient Light 1: Primary Emerald Field */}
      <motion.div
        className="absolute -top-28 -left-20 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/14 blur-[100px] sm:blur-[140px] will-change-transform"
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
        className="absolute top-1/3 -right-24 w-[360px] sm:w-[540px] h-[360px] sm:h-[540px] rounded-full bg-teal-500/8 dark:bg-teal-500/12 blur-[110px] sm:blur-[150px] will-change-transform"
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
        className="absolute -bottom-24 left-1/4 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-emerald-600/6 dark:bg-emerald-600/10 blur-[100px] sm:blur-[130px] will-change-transform"
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
  const [focusDone, setFocusDone] = useState<boolean>(true);
  const [routine1Done, setRoutine1Done] = useState<boolean>(true);
  const [routine2Done, setRoutine2Done] = useState<boolean>(false);
  const [activeComparisonTab, setActiveComparisonTab] = useState<'sideBySide' | 'other' | 'tis'>('sideBySide');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('trajectory');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // ── AUTOMATIC MOMENTUM & TRAJECTORY GRAPH CALCULATIONS ──
  // The Daily Anchor directly drives momentum without artificial sliders:
  // Primary Focus delivers the core daily thrust (+35%), while companion routines provide cadence stability (+10% and +10%).
  const completedCount = (focusDone ? 1 : 0) + (routine1Done ? 1 : 0) + (routine2Done ? 1 : 0);

  // Historical 40-day baseline is 85%. Today's execution modulates the 90-day trajectory:
  // 0 tasks: velocity 0.74x, buffer absorbs (-4 days drift)
  // Focus only: velocity 1.04x, on trajectory (+6 days margin)
  // Focus + 1 Routine: velocity 1.14x, accelerating (+11 days margin)
  // All 3 done: velocity 1.24x, peak horizon (+16 days margin)
  // Only Routines (no focus): velocity 0.88x, buffer floor (+1 day margin)
  const todayScore = (focusDone ? 35 : 0) + (routine1Done ? 10 : 0) + (routine2Done ? 10 : 0) + 45;
  const velocityNum = parseFloat((todayScore / 80).toFixed(2));
  const velocity = velocityNum.toFixed(2);
  const isAhead = velocityNum >= 1.05;
  const isInBuffer = velocityNum >= 0.90 && velocityNum < 1.05;
  const daysMargin = focusDone
    ? (routine1Done && routine2Done ? 16 : (routine1Done || routine2Done) ? 11 : 6)
    : (routine1Done || routine2Done) ? 1 : -4;

  // Coordinate geometry for 420x180 SVG Trajectory Plane
  const startX = 24;
  const startY = 145;
  const todayX = 180;
  const endX = 396;
  const targetHorizonY = 48;

  // Today's vertical position based on completion:
  const todayY = focusDone ? (routine1Done && routine2Done ? 80 : 88) : (routine1Done || routine2Done ? 98 : 108);

  // Dynamic projected trajectory endpoint & control point:
  const projectedEndY = focusDone
    ? (routine1Done && routine2Done ? 24 : (routine1Done || routine2Done) ? 36 : 48)
    : (routine1Done || routine2Done ? 62 : 78);
  const projectedControlY = Math.round((todayY + projectedEndY) / 2 - (focusDone ? 12 : -8));

  const historicalPath = `M ${startX},${startY} Q 100,126 ${todayX},${todayY}`;
  const projectedPath = `M ${todayX},${todayY} Q 288,${projectedControlY} ${endX},${projectedEndY}`;
  const bufferUpperPath = `M ${todayX},${todayY - 8} Q 288,52 ${endX},28`;
  const bufferLowerPath = `M ${todayX},${todayY + 8} Q 288,84 ${endX},68`;
  const bufferPolygon = `M ${todayX},${todayY - 8} Q 288,52 ${endX},28 L ${endX},68 Q 288,84 ${todayX},${todayY + 8} Z`;

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
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shrink-0">
              <SystemLogo size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground uppercase truncate">
                  The Improvement System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-tech-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TRAJECTORY ENGINE
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-tech-mono tracking-wider hidden md:block">
                QUIET PERSONAL FOCUS • NO GIMMICKS
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-tech-mono text-muted-foreground">
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
              Trajectory
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

        {/* Mobile Navigation Drawer */}
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
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-tech-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Target className="size-3.5 text-emerald-400" />
                  <span>The Method</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('comparison')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-tech-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Shield className="size-3.5 text-emerald-400" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('simulator')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-tech-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Activity className="size-3.5 text-emerald-400" />
                  <span>Trajectory</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('instruments')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs font-tech-mono text-left text-muted-foreground hover:text-foreground touch-target"
                >
                  <Sliders className="size-3.5 text-emerald-400" />
                  <span>Instruments</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── TIER 1: HERO SECTION (<3s Comprehension, High-Contrast Modern Typography) ── */}
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
            <span className="text-[11px] sm:text-xs font-tech-mono font-medium text-emerald-300 tracking-wide uppercase">
              QUIET TRAJECTORY ENGINE • NO RIGID STREAKS
            </span>
          </motion.div>

          {/* Crisp Headline with Editorial Font Contrast */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] mb-4 text-foreground"
          >
            One focus a day.{' '}
            <span className="font-serif-display italic font-normal text-emerald-300 block sm:inline">
              A buffer that protects your streak.
            </span>
          </motion.h1>

          {/* Concise Subheading (Strictly ≤ 3 Lines) */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Most habit apps wipe your streak if you miss a single day. The Improvement System commits to 1 focus and 2 routines, using a ±10% mathematical buffer to absorb life&apos;s bumps.
          </motion.p>

          {/* 3-Second Core Pillars Strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto mb-7 text-left sm:text-center"
          >
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <span className="font-tech-mono text-emerald-400 font-bold text-xs uppercase">1 Primary Focus</span>
              <span className="text-[11px] text-muted-foreground">Zero to-do backlog</span>
            </div>
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 backdrop-blur-sm">
              <span className="font-tech-mono text-emerald-400 font-bold text-xs uppercase">±10% Safety Buffer</span>
              <span className="text-[11px] text-muted-foreground">Sick days won&apos;t kill streaks</span>
            </div>
            <div className="flex sm:flex-col items-center sm:justify-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <span className="font-tech-mono text-emerald-400 font-bold text-xs uppercase">Offline Vault</span>
              <span className="text-[11px] text-muted-foreground">100% private, zero ad pixels</span>
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

        {/* ── TIER 1 PROOF: REACTIVE MOMENTUM GRAPH & DAILY ANCHOR CONSOLE ── */}
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

            {/* Header of the Console */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="size-9 sm:size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Activity className="size-4 sm:size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground uppercase">
                      Deterministic Momentum Vector
                    </span>
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-tech-mono">
                    90-Day horizon calculates instantly from daily anchor completion
                  </p>
                </div>
              </div>

              {/* Dynamic Status Metric */}
              <div className="flex items-center gap-3 bg-background/60 border border-border/70 rounded-xl px-3 py-1.5 shadow-sm">
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground font-tech-mono uppercase tracking-wider">
                    Velocity Index
                  </div>
                  <div className="font-tech-mono font-bold text-sm sm:text-base text-foreground flex items-center justify-end gap-1.5">
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
              {/* Left Column: Reactive Trajectory Curve + Live Telemetry HUD Strip */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* SVG Visualizer */}
                <div className="relative rounded-xl border border-border/70 bg-background/80 p-3.5 sm:p-4 overflow-hidden shadow-inner">
                  {/* Top Header of SVG Plane */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-tech-mono text-muted-foreground mb-2.5 gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      Dynamic Trajectory Vector
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
                      ±10% Buffer Cone
                    </span>
                    <span className="font-semibold text-emerald-400">Day 1 → Day 90 Horizon</span>
                  </div>

                  {/* SVG Canvas with Proportional ViewBox (420x180) */}
                  <div className="relative h-44 sm:h-52 w-full">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 420 180"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="tisCurveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="tisBufferConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.18" />
                        </linearGradient>
                        <filter id="tisNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Milestone Grid Guidelines */}
                      <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                      <line x1={startX} y1={targetHorizonY} x2={endX} y2={targetHorizonY} stroke="#10b981" strokeOpacity="0.25" strokeDasharray="4 4" />
                      <text x={endX - 4} y={targetHorizonY - 6} textAnchor="end" fill="#10b981" fontSize="9" fontFamily="monospace" opacity="0.8">
                        TARGET HORIZON (1.0x)
                      </text>

                      {/* Vertical Indicator: TODAY Marker */}
                      <line x1={todayX} y1={20} x2={todayX} y2={165} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 2" />
                      <text x={todayX} y={174} textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        TODAY
                      </text>

                      {/* X-Axis Milestone Labels */}
                      <text x={startX} y={174} textAnchor="start" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                        D1
                      </text>
                      <text x={95} y={174} textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                        D20
                      </text>
                      <text x={285} y={174} textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="8" fontFamily="monospace">
                        D65
                      </text>
                      <text x={endX} y={174} textAnchor="end" fill="#10b981" opacity="0.8" fontSize="8" fontFamily="monospace">
                        D90 GOAL
                      </text>

                      {/* Buffer Area (±10% cone starting at Today and expanding to Day 90) */}
                      <path d={bufferPolygon} fill="url(#tisBufferConeGrad)" />
                      <path d={bufferUpperPath} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.45" />
                      <path d={bufferLowerPath} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.45" />

                      {/* Historical Curve (Day 1 to Today) */}
                      <path
                        d={historicalPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.4"
                        strokeOpacity="0.65"
                        strokeLinecap="round"
                      />

                      {/* Past Logged History Nodes */}
                      <circle cx={startX} cy={startY} r="3" fill="#10b981" opacity="0.6" />
                      <circle cx={65} cy={134} r="2.5" fill="#10b981" opacity="0.7" />
                      <circle cx={105} cy={122} r="2.5" fill="#10b981" opacity="0.7" />
                      <circle cx={145} cy={108} r="2.5" fill="#10b981" opacity="0.8" />

                      {/* Dynamic Projected Vector (from Today to Day 90) */}
                      <path
                        d={projectedPath}
                        fill="none"
                        stroke={isAhead ? 'url(#tisCurveGradient)' : isInBuffer ? '#10b981' : '#f59e0b'}
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />

                      {/* Pulsing "TODAY" Interactive Node */}
                      <circle
                        cx={todayX}
                        cy={todayY}
                        r="6"
                        fill="#10b981"
                        filter="url(#tisNodeGlow)"
                        className="transition-all duration-500 ease-out"
                      />
                      <circle
                        cx={todayX}
                        cy={todayY}
                        r="9"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="1.2"
                        opacity="0.6"
                        className="transition-all duration-500 ease-out animate-ping"
                      />

                      {/* Dynamic End Node Marker at Day 90 */}
                      <circle
                        cx={endX}
                        cy={projectedEndY}
                        r="5.5"
                        fill={isAhead ? '#34d399' : isInBuffer ? '#10b981' : '#f59e0b'}
                        filter="url(#tisNodeGlow)"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>

                    {/* Dynamic Status Badge Overlay */}
                    <div className="absolute right-2 top-2 px-2.5 py-1 rounded-md bg-background/90 border border-emerald-500/30 text-[10px] font-tech-mono text-emerald-400 backdrop-blur-sm shadow-md transition-all duration-300">
                      {isAhead ? `+${daysMargin}d Ahead • Accelerating` : isInBuffer ? 'Inside ±10% Buffer' : 'Buffer Absorbing Drift'}
                    </div>
                  </div>
                </div>

                {/* Live Telemetry Status Strip Under Graph */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl border border-border/70 bg-background/60 text-center">
                  <div>
                    <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">90D Trajectory</span>
                    <p className={`font-tech-mono font-bold text-xs sm:text-sm mt-0.5 ${isAhead ? 'text-emerald-400' : isInBuffer ? 'text-emerald-300' : 'text-amber-400'}`}>
                      {isAhead ? `+${daysMargin}d Margin` : isInBuffer ? 'Protected' : '-4d Off-Pace'}
                    </p>
                  </div>
                  <div className="border-x border-border/50 px-1">
                    <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Buffer Tolerance</span>
                    <p className="font-tech-mono font-bold text-xs sm:text-sm text-emerald-400 mt-0.5">
                      ±10% Safe Cone
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Daily Cadence</span>
                    <p className="font-tech-mono font-bold text-xs sm:text-sm text-foreground mt-0.5">
                      {completedCount}/3 Checked
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Tactile Daily Anchor Console */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                <div className="p-4 rounded-xl border border-border/80 bg-background/80 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-emerald-400" />
                      <span className="font-display font-semibold text-xs text-foreground tracking-wide uppercase">
                        DAILY ANCHOR (1 FOCUS + 2 ROUTINES)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusDone(false);
                        setRoutine1Done(false);
                        setRoutine2Done(false);
                      }}
                      className="text-[10px] font-tech-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors touch-target active:scale-[0.97]"
                      title="Reset Daily Tasks"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                  </div>

                  {/* Primary Focus Card (Interactive Toggle) */}
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
                    className={`mt-3 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none tactile-press active:scale-[0.98] ${
                      focusDone
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-border/80 bg-card hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-6 rounded-lg border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0 ${
                          focusDone
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                            : 'border-border/80 bg-background/60 text-transparent hover:border-emerald-500/50'
                        }`}
                      >
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-tech-mono font-semibold uppercase tracking-wider text-emerald-400">
                            PRIMARY FOCUS
                          </span>
                          <span className="text-[9px] font-tech-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            +35% THRUST
                          </span>
                        </div>
                        <p
                          className={`text-xs sm:text-sm font-medium mt-1 leading-snug transition-colors ${
                            focusDone ? 'line-through text-muted-foreground' : 'text-foreground font-semibold'
                          }`}
                        >
                          Ship core engine architecture & buffer specs
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Two Routines (Interactive Toggles) */}
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
                      className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer select-none tactile-press active:scale-[0.99] flex items-center justify-between ${
                        routine1Done
                          ? 'border-emerald-500/30 bg-card/60'
                          : 'border-border/60 bg-card/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            routine1Done
                              ? 'border-emerald-500/40 bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
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
                      <span className="text-[9px] font-tech-mono text-emerald-400/90 shrink-0 ml-2">
                        +10% CADENCE
                      </span>
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
                      className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer select-none tactile-press active:scale-[0.99] flex items-center justify-between ${
                        routine2Done
                          ? 'border-emerald-500/30 bg-card/60'
                          : 'border-border/60 bg-card/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            routine2Done
                              ? 'border-emerald-500/40 bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
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
                      <span className="text-[9px] font-tech-mono text-emerald-400/90 shrink-0 ml-2">
                        +10% HABIT SEAL
                      </span>
                    </div>
                  </div>

                  {/* Daily Cadence Progress Meter */}
                  <div className="mt-3.5 pt-3 border-t border-border/40">
                    <div className="flex justify-between text-[11px] font-tech-mono mb-1.5">
                      <span className="text-muted-foreground">Daily Cadence Execution</span>
                      <span className="text-emerald-400 font-bold">
                        {completedCount === 3
                          ? '100% (Peak Velocity)'
                          : completedCount === 2
                          ? '66% (Accelerating)'
                          : completedCount === 1
                          ? '33% (On Trajectory)'
                          : '0% (Buffer Absorbing)'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${(completedCount / 3) * 100}%` }}
                      />
                    </div>
                  </div>
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
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-foreground">1 Focus</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Daily Commitment Cap
              </p>
            </div>
            <div className="p-2">
              <p className="font-tech-mono font-bold text-2xl sm:text-3xl text-emerald-400">±10%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-tech-mono">
                Resilience Buffer
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
                Private & Offline-First
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIER 2: THE 3-STEP PROGRESSION METHODOLOGY (ACCORDION HOVER EXPANSION) ── */}
      <section id="method" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-tech-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            THE THREE PILLARS
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Three Steps to{' '}
            <span className="font-serif-display italic font-normal text-emerald-300">
              Quiet Follow-Through
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            Eliminate decision fatigue and maintain lifelong trajectory with three simple rules.
          </p>
        </div>

        {/* Hover-Accordion Card System: Hovering expands active card while siblings gently shrink */}
        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          {principles.map((p, index) => {
            const isHovered = hoveredStep === index;
            const isOtherHovered = hoveredStep !== null && hoveredStep !== index;

            return (
              <motion.div
                key={p.step}
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setHoveredStep(hoveredStep === index ? null : index)}
                style={{
                  flex: hoveredStep === null ? 1 : isHovered ? 1.55 : 0.72,
                }}
                className={`group relative rounded-2xl border p-5 sm:p-7 backdrop-blur-xl flex flex-col justify-between cursor-pointer transition-colors duration-300 ${
                  isHovered
                    ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/15 z-10 bg-card/90 ring-1 ring-emerald-500/30'
                    : isOtherHovered
                    ? 'opacity-70 border-border/50 bg-card/40'
                    : 'border-border/80 bg-card/70 shadow-lg'
                }`}
              >
                {/* Specular highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/50 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-tech-mono font-extrabold text-2xl sm:text-3xl text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                      {p.step}
                    </span>
                    <span className="text-[10px] font-tech-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {p.tag}
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

                {/* Visual Artifact Sneak-Peek (Displayed for all 3 cards with smooth height expansion on hover) */}
                {p.image && (
                  <motion.div
                    layout
                    className={`my-4 rounded-xl overflow-hidden border border-border/60 bg-black/40 relative transition-all duration-300 ${
                      isHovered ? 'h-36 sm:h-40' : 'h-28 sm:h-32'
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                )}

                <div className="mt-4 pt-3.5 border-t border-border/50 flex items-center justify-between text-xs font-tech-mono">
                  <span className="text-muted-foreground">Operating Rule</span>
                  <span className="text-emerald-400 font-semibold">{p.metric}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── TIER 3: DECLUTTERED SIDE-BY-SIDE ARCHITECTURAL COMPARISON ── */}
      <section id="comparison" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-tech-mono font-semibold text-emerald-400 uppercase tracking-widest">
            THE ARCHITECTURAL DIFFERENCE
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 tracking-tight">
            Why Typical Habit Apps{' '}
            <span className="font-serif-display italic font-normal text-rose-300">
              Fail You
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            Rigid streaks create anxiety and guilt. See how mathematical buffers absorb life&apos;s bumps so momentum compounds quietly.
          </p>

          {/* Mobile Switcher */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-6 p-1 rounded-xl border border-border/80 bg-background/80 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setActiveComparisonTab('sideBySide')}
              className={`flex-1 py-1.5 text-xs font-tech-mono rounded-lg transition-colors touch-target ${
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
              className={`flex-1 py-1.5 text-xs font-tech-mono rounded-lg transition-colors touch-target ${
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
              className={`flex-1 py-1.5 text-xs font-tech-mono rounded-lg transition-colors touch-target ${
                activeComparisonTab === 'tis'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              The System
            </button>
          </div>
        </div>

        {/* Spacious, Decluttered Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Column 1: Conventional Habit Apps */}
          <div
            className={`rounded-2xl border border-rose-500/25 bg-rose-500/[0.02] dark:bg-rose-950/10 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-sm ${
              activeComparisonTab === 'tis' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <X className="size-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      Conventional Habit Apps
                    </h3>
                    <p className="text-[10px] font-tech-mono text-rose-400">FRAGILE & GUILT-DRIVEN</p>
                  </div>
                </div>
                <span className="text-[10px] font-tech-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  THE CHURN TRAP
                </span>
              </div>

              {/* Clean, Non-Nested List Items with Generous Padding */}
              <div className="space-y-4">
                {comparisonFeatures.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-rose-500/10 last:border-b-0">
                    <div className="size-5 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                      <X className="size-3 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-tech-mono text-muted-foreground uppercase tracking-wider mb-0.5">
                        {item.dimension}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-rose-300 font-display">
                        {item.otherTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {item.otherDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-500/15 text-[11px] font-tech-mono text-rose-400/80 text-center">
              Result: 92% of users quit within 30 days due to broken streaks.
            </div>
          </div>

          {/* Column 2: The Improvement System */}
          <div
            className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-950/20 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden ${
              activeComparisonTab === 'other' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Top highlight bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      The Improvement System
                    </h3>
                    <p className="text-[10px] font-tech-mono text-emerald-400">MATHEMATICALLY RESILIENT</p>
                  </div>
                </div>
                <span className="text-[10px] font-tech-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  RECOMMENDED
                </span>
              </div>

              {/* Clean, Non-Nested List Items with Generous Padding */}
              <div className="space-y-4">
                {comparisonFeatures.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-emerald-500/15 last:border-b-0">
                    <div className="size-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-tech-mono text-emerald-400/80 uppercase tracking-wider mb-0.5">
                        {item.dimension}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-emerald-300 font-display">
                        {item.tisTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {item.tisDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-emerald-500/20 text-[11px] font-tech-mono text-emerald-400 text-center font-medium">
              Result: Lifelong momentum that compounds quietly through busy seasons.
            </div>
          </div>
        </div>
      </section>

      {/* ── TIER 4: PRECISION INSTRUMENT CLUSTER (WITH EMBEDDED AI VISUAL ARTIFACTS) ── */}
      <section id="instruments" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-tech-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            PRECISION TOOLING
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Precision{' '}
            <span className="font-serif-display italic font-normal text-emerald-300">
              Instrument Cluster
            </span>
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-tech-mono transition-all duration-200 touch-target ${
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
                    <span className="text-[10px] font-tech-mono text-emerald-400 uppercase tracking-widest">
                      PREDICTIVE HORIZON
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Trajectory Horizon Modeling
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-tech-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  90-Day Vector
                </span>
              </div>

              {/* Embedded AI Visual Artifact */}
              <div className="rounded-xl overflow-hidden border border-border/70 relative shadow-lg">
                <img
                  src="/images/tis_trajectory_core.jpg"
                  alt="Trajectory Modeling Interface"
                  loading="lazy"
                  className="w-full h-48 sm:h-64 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-tech-mono text-emerald-300">
                  <span>ORBITAL VECTOR ENVELOPE [TR-01]</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">CALCULATED</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Rather than demanding 100% daily perfection, the system calculates velocity against your 90-day target. At an 85% execution rate, you finish comfortably ahead of schedule.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Completion Target</span>
                  <p className="font-tech-mono font-bold text-sm text-foreground mt-1">90 Days</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Fixed Horizon</p>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Buffer Tolerance</span>
                  <p className="font-tech-mono font-bold text-sm text-emerald-400 mt-1">±10% Range</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Elastic safety buffer</p>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60">
                  <span className="text-[10px] font-tech-mono text-muted-foreground uppercase">Current Velocity</span>
                  <p className="font-tech-mono font-bold text-sm text-foreground mt-1">{velocity}x</p>
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
                    <span className="text-[10px] font-tech-mono text-emerald-400 uppercase tracking-widest">
                      CALM REASONING
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      The Diagnostic Mentor
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-tech-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Fluff
                </span>
              </div>

              {/* Embedded AI Visual Artifact */}
              <div className="rounded-xl overflow-hidden border border-border/70 relative shadow-lg">
                <img
                  src="/images/tis_mentor_intel.jpg"
                  alt="Diagnostic Mentor Interface"
                  loading="lazy"
                  className="w-full h-48 sm:h-64 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-tech-mono text-emerald-300">
                  <span>TELEMETRY REASONING ENGINE</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">SYSTEM NOMINAL</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Objective feedback strictly grounded in logged execution data. No quotes, guilt, or notification spam.
              </p>

              <div className="p-4 rounded-xl border border-border/80 bg-background/80 font-tech-mono text-xs space-y-2 text-muted-foreground">
                <div className="text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  &gt; TELEMETRY LOG #084 • ANALYSIS COMPLETE
                </div>
                <div className="pl-4 border-l border-border/60 space-y-1">
                  <div>Status: Inside Resilience Buffer (±10%)</div>
                  <div>Variance: -1.2% (Normal weekly variation)</div>
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
                    <span className="text-[10px] font-tech-mono text-emerald-400 uppercase tracking-widest">
                      PACE STABILITY
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Pace Buffer Guidance
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-tech-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Anti-Burnout
                </span>
              </div>

              {/* Embedded AI Visual Artifact */}
              <div className="rounded-xl overflow-hidden border border-border/70 relative shadow-lg">
                <img
                  src="/images/tis_buffer_cone.jpg"
                  alt="Buffer Resilience Physics"
                  loading="lazy"
                  className="w-full h-48 sm:h-64 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-tech-mono text-emerald-300">
                  <span>MATHEMATICAL BUFFER ABSORPTION</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">ACTIVE ENVELOPE</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Prevents both overexertion and drift. The system keeps you operating in your sweet spot so you sustain lifelong follow-through without burning out.
              </p>

              <div className="p-4 rounded-xl border border-border/70 bg-background/80 space-y-3">
                <div className="flex justify-between text-xs font-tech-mono">
                  <span className="text-muted-foreground">Cadence Stability Rating</span>
                  <span className="text-emerald-400 font-bold">Optimal (94%)</span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
                <div className="flex justify-between text-[10px] font-tech-mono text-muted-foreground pt-1">
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
                    <span className="text-[10px] font-tech-mono text-emerald-400 uppercase tracking-widest">
                      PRIVACY FIRST
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                      Local-First Encrypted Vault
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-tech-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Offline
                </span>
              </div>

              {/* Embedded AI Visual Artifact */}
              <div className="rounded-xl overflow-hidden border border-border/70 relative shadow-lg">
                <img
                  src="/images/tis_vault_shield.jpg"
                  alt="Offline Private Data Enclave"
                  loading="lazy"
                  className="w-full h-48 sm:h-64 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-tech-mono text-emerald-300">
                  <span>OFFLINE PRIVATE DATA ENCLAVE</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">AES-256 GCM</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your goals and focus habits are deeply personal. The Improvement System works completely offline with client-side persistence and end-to-end sync encryption. Zero ad trackers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Database className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-tech-mono font-medium text-foreground">Local SQLite / IndexedDB</p>
                    <p className="text-[10px] text-muted-foreground">Device persistence</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Shield className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-tech-mono font-medium text-foreground">Client Encryption</p>
                    <p className="text-[10px] text-muted-foreground">Zero-knowledge keys</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/70 bg-background/60 flex items-center gap-2.5">
                  <Zap className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-tech-mono font-medium text-foreground">Zero Third-Party Pixels</p>
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
            <span className="text-xs font-tech-mono font-semibold text-emerald-400 uppercase tracking-widest">
              INITIALIZE YOUR SYSTEM
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 mb-3 leading-tight">
              One focus today.{' '}
              <span className="font-serif-display italic font-normal text-emerald-300 block">
                Compounding evidence forever.
              </span>
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

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-tech-mono text-muted-foreground/80 mt-6 pt-4 border-t border-border/40">
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
