import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  TrendingUp,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';
import ComparisonTable from '@/components/ui/comparison-table';
import { Magnetic } from '@/components/ui/magnetic';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

// ── MONOCHROMATIC KINETIC MOTION BACKGROUND (VIVID, VISIBLE & VIEWED THROUGH GLASS) ──
function MonochromaticMeshBackground() {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const { resolvedMode } = useThemeContext();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.clientX / window.innerWidth;
      mousePosRef.current.y = e.clientY / window.innerHeight;
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    const isDark = resolvedMode === 'dark';

    // 5 Full-viewport harmonic trajectory waves (vividly visible on both dark & light modes)
    const waveLines = isDark
      ? [
          { amp: 36, freq: 0.0011, speed: 0.65, color: 'rgba(255, 255, 255, 0.46)', yOffset: height * 0.18, lineWidth: 2.2 },
          { amp: 48, freq: 0.0009, speed: 0.50, color: 'rgba(255, 255, 255, 0.52)', yOffset: height * 0.36, lineWidth: 2.6 },
          { amp: 32, freq: 0.0013, speed: 0.75, color: 'rgba(228, 228, 231, 0.38)', yOffset: height * 0.54, lineWidth: 2.0 },
          { amp: 42, freq: 0.0010, speed: 0.45, color: 'rgba(212, 212, 216, 0.34)', yOffset: height * 0.72, lineWidth: 2.0 },
          { amp: 50, freq: 0.0007, speed: 0.35, color: 'rgba(161, 161, 170, 0.26)', yOffset: height * 0.88, lineWidth: 1.8 },
        ]
      : [
          { amp: 36, freq: 0.0011, speed: 0.65, color: 'rgba(24, 24, 27, 0.38)', yOffset: height * 0.18, lineWidth: 2.2 },
          { amp: 48, freq: 0.0009, speed: 0.50, color: 'rgba(24, 24, 27, 0.44)', yOffset: height * 0.36, lineWidth: 2.6 },
          { amp: 32, freq: 0.0013, speed: 0.75, color: 'rgba(39, 39, 42, 0.32)', yOffset: height * 0.54, lineWidth: 2.0 },
          { amp: 42, freq: 0.0010, speed: 0.45, color: 'rgba(63, 63, 70, 0.28)', yOffset: height * 0.72, lineWidth: 2.0 },
          { amp: 50, freq: 0.0007, speed: 0.35, color: 'rgba(82, 82, 91, 0.22)', yOffset: height * 0.88, lineWidth: 1.8 },
        ];

    // 24 Traveling trajectory data beacons along wave contours with comet trails
    const particles = Array.from({ length: 24 }, (_, i) => ({
      x: (i / 24) * width,
      waveIndex: i % 5,
      speed: 0.35 + (i % 4) * 0.20,
      radius: i % 3 === 0 ? 3.0 : i % 2 === 0 ? 2.4 : 1.8,
      history: [] as { x: number; y: number }[],
    }));

    let time = 0;
    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Render flowing trajectory waves
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      waveLines.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        for (let x = 0; x <= width; x += 6) {
          const mouseDist = Math.hypot(x / width - mx, wave.yOffset / height - my);
          const mouseInfluence = Math.max(0, 1 - mouseDist * 2.2) * 22;
          const y =
            wave.yOffset +
            Math.sin(x * wave.freq + time * wave.speed) * wave.amp +
            Math.cos(x * wave.freq * 0.5 + time * 0.5) * 10 +
            mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Render traveling trajectory data particles with comet trails
      particles.forEach((p) => {
        p.x = (p.x + p.speed) % width;
        const wave = waveLines[p.waveIndex];
        const mouseDist = Math.hypot(p.x / width - mx, wave.yOffset / height - my);
        const mouseInfluence = Math.max(0, 1 - mouseDist * 2.2) * 22;
        const y =
          wave.yOffset +
          Math.sin(p.x * wave.freq + time * wave.speed) * wave.amp +
          Math.cos(p.x * wave.freq * 0.5 + time * 0.5) * 10 +
          mouseInfluence;

        p.history.push({ x: p.x, y });
        if (p.history.length > 5) p.history.shift();

        // Trailing comet tail
        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let h = 1; h < p.history.length; h++) {
            ctx.lineTo(p.history[h].x, p.history[h].y);
          }
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(24, 24, 27, 0.22)';
          ctx.lineWidth = p.radius * 0.9;
          ctx.stroke();
        }

        // Ambient glow halo
        ctx.beginPath();
        ctx.arc(p.x, y, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(24, 24, 27, 0.14)';
        ctx.fill();

        // Solid particle core
        ctx.beginPath();
        ctx.arc(p.x, y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(24, 24, 27, 0.85)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldReduceMotion, resolvedMode]);

  const { scrollYProgress } = useScroll();
  const orb1Y = useTransform(scrollYProgress, [0, 1], [-20, 80]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Precision Trajectory Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.10] dark:opacity-[0.12] text-foreground transition-opacity"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0.2) 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0.2) 90%)',
        }}
      />

      {/* Kinetic Monochromatic Wave Canvas */}
      {!shouldReduceMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100" />
      )}

      {/* Ambient Volumetric Diffusions (Image 01: Parallax layers at different speeds) */}
      <motion.div style={{ y: orb1Y }} className="absolute -top-32 -left-24 w-[540px] h-[540px] rounded-full bg-zinc-400/[0.18] dark:bg-white/[0.06] blur-[140px] pointer-events-none" />
      <motion.div style={{ y: orb2Y }} className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-zinc-500/[0.14] dark:bg-zinc-700/20 blur-[150px] pointer-events-none" />
      <motion.div style={{ y: orb3Y }} className="absolute -bottom-32 left-1/3 w-[480px] h-[480px] rounded-full bg-zinc-400/[0.16] dark:bg-white/[0.05] blur-[140px] pointer-events-none" />
    </div>
  );
}

// ── UNIQUE FUN TACTILE THEME TOGGLE (NEOSKEUOMORPHIC ANALOG INSTRUMENT SWITCH) ──
function TactileThemeToggle() {
  const { resolvedMode, setMode } = useThemeContext();
  const { playTap } = useSoundEffects();
  const isDark = resolvedMode === 'dark';

  const handleToggle = () => {
    playTap();
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={handleToggle}
      className={cn(
        "relative flex items-center h-8 sm:h-9 w-[76px] sm:w-[82px] p-1 rounded-full cursor-pointer select-none transition-all duration-300",
        "border border-white/25 dark:border-white/15",
        "bg-zinc-200/95 dark:bg-zinc-900/95",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.18),0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.08)]",
        "hover:border-foreground/40 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground",
        isDark ? "justify-end" : "justify-start"
      )}
    >
      {/* Background mechanical track indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none select-none">
        <span
          className={cn(
            "text-[8px] sm:text-[9px] font-tech-mono font-bold tracking-widest transition-opacity duration-200",
            isDark ? "opacity-100 text-zinc-400" : "opacity-0"
          )}
        >
          LUNAR
        </span>
        <span
          className={cn(
            "text-[8px] sm:text-[9px] font-tech-mono font-bold tracking-widest transition-opacity duration-200 ml-auto",
            !isDark ? "opacity-100 text-zinc-600" : "opacity-0"
          )}
        >
          SOLAR
        </span>
      </div>

      {/* Kinetic Knob with spring physics & celestial core */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className={cn(
          "size-6 sm:size-7 rounded-full flex items-center justify-center relative z-10",
          "bg-white dark:bg-zinc-800 text-foreground",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.25)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.6)]"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative flex items-center justify-center"
            >
              <Moon className="size-3.5 sm:size-4 fill-zinc-100 text-zinc-100" />
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1 text-[7px] text-zinc-200 select-none pointer-events-none"
              >
                ✦
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative flex items-center justify-center"
            >
              <Sun className="size-3.5 sm:size-4 text-zinc-950 stroke-[2.4]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 size-3.5 sm:size-4 border border-zinc-950/20 rounded-full border-dashed pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

// ── THE THREE PILLARS (BENEFIT-ORIENTED, EXPLAINING WHAT, WHY, AND WHAT PROBLEM IT PREVENTS) ──
const principles = [
  {
    step: '01',
    eyebrow: 'DAILY CLARITY',
    title: 'One Focus Each Day',
    what: 'Lock in your single highest-leverage task every morning before touching anything else.',
    why: 'Cognitive bandwidth is finite. Sustained velocity comes from completing one decisive outcome, not checking off 20 trivial errands.',
    prevents: 'Prevents decision fatigue, backlog paralysis, and that hollow feeling of being busy without making real progress.',
    rule: 'Strict 1 Focus Cap',
    icon: Target,
  },
  {
    step: '02',
    eyebrow: 'HABIT STABILITY',
    title: 'Two Supporting Routines',
    what: 'Anchor two lightweight non-negotiable rituals that protect your energy and foundation.',
    why: 'Routines preserve personal stability on both high-energy days and exhausting, chaotic ones without requiring willpower.',
    prevents: 'Prevents turning your life into an unsustainable 15-item habit checklist that inevitably collapses.',
    rule: '2 Routine Anchor',
    icon: Layers,
  },
  {
    step: '03',
    eyebrow: 'RESILIENT PROGRESS',
    title: 'The ±10% Trajectory Buffer',
    what: 'A mathematical tolerance corridor calibrated over your cumulative 90-day trajectory.',
    why: 'Streaks are static counters that shatter on an off-day. Trajectory is dynamic velocity that measures cumulative achievement.',
    prevents: 'Prevents the all-or-nothing guilt spiral. Your streak may reset, but your 90-day trajectory never restarts at zero.',
    rule: 'Dynamic Trajectory Protection',
    icon: Compass,
  },
];

// ── PIN + TRANSFORM SCROLL STORYTELLING ENGINE (IMAGE 01 & 02 CONCEPTS) ──
function PinAndTransformWorkflow({ isDark }: { isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      if (latest < 0.28) setActiveStep(0);
      else if (latest < 0.55) setActiveStep(1);
      else if (latest < 0.82) setActiveStep(2);
      else setActiveStep(3);
    });
  }, [scrollYProgress]);

  // Scrub bar translation directly linked to scroll progress (IMAGE 01: SCRUB)
  const scrubHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const steps = [
    {
      num: '01',
      title: 'Choose Direction',
      tag: 'DAY 01 // HORIZON',
      desc: 'Define the single meaningful objective you want to achieve over the next 90 days. We compute your nominal baseline trajectory.',
      metric: '1.00x Baseline Velocity',
      badge: 'Target Locked',
      icon: Target,
    },
    {
      num: '02',
      title: "Lock Today's Focus",
      tag: 'DAILY THRUST (+35%)',
      desc: 'Each morning, select the one decisive needle-mover. Completing it generates +35% thrust, lifting your forward vector above baseline.',
      metric: '+35% Daily Thrust Added',
      badge: 'Needle-Mover Active',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Anchor 2 Routines',
      tag: 'CADENCE STABILIZERS',
      desc: 'Lock in two lightweight companion routines that stabilize your daily cadence. Together, they compound into peak 1.25x velocity.',
      metric: '1.25x Peak Velocity (+16d Margin)',
      badge: 'Dual Cadence Anchored',
      icon: Layers,
    },
    {
      num: '04',
      title: 'Trajectory Absorbs the Shock',
      tag: '±10% BUFFER CONE',
      desc: "When life interrupts, you don't lose 60 days. The ±10% mathematical buffer absorbs the deviation. Streaks reset; your trajectory continues.",
      metric: '1.08x Resilient Velocity (Protected)',
      badge: 'Shock Absorbed',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20">
      {/* Section Header with Clip Reveal & Fade+Lift (IMAGE 02: REVEAL) */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 mb-3 shadow-xs"
        >
          <span className="size-1.5 rounded-full bg-foreground" />
          <span className="text-[10px] sm:text-[11px] font-tech-mono font-medium text-foreground tracking-wider uppercase">
            01 // SCROLL STORYTELLING • PIN + TRANSFORM
          </span>
        </motion.div>

        <motion.h2
          initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)', opacity: 0.3 }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight"
        >
          How The System Works In Practice
        </motion.h2>

        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed"
        >
          Scroll to watch how a single daily focus and the ±10% buffer transform chaotic intentions into compounding trajectory.
        </motion.p>
      </div>

      {/* ── DESKTOP PIN + TRANSFORM EXPERIENCE (IMAGE 01: PIN + TRANSFORM) ── */}
      <div ref={containerRef} className="hidden md:block relative h-[260vh]">
        {/* Sticky Viewport Stage: Section stays pinned while content transforms */}
        <div className="sticky top-28 h-[calc(100vh-140px)] min-h-[580px] max-h-[680px] flex items-center">
          <div className="w-full grid grid-cols-12 gap-8 items-center">
            
            {/* Left Column: The Pinned Living Console (Transforms state with scroll) */}
            <div className="col-span-7">
              <div className="relative rounded-2xl md:rounded-3xl border border-white/15 dark:border-white/10 bg-card/85 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_20px_50px_rgba(0,0,0,0.4)] p-6 overflow-hidden tis-specular-box">
                
                {/* Console HUD Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs font-tech-mono">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-foreground animate-pulse" />
                    <span className="font-bold text-foreground">
                      STAGE {steps[activeStep].num} // {steps[activeStep].tag}
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] text-foreground font-semibold">
                    {steps[activeStep].badge}
                  </div>
                </div>

                {/* Animated Graphic Display: Transforms based on activeStep */}
                <div className="relative h-64 w-full rounded-xl bg-background/80 border border-white/10 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                  {/* Background grid lines */}
                  <div
                    className="absolute inset-0 opacity-[0.08] pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Dynamic SVG Visuals for each Step (Preserve 1:1 true aspect ratio & non-scaling strokes) */}
                  <svg className="w-full h-44 relative z-10" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="pinBufferGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.08 : 0.04} />
                        <stop offset="100%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.22 : 0.12} />
                      </linearGradient>
                    </defs>

                    {/* Baseline Grid Guides */}
                    <line x1="20" y1="130" x2="380" y2="130" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                    <line x1="20" y1="40" x2="380" y2="40" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />

                    {/* Step 0: Initializing Horizon */}
                    {activeStep === 0 && (
                      <g>
                        <line x1="30" y1="120" x2="370" y2="45" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                        <circle cx="30" cy="120" r="5" fill="currentColor" />
                        <circle cx="370" cy="45" r="5" fill="currentColor" fillOpacity="0.5" />
                        <text x="40" y="125" fill="currentColor" fontSize="10" fontFamily="monospace">DAY 01 (ORIGIN)</text>
                        <text x="270" y="38" fill="currentColor" fontSize="10" fontFamily="monospace">DAY 90 HORIZON</text>
                      </g>
                    )}

                    {/* Step 1: Focus Injection (+35% Thrust) */}
                    {activeStep === 1 && (
                      <g>
                        <path d="M 30,120 Q 180,95 240,65" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                        <circle cx="240" cy="65" r="6" fill="currentColor" />
                        <line x1="240" y1="65" x2="370" y2="35" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                        <text x="170" y="55" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="monospace">+35% THRUST INJECTED</text>
                      </g>
                    )}

                    {/* Step 2: 2 Routines Anchored (Compounding Ascent) */}
                    {activeStep === 2 && (
                      <g>
                        <path d="M 30,120 C 130,110 200,60 370,22" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                        <circle cx="370" cy="22" r="6" fill="currentColor" />
                        <text x="230" y="20" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="monospace">1.25x PEAK VELOCITY</text>
                      </g>
                    )}

                    {/* Step 3: Buffer Absorbs The Shock */}
                    {activeStep === 3 && (
                      <g>
                        {/* Buffer Cone Polygon */}
                        <path d="M 180,68 C 240,60 320,30 380,24 L 380,54 C 320,50 240,78 180,82 Z" fill="url(#pinBufferGrad)" />
                        <path d="M 180,68 C 240,60 320,30 380,24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                        <path d="M 180,82 C 240,78 320,50 380,54" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                        
                        {/* Trajectory with temporary dip cushioned inside buffer */}
                        <path d="M 30,120 C 120,110 180,72 230,76 C 280,80 320,40 375,34" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                        
                        {/* Shock absorption marker (clean true circle, non-scaling stroke) */}
                        <circle cx="230" cy="76" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <text x="200" y="98" fill="currentColor" fontSize="10" fontFamily="monospace">DIP ABSORBED</text>
                        <text x="250" y="30" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="monospace">90D TARGET PRESERVED</text>
                      </g>
                    )}
                  </svg>

                  {/* Bottom Console Telemetry Readout */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] font-tech-mono">
                    <span className="text-muted-foreground">VELOCITY ENGINE:</span>
                    <span className="text-foreground font-bold">{steps[activeStep].metric}</span>
                  </div>
                </div>

                {/* Subtext description below graphic */}
                <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-white/5 flex items-center justify-between text-xs font-tech-mono">
                  <span className="text-muted-foreground">
                    {activeStep === 3
                      ? 'Streak Apps: Reset to 0 ❌  |  TIS: Trajectory Absorbs Drift ✓'
                      : 'Deterministic Trajectory • 1 Primary Focus + 2 Routines'}
                  </span>
                  <span className="text-foreground font-semibold">
                    STEP {activeStep + 1} OF 4
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: The 4 Steps Storytelling Stream with Scrub Track (IMAGE 01: SCRUB) */}
            <div className="col-span-5 relative pl-6">
              {/* Vertical Scrub Track */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  style={{ height: scrubHeight }}
                  className="w-full bg-foreground origin-top"
                />
              </div>

              {/* Step Cards */}
              <div className="space-y-4">
                {steps.map((s, idx) => {
                  const isActive = activeStep === idx;
                  const Icon = s.icon;

                  return (
                    <div
                      key={s.num}
                      className={cn(
                        "relative p-4 rounded-xl border transition-all duration-300",
                        isActive
                          ? "bg-card/90 border-white/30 shadow-xl scale-[1.02] opacity-100"
                          : "bg-card/30 border-white/5 opacity-40 scale-95"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-6 rounded-md flex items-center justify-center text-xs font-tech-mono font-bold transition-colors",
                            isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                          )}>
                            {s.num}
                          </div>
                          <h3 className={cn(
                            "font-display font-bold text-sm transition-colors",
                            isActive ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {s.title}
                          </h3>
                        </div>
                        <Icon className={cn("size-4 transition-colors", isActive ? "text-foreground" : "text-muted-foreground")} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE RESPONSIVE CARDS (FADE + LIFT & STAGGER - IMAGE 02) ── */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 sm:p-5 rounded-xl border border-white/10 bg-card/75 backdrop-blur-md tis-specular-box flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-tech-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                    STEP {s.num}
                  </span>
                  <Icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {s.desc}
                </p>
              </div>
              <div className="pt-2.5 border-t border-border/50 text-[10px] font-tech-mono text-foreground font-semibold flex items-center justify-between">
                <span>{s.metric}</span>
                <span className="text-muted-foreground">{s.badge}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { resolvedMode } = useThemeContext();
  const isDark = resolvedMode === 'dark';
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Differential Parallax Layers (IMAGE 01: PARALLAX - Layers move at different speeds)
  const heroParallaxFast = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const heroParallaxSlow = useTransform(scrollYProgress, [0, 0.25], [0, 35]);

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

  // User activity tracker: immediately hides simulated cursor on touch/click, resumes tour after 4s idle
  const handleUserActivity = useCallback(() => {
    setIsPlayingWalkthrough(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsPlayingWalkthrough(true);
    }, 4000);
  }, []);

  // Responsive desktop detection for Three Steps hover expansion
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Viewport intersection observer: only run walkthrough when console is visible
  const [isConsoleVisible, setIsConsoleVisible] = useState<boolean>(false);
  useEffect(() => {
    const el = document.getElementById('sneak-peek-frame');
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setIsConsoleVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsConsoleVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Passive user activity listener on console container
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    const onUserInteract = () => handleUserActivity();
    el.addEventListener('click', onUserInteract, { passive: true });
    return () => el.removeEventListener('click', onUserInteract);
  }, [handleUserActivity]);

  // ── TRAJECTORY MATHEMATICS & FIXED PAST CONTINUITY ──
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
  const fixedTodayX = 220;
  const fixedTodayY = 104; // Exact center of nominal corridor at Today milestone
  const endX = 465;
  const targetHorizonY = 54;

  // ── 1. PAST HISTORICAL LINE: COMPLETELY FIXED (NEVER MOVES ON TASK INTERACTION) ──
  // The past has already happened; history does not retroactively change when you toggle today's checkboxes.
  const historicalPath = `M ${startX},${startY} C ${startX + 50},${startY - 6} 174,129 ${fixedTodayX},${fixedTodayY}`;

  // ── 2. FIXED NOMINAL ±10% BUFFER CORRIDOR (STATIONARY MATHEMATICAL CORRIDOR) ──
  // The tolerance corridor stays fixed so the dynamic forward projection line moves relative to it.
  const bufferUpperPath = `M ${fixedTodayX},96 C ${fixedTodayX + 60},84 ${endX - 60},40 ${endX},36`;
  const bufferLowerPath = `M ${fixedTodayX},112 C ${fixedTodayX + 60},104 ${endX - 60},68 ${endX},72`;
  const bufferPolygon = `M ${fixedTodayX},96 C ${fixedTodayX + 60},84 ${endX - 60},40 ${endX},36 L ${endX},72 C ${endX - 60},68 ${fixedTodayX + 60},104 ${fixedTodayX},112 Z`;

  // ── 3. ONLY THE CURVED LINE AFTER TODAY MOVES DYNAMICALLY ──
  // Projected Day 90 endpoint based on completed thrust
  const projectedEndY = focusDone
    ? routine1Done && routine2Done
      ? 28 // Peak Velocity (well ahead of upper corridor 36)
      : routine1Done || routine2Done
      ? 40 // Ahead (inside top corridor)
      : 52 // On Target (near nominal horizon 54)
    : routine1Done || routine2Done
    ? 68 // Inside lower buffer
    : 86; // Buffer absorbing drift

  // Dynamic cubic bezier starts from (fixedTodayX, fixedTodayY) and branches forward to (endX, projectedEndY)
  const ctrl1X = fixedTodayX + 55; // 275
  const ctrl1Y = fixedTodayY - (fixedTodayY - projectedEndY) * 0.42;
  const ctrl2X = endX - 55; // 410
  const ctrl2Y = projectedEndY + 8;
  const projectedPath = `M ${fixedTodayX},${fixedTodayY} C ${ctrl1X},${ctrl1Y} ${ctrl2X},${ctrl2Y} ${endX},${projectedEndY}`;

  // ── SNEAK PEEK AUTO-PLAYING SIMULATED MOUSE ENGINE ──
  useEffect(() => {
    if (!isPlayingWalkthrough || !isConsoleVisible) return;

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
      await wait(150);
      if (cancelled) return;

      while (!cancelled) {
        startTime = Date.now();
        setVideoElapsedSec(0);

        // Reset tasks
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

        await wait(600);
        if (cancelled) return;

        // Click down on Primary Focus
        setIsClicking(true);
        setActivePressedTarget('focus');
        setCursorLabel('+35% Thrust');
        setFocusDone(true);
        await wait(320);
        if (cancelled) return;

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

        await wait(300);
        if (cancelled) return;
        setIsClicking(true);
        setActivePressedTarget('routine1');
        setCursorLabel('+10% Cadence');
        setRoutine1Done(true);
        await wait(320);
        if (cancelled) return;

        setIsClicking(false);
        setActivePressedTarget(null);
        await wait(700);
        if (cancelled) return;

        // Phase 3: Glide across to Fixed Today Milestone
        setCursorLabel('Today Milestone (Fixed)');
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

        await wait(300);
        if (cancelled) return;
        setIsClicking(true);
        setActivePressedTarget('routine2');
        setCursorLabel('Peak Velocity (1.25x)');
        setRoutine2Done(true);
        await wait(320);
        if (cancelled) return;

        setIsClicking(false);
        setActivePressedTarget(null);
        await wait(800);
        if (cancelled) return;

        // Phase 5: Glide to Velocity Index badge
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
  }, [isPlayingWalkthrough, isConsoleVisible]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground selection:bg-foreground/20 selection:text-foreground">
      {/* ── IMAGE 01: SCROLL SCRUB PROGRESS BAR (MOTION FOLLOWS SCROLL PROGRESS) ── */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 inset-x-0 h-[2.5px] bg-foreground z-[70] pointer-events-none opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.6)] dark:shadow-[0_0_10px_rgba(255,255,255,0.35)]"
      />

      {/* ── HIGH-CONTRAST MONOCHROMATIC KINETIC MESH BACKGROUND ── */}
      <MonochromaticMeshBackground />

      {/* ── AUTHENTIC NOTHING OS FROSTED & REEDED GLASS OVERLAY ── */}
      {/* Renders a physical liquid frosted glass pane over the kinetic background, diffusing sharp edges and making typography pop while keeping motion 100% visible */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Layer 1: Frosted Liquid Glass Pane with Saturation Boost */}
        <div
          className="absolute inset-0 backdrop-blur-[2.5px] sm:backdrop-blur-[3.5px] backdrop-saturate-[140%] transition-colors duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(10, 10, 14, 0.12)' : 'rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* Layer 2: Nothing OS Signature Reeded / Fluted Glass Texture */}
        <div
          className="absolute inset-0 opacity-[0.45] dark:opacity-[0.40] transition-opacity"
          style={{
            backgroundImage: isDark
              ? 'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 15px)'
              : 'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.035) 0px, rgba(0, 0, 0, 0.035) 1px, transparent 1px, transparent 15px)',
          }}
        />

        {/* Layer 3: Diagonal Specular Sheen & Glass Glare */}
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 35%, transparent 65%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.10) 35%, transparent 65%)',
          }}
        />

        {/* Layer 4: Central Typography Focus Atmosphere Lens (Softly nullifies background lines right behind headline) */}
        <div
          className="absolute inset-0 backdrop-blur-[6px] sm:backdrop-blur-[8px]"
          style={{
            maskImage: 'radial-gradient(ellipse 55% 42% at 50% 32%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 55% 42% at 50% 32%, black 20%, transparent 75%)',
            background: isDark
              ? 'radial-gradient(ellipse 55% 42% at 50% 32%, rgba(10, 10, 14, 0.35) 0%, rgba(10, 10, 14, 0.15) 50%, transparent 75%)'
              : 'radial-gradient(ellipse 55% 42% at 50% 32%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 50%, transparent 75%)',
          }}
        />

        {/* Layer 5: Subtle Glass Specular Border Bezel */}
        <div className="absolute inset-0 border border-white/[0.04] dark:border-white/[0.03]" />
      </div>

      {/* Progressive Top Glass Blur Wash (Content fades smoothly under navbar) */}
      <div className="fixed top-0 inset-x-0 h-20 pointer-events-none z-40 bg-gradient-to-b from-background/85 via-background/40 to-transparent backdrop-blur-[3px]" />

      {/* ── HIGH-END LIQUID FROSTED GLASS FLOATING NAVBAR (ISLAND DOCK) ── */}
      <header className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-6 md:inset-x-8 max-w-5xl mx-auto z-50 tis-glass-island rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 rounded-xl bg-card/90 border border-white/20 dark:border-white/10 shadow-xs shrink-0 backdrop-blur-md">
              <SystemLogo size={22} className="sm:hidden" />
              <SystemLogo size={26} className="hidden sm:block" />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="font-display font-extrabold text-xs sm:text-sm tracking-tight text-foreground uppercase truncate">
                The Improvement System
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-tech-mono font-medium tracking-wider bg-muted/80 text-muted-foreground border border-border/80">
                <span className="size-1.5 rounded-full bg-foreground" />
                LOCAL ENCLAVE
              </span>
            </div>
          </div>


          {/* Right Action Island: Tactile Theme Switcher + Tactile Log In Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Unique Tactile Dark/Light Mode Slider */}
            <TactileThemeToggle />

            {/* Tactile Log In Button with Specular Edge & Magnetic Hover */}
            <Magnetic strength={0.18}>
              <Button
                variant="default"
                size="sm"
                data-cuelume-press="press"
                data-cuelume-release="release"
                data-cuelume-hover="tick"
                onClick={() => navigate('/auth')}
                className="text-xs px-3.5 sm:px-4 h-8 sm:h-9 font-display font-semibold shadow-xs active:scale-[0.96] rounded-full transition-transform"
              >
                <span>Log In</span>
              </Button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: HUMAN OUTCOME FIRST, THEN SYSTEM MECHANISM ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-8 sm:pb-16 text-center">
        {/* Differential Parallax Floating Telemetry Chips (IMAGE 01: PARALLAX - Layers move at different speeds) */}
        <motion.div
          style={{ y: heroParallaxSlow }}
          className="hidden xl:flex absolute top-36 left-4 lg:left-8 items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 dark:border-white/10 bg-card/70 backdrop-blur-xl text-[11px] font-tech-mono text-muted-foreground shadow-lg tis-specular-box pointer-events-none select-none z-20"
        >
          <span className="size-2 rounded-full bg-foreground animate-pulse" />
          <span className="text-foreground font-semibold">Velocity: 1.25x</span>
          <span className="text-muted-foreground">• +16d Margin</span>
        </motion.div>

        <motion.div
          style={{ y: heroParallaxFast }}
          className="hidden xl:flex absolute top-52 right-4 lg:right-8 items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 dark:border-white/10 bg-card/70 backdrop-blur-xl text-[11px] font-tech-mono text-muted-foreground shadow-lg tis-specular-box pointer-events-none select-none z-20"
        >
          <ShieldCheck className="size-3.5 text-foreground" />
          <span className="text-foreground font-semibold">±10% Safety Buffer</span>
          <span className="text-muted-foreground">• Drift Absorbed</span>
        </motion.div>

        {/* Eyebrow with Fade + Lift (IMAGE 02: FADE + LIFT) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 mb-4 sm:mb-5 shadow-xs"
        >
          <Sparkles className="size-3.5 text-foreground shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-tech-mono font-medium text-foreground tracking-wider uppercase">
            <span className="hidden sm:inline">Personal Trajectory Engine • Dynamic Vector, Not Static Streaks</span>
            <span className="sm:hidden">Dynamic Trajectory • ±10% Buffer</span>
          </span>
        </motion.div>

        {/* Main Headline: Outcome-First with Monochromatic Gradient & Clip Reveal (IMAGE 02: CLIP REVEAL - Content gets uncovered) */}
        <motion.h1
          initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.12] mb-3 sm:mb-5 max-w-4xl mx-auto px-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          <span className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-950 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent block sm:inline">
            You don't need to be perfect
          </span>{' '}
          <span className="bg-gradient-to-b from-black via-zinc-950 to-black dark:from-white dark:via-zinc-50 dark:to-zinc-200 bg-clip-text text-transparent font-black block sm:inline">
            to keep improving.
          </span>
        </motion.h1>

        {/* Editorial Subline & Supporting Copy with Fade + Lift (IMAGE 02: FADE + LIFT) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
          className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2 space-y-2"
        >
          <p className="text-sm sm:text-lg font-medium text-foreground font-display drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
            Streaks are static; trajectory is dynamic. One daily focus cushioned by a ±10% mathematical buffer.
          </p>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            <span className="hidden sm:inline">
              Streaks are fragile binary counters—miss once and 60 days vanish into zero. The Improvement System prioritizes Trajectory: a wholesome, velocity-based measure of real progress with a ±10% buffer that absorbs life's volatility so your 90-day momentum never dies.
            </span>
            <span className="sm:hidden">
              Streaks are static and shatter on day one. We protect your 90-day trajectory with 1 focus, 2 routines, and an elastic ±10% buffer cone.
            </span>
          </p>
        </motion.div>

        {/* Primary CTA Row & Prominent Free Forever Trust Signals with Fade + Lift */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
          className="flex flex-col items-center justify-center gap-3 mb-8 sm:mb-12 px-3 max-w-md sm:max-w-none mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            <Magnetic strength={0.25}>
              <Button
                variant="default"
                data-cuelume-press="press"
                data-cuelume-release="release"
                data-cuelume-hover="tick"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto h-11 sm:h-12 px-7 sm:px-9 font-display text-xs sm:text-sm font-semibold shadow-lg active:scale-[0.96] rounded-xl group transition-transform"
              >
                <span>Start My 90-Day Trajectory</span>
                <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Button>
            </Magnetic>
            <Button
              variant="outline"
              data-cuelume-press="press"
              data-cuelume-release="release"
              data-cuelume-hover="tick"
              onClick={() => {
                const el = document.getElementById('sneak-peek-frame');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground border-border/80 bg-card/60 backdrop-blur-md active:scale-[0.96] rounded-xl transition-transform"
            >
              <span>Watch Live Preview</span>
            </Button>
          </div>

          {/* Prominent Trust Signal with Staggered entrance */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-tech-mono text-muted-foreground/90 mt-1"
          >
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Check className="size-3.5 text-foreground" />
              Free Forever
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3 text-muted-foreground" />
              100% Private Offline Vault
            </span>
            <span>•</span>
            <span className="hidden sm:inline">No Credit Card Required</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── PRODUCT SNEAK PEEK CONSOLE (LIVE INTERACTIVE TRAJECTORY) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-8">
        <div
          id="sneak-peek-frame"
          className="relative max-w-5xl mx-auto text-left"
        >
          {/* Hardware Frame with Liquid Frosted Glass and Monochromatic Specular Rim */}
          <div className="relative rounded-2xl md:rounded-3xl border border-white/15 dark:border-white/10 bg-card/85 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.3),0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden tis-specular-box">
            {/* Top Bar HUD */}
            <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 dark:border-white/10 bg-muted/30 text-xs font-tech-mono backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                <span className="ml-2 text-[11px] text-muted-foreground hidden sm:inline">
                  LIVE PRODUCT SNEAK PEEK // TRAJECTORY VISUALIZER
                </span>
                <span className="ml-1 text-[10px] text-muted-foreground sm:hidden">
                  LIVE TRAJECTORY
                </span>
              </div>

              {/* Mode Badge */}
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
              {/* Simulated Human Mouse Cursor */}
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

                      {/* Contextual Action Pill */}
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

              {/* Status Header: Removed 'DAY 41 OF 90' text as requested */}
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
                    </div>
                    <p className="hidden sm:block text-xs text-muted-foreground font-tech-mono mt-0.5">
                      Fixed history • Dynamic forward trajectory updates with daily execution
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
                        Fixed History → Projected Trajectory
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-muted-foreground/30 border border-border" />
                        Stationary ±10% Buffer
                      </span>
                      <span className="text-foreground font-semibold">D1 → D90</span>
                    </div>

                    {/* SVG Trajectory Canvas: Past Line is Fixed, Buffer is Fixed, Only Forward Curve Moves */}
                    <div ref={graphNodeRef} className="relative h-40 sm:h-52 w-full">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 500 210"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id="monochromeBufferGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.09 : 0.05} />
                            <stop offset="100%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.22 : 0.14} />
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

                        {/* Vertical Indicator: FIXED TODAY Milestone */}
                        <line x1={fixedTodayX} y1={24} x2={fixedTodayX} y2={186} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="2 2" />
                        <text x={fixedTodayX} y={198} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace" fontWeight="bold">
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

                        {/* 1. FIXED ±10% Buffer Cone (Does Not Move) */}
                        <path d={bufferPolygon} fill="url(#monochromeBufferGrad)" />
                        <path d={bufferUpperPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity={isDark ? 0.45 : 0.35} />
                        <path d={bufferLowerPath} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity={isDark ? 0.45 : 0.35} />

                        {/* 2. FIXED Past Historical Line (D1 -> Today) (Does Not Move on checkbox toggles) */}
                        <path
                          d={historicalPath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeOpacity="0.65"
                          strokeLinecap="round"
                        />

                        {/* Past History Nodes (Fixed) */}
                        <circle cx={startX} cy={startY} r="3" fill="currentColor" opacity="0.6" />
                        <circle cx={90} cy={160} r="2.5" fill="currentColor" opacity="0.6" />
                        <circle cx={150} cy={142} r="2.5" fill="currentColor" opacity="0.7" />

                        {/* 3. ONLY THE CURVED LINE AFTER TODAY MOVES DYNAMICALLY */}
                        <motion.path
                          d={projectedPath}
                          initial={{ d: projectedPath }}
                          animate={{ d: projectedPath }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          filter="url(#monochromeGlow)"
                        />

                        {/* TODAY Anchor Node (Fixed at (fixedTodayX, fixedTodayY)) */}
                        <circle
                          ref={todayCircleRef}
                          cx={fixedTodayX}
                          cy={fixedTodayY}
                          r="5.5"
                          fill="currentColor"
                        />
                        <circle
                          cx={fixedTodayX}
                          cy={fixedTodayY}
                          r="9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeOpacity="0.4"
                          vectorEffect="non-scaling-stroke"
                        />

                        {/* Dynamic Forward Projected Goal Node at Day 90 */}
                        <motion.circle
                          cx={endX}
                          cy={projectedEndY}
                          initial={{ cy: projectedEndY }}
                          animate={{ cy: projectedEndY }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          r="5.5"
                          fill="currentColor"
                        />
                      </svg>

                      {/* Embedded Telemetry Status Badge */}
                      <div className="absolute right-2 top-2 px-2.5 py-1 rounded-md bg-card/90 border border-white/10 text-[10px] font-tech-mono text-foreground backdrop-blur-md shadow-sm">
                        {isAhead ? `+${daysMargin}d Ahead • Accelerating` : isInBuffer ? 'Inside ±10% Buffer' : 'Buffer Absorbing Drift'}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Strip Under Graph */}
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
                        data-cuelume-press="toggle"
                        data-cuelume-hover="tick"
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

                    {/* Primary Focus Card (Image 04: Press + Spring feedback) */}
                    <div
                      role="button"
                      tabIndex={0}
                      data-cuelume-press="press"
                      data-cuelume-release="release"
                      data-cuelume-hover="tick"
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
                      className={`mt-2.5 sm:mt-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.96] ${
                        activePressedTarget === 'focus' ? 'scale-[0.96] ring-1 ring-foreground/30 shadow-sm' : ''
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
                        data-cuelume-press="press"
                        data-cuelume-release="release"
                        data-cuelume-hover="tick"
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
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.96] flex items-center justify-between ${
                          activePressedTarget === 'routine1' ? 'scale-[0.96] ring-1 ring-foreground/30 shadow-sm' : ''
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
                        data-cuelume-press="press"
                        data-cuelume-release="release"
                        data-cuelume-hover="tick"
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
                        className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-[0.96] flex items-center justify-between ${
                          activePressedTarget === 'routine2' ? 'scale-[0.96] ring-1 ring-foreground/30 shadow-sm' : ''
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

            {/* Bottom Bar: Timeline Scrubber */}
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
        </div>
      </section>

      {/* ── SECTION: THIS IS FOR YOU IF... (PEOPLE & EMPATHY RECOGNITION) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs font-tech-mono font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            WHO THIS IS FOR
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            Built for people who are tired of starting over
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            If any of these sound familiar, you don't lack discipline — you were tracking static streaks instead of dynamic trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 backdrop-blur-xl tis-specular-box flex items-start gap-3">
            <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
              <RotateCcw className="size-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                You start strong, but one busy week resets you
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You build a 12-day streak, get sick on Tuesday, see a big red "0", and psychologically abandon the app. Streaks are static; trajectory remembers your cumulative work.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 backdrop-blur-xl tis-specular-box flex items-start gap-3">
            <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
              <Layers className="size-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                Your to-do list became a graveyard of guilt
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                25 tasks rollover every midnight. You spend more time managing productivity systems than doing real work.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 backdrop-blur-xl tis-specular-box flex items-start gap-3">
            <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                You want momentum without app slavery
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You don't want childish cartoon gamification or casino sounds. You want quiet mathematical proof that you are advancing.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-card/60 backdrop-blur-xl tis-specular-box flex items-start gap-3">
            <div className="size-8 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                You want an execution system you can finish in 90 seconds
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                1 primary focus. 2 routines. Zero backlog. Open it, mark your anchor, and shut the screen to live your life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: VISUAL CORE CONCEPT (FRAGILE STREAK VS. PROTECTED TRAJECTORY) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs font-tech-mono font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            THE MATHEMATICAL DIFFERENCE
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            Streaks are static. Trajectory is dynamic.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            Streaks require robotic perfection and shatter at the first miss. Trajectory is a holistic, velocity-based foundation for real human growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Fragile Streak Card */}
          <div className="rounded-2xl border border-border/80 bg-card/50 dark:bg-card/30 p-5 sm:p-6 backdrop-blur-xl tis-specular-box relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-tech-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                TRADITIONAL HABIT APPS
              </span>
              <span className="text-xs font-tech-mono text-muted-foreground font-semibold">
                Static Streak
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-3">
              Binary Counter: One Miss = Complete Reset
            </h3>

            {/* Visual Timeline Diagram */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/60 font-tech-mono text-[11px] mb-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D1</span>
                <span>→</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D2</span>
                <span>→</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D3</span>
                <span>→</span>
                <span className="flex items-center gap-1 text-foreground font-bold underline"><XCircle className="size-3 text-foreground" /> MISS</span>
                <span>→</span>
                <span className="text-foreground font-bold">RESET (0)</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Streaks are static: they treat Day 2 and Day 89 with the exact same binary fragility. One unavoidable disruption resets your count to zero, erasing psychological momentum and triggering churn.
            </p>
          </div>

          {/* Protected Trajectory Card (TIS) */}
          <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-card/85 dark:bg-card/60 p-5 sm:p-6 backdrop-blur-xl tis-specular-box relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-tech-mono px-2 py-0.5 rounded bg-foreground text-background font-bold">
                THE IMPROVEMENT SYSTEM
              </span>
              <span className="text-xs font-tech-mono text-foreground font-semibold">
                ±10% Trajectory Buffer
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-3">
              Cumulative Vector: ±10% Buffer Absorbs Drift
            </h3>

            {/* Visual Timeline Diagram */}
            <div className="p-3 rounded-xl bg-background/90 border border-foreground/30 font-tech-mono text-[11px] mb-4 space-y-2">
              <div className="flex items-center justify-between text-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D1</span>
                <span>→</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D2</span>
                <span>→</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> D3</span>
                <span>→</span>
                <span className="flex items-center gap-1 font-bold"><Zap className="size-3 text-foreground" /> BUFFER</span>
                <span>→</span>
                <span className="text-foreground font-bold">D90 CONTINUES</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Trajectory is dynamic: it maps cumulative velocity across your 90-day horizon. The ±10% mathematical buffer cushions life's interruptions so a single off-day never wipes out weeks of authentic follow-through.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION: THE THREE PILLARS (BENEFIT-ORIENTED, REDUCED BACKLOG FATIGUE) ── */}
      <section id="pillars-section" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 mb-3 shadow-xs"
          >
            <span className="size-1.5 rounded-full bg-foreground" />
            <span className="text-[10px] sm:text-[11px] font-tech-mono font-medium text-foreground tracking-wider uppercase">
              02 // REVEAL HIERARCHY • THE THREE PILLARS
            </span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight"
          >
            The Three Steps to Quiet Follow-Through
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed"
          >
            Eliminate decision fatigue and sustain lifelong momentum with three architectural rules.
          </motion.p>
        </div>

        {/* The Three Steps: Fade + Lift & Staggered Entrance on Desktop & Mobile (IMAGE 02: ENTRANCE -> HIERARCHY) */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch justify-center">
          {principles.map((p, index) => {
            const isHovered = isDesktop && hoveredStep === index;
            const isOtherHovered = isDesktop && hoveredStep !== null && hoveredStep !== index;

            return (
              <motion.div
                key={p.step}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => isDesktop && setHoveredStep(index)}
                onMouseLeave={() => isDesktop && setHoveredStep(null)}
                className={cn(
                  "group relative rounded-2xl border p-5 sm:p-6 backdrop-blur-2xl flex flex-col justify-between transition-all duration-500 tis-specular-box min-h-[300px] sm:min-h-[340px]",
                  "w-full",
                  isDesktop && (
                    isHovered
                      ? "md:flex-[1.4] border-white/25 shadow-2xl bg-card/90 z-10"
                      : isOtherHovered
                      ? "md:flex-[0.8] border-white/10 bg-card/50 opacity-80 hover:opacity-100"
                      : "md:flex-1 border-white/10 bg-card/65 shadow-lg"
                  )
                )}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="font-tech-mono font-extrabold text-2xl sm:text-3xl text-foreground/80 group-hover:text-foreground transition-colors">
                      {p.step}
                    </span>
                    <span className="text-[10px] font-tech-mono px-2.5 py-0.5 rounded-full bg-muted/80 text-foreground border border-border">
                      {p.rule}
                    </span>
                  </div>

                  <div className="text-[10px] font-tech-mono text-muted-foreground uppercase tracking-wider mb-1">
                    {p.eyebrow}
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-3 leading-snug">
                    {p.title}
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground font-semibold">What you do:</strong> {p.what}</p>
                    <p><strong className="text-foreground font-semibold">Why it works:</strong> {p.why}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground/80 pt-1 border-t border-border/40">
                      <strong className="text-foreground/90 font-medium">Prevents:</strong> {p.prevents}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-border/50 flex items-center justify-between text-xs font-tech-mono">
                  <span className="text-muted-foreground">Architectural Rule</span>
                  <span className="font-semibold text-foreground">{p.rule}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION: HOW IT WORKS (PIN + TRANSFORM SCROLL STORYTELLING ENGINE) ── */}
      <PinAndTransformWorkflow isDark={isDark} />

      {/* ── SIDE-BY-SIDE ARCHITECTURAL COMPARISON (REDUCED BASIS, OPTIMAL ON MOBILE & PC) ── */}
      <ComparisonTable onSelectPlan={() => navigate('/auth')} />

      {/* ── DIRECT OBJECTION HANDLING: "WHY NOT JUST USE A NORMAL HABIT TRACKER?" ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 text-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 sm:p-10 rounded-2xl md:rounded-3xl border border-white/15 dark:border-white/10 bg-card/70 backdrop-blur-2xl shadow-xl tis-specular-box"
        >
          <span className="text-xs font-tech-mono font-semibold text-muted-foreground tracking-widest uppercase">
            THE CORE QUESTION
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mt-2 mb-4">
            "Why not just use a normal habit tracker?"
          </h2>
          <div className="max-w-2xl mx-auto text-xs sm:text-base text-muted-foreground leading-relaxed space-y-3">
            <p className="text-foreground font-semibold text-base sm:text-lg font-display">
              Because human growth isn't a static streak.
            </p>
            <p>
              Streaks are static, fragile, and binary. A missed day wipes out 60 days of genuine effort. But human development isn't an unbroken straight line—it's an accumulated vector.
            </p>
            <p>
              We built The Improvement System around Trajectory: a dynamic velocity engine protected by a ±10% mathematical buffer. Real consistency is measured by where your trajectory lands in 90 days, not whether every single day was flawless.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── FINAL CALL TO ACTION (LIQUID GLASS DOCK & FREE FOREVER TRUST SIGNALS) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24 text-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
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
              <Magnetic>
                <Button
                  variant="default"
                  data-cuelume-press="press"
                  data-cuelume-release="release"
                  data-cuelume-hover="tick"
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto h-11 sm:h-12 px-8 font-display text-xs sm:text-sm font-semibold shadow-lg active:scale-[0.96] rounded-xl group transition-transform"
                >
                  <span>Start My 90-Day Trajectory</span>
                  <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1.5" />
                </Button>
              </Magnetic>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-tech-mono text-muted-foreground mt-6 pt-4 border-t border-border/40">
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Check className="size-3 text-foreground" />
                Free Forever (Zero Paywalls)
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

      {/* ── MINIMALIST FOOTER ── */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SystemLogo size={26} />
            <div>
              <span className="font-display font-semibold text-sm text-foreground">
                The Improvement System
              </span>
              <p className="text-[10px] text-muted-foreground font-tech-mono">
                Personal Trajectory Engine • Consistency Without Perfection
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
