import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence, useScroll } from 'framer-motion';
import {
  Target,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  TrendingUp,
  XCircle,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';
import ComparisonTable from '@/components/ui/comparison-table';
import { Magnetic } from '@/components/ui/magnetic';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  MysteriousClipReveal,
  AtmosphericLift,
  TelemetryStaggerContainer,
  TelemetryStaggerItem,
} from '@/components/motion';
import { cn } from '@/lib/utils';

// -- MONOCHROMATIC KINETIC MOTION BACKGROUND (VIVID, VISIBLE & VIEWED THROUGH GLASS) --
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
          { amp: 36, freq: 0.0011, speed: 0.65, color: 'rgba(0, 0, 0, 0.46)', yOffset: height * 0.18, lineWidth: 2.2 },
          { amp: 48, freq: 0.0009, speed: 0.50, color: 'rgba(0, 0, 0, 0.52)', yOffset: height * 0.36, lineWidth: 2.6 },
          { amp: 32, freq: 0.0013, speed: 0.75, color: 'rgba(0, 0, 0, 0.38)', yOffset: height * 0.54, lineWidth: 2.0 },
          { amp: 42, freq: 0.0010, speed: 0.45, color: 'rgba(0, 0, 0, 0.34)', yOffset: height * 0.72, lineWidth: 2.0 },
          { amp: 50, freq: 0.0007, speed: 0.35, color: 'rgba(0, 0, 0, 0.26)', yOffset: height * 0.88, lineWidth: 1.8 },
        ];

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

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldReduceMotion, resolvedMode]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Precision Trajectory Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.12] text-foreground transition-opacity"
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
    </div>
  );
}

// -- UNIQUE FUN TACTILE THEME TOGGLE (NEOSKEUOMORPHIC ANALOG INSTRUMENT SWITCH) --
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
            "text-[8px] sm:text-[9px] font-bold transition-opacity duration-200",
            isDark ? "opacity-100 text-zinc-400" : "opacity-0"
          )}
        >
          LUNAR
        </span>
        <span
          className={cn(
            "text-[8px] sm:text-[9px] font-bold transition-opacity duration-200 ml-auto",
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

// -- 4-STAGE TRAJECTORY ENGINE CONSOLE (INTERACTIVE & LIVING CADENCE) --
function PinAndTransformWorkflow({ isDark }: { isDark: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [stepProgress, setStepProgress] = useState<number>(0);

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

  // InView Observer: only run cadence playback when visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    // Initial check if section is already within viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsInView(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          setIsInView(e.isIntersecting);
        });
      },
      { threshold: 0.05, rootMargin: '60px 0px 60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cadence progress ticker: auto-advances every 4.5s with a smooth progress bar
  useEffect(() => {
    if (!isPlaying || !isInView || shouldReduceMotion) return;

    const duration = 4500;
    const startTime = Date.now();
    setStepProgress(0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setStepProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setActiveStep((curr) => (curr + 1) % steps.length);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [activeStep, isPlaying, isInView, shouldReduceMotion, steps.length]);

  const selectStep = (idx: number) => {
    setActiveStep(idx);
    setStepProgress(0);
  };

  const handlePrev = () => {
    setActiveStep((curr) => (curr - 1 + steps.length) % steps.length);
    setStepProgress(0);
  };

  const handleNext = () => {
    setActiveStep((curr) => (curr + 1) % steps.length);
    setStepProgress(0);
  };

  return (
    <section ref={sectionRef} id="system-in-practice" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
      {/* Section Header with Clip Reveal & Atmospheric Lift */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
        <AtmosphericLift yOffset={14} blurAmount={4}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/[0.08] mb-3 shadow-xs">
            <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-medium text-foreground">
              System Mechanics • 4-Stage Trajectory Engine
            </span>
          </div>
        </AtmosphericLift>

        <MysteriousClipReveal direction="horizontal" duration={0.8} showLaserGlint={true}>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            How The System Works In Practice
          </h2>
        </MysteriousClipReveal>

        <AtmosphericLift yOffset={14} blurAmount={6} delay={0.15}>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            Watch how a single daily focus and the ±10% buffer transform chaotic intentions into compounding trajectory. Click any stage or let the cadence play.
          </p>
        </AtmosphericLift>
      </div>

      {/* Main Interactive Stage Console (Zero Empty Void, True Flow Layout) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Column: Pinned Living HUD Console Display */}
        <div className="md:col-span-7 flex flex-col">
          <div className="h-full relative rounded-2xl md:rounded-3xl border border-white/[0.08] bg-card/85 backdrop-blur-2xl shadow-xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div>
              {/* Console HUD Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-foreground animate-pulse" />
                  <span className="font-semibold text-foreground">
                    STAGE <span className="font-tech-mono">{steps[activeStep].num}</span> // {steps[activeStep].tag}
                  </span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-[10px] text-foreground font-semibold">
                  {steps[activeStep].badge}
                </div>
              </div>

              {/* Animated Graphic Display: Dynamically updates with activeStep */}
              <div className="relative h-64 sm:h-72 w-full rounded-xl bg-background/80 border border-white/[0.08] p-4 flex flex-col justify-between overflow-hidden">
                {/* Background grid lines */}
                <div
                  className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Dynamic SVG Visuals for each Step */}
                <svg className="w-full h-44 sm:h-48 relative z-10" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="pinBufferGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.08 : 0.04} />
                      <stop offset="100%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={isDark ? 0.24 : 0.14} />
                    </linearGradient>
                  </defs>

                  {/* Baseline Grid Guides */}
                  <line x1="20" y1="130" x2="380" y2="130" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                  <line x1="20" y1="40" x2="380" y2="40" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />

                  {/* Step 0: Initializing Horizon */}
                  {activeStep === 0 && (
                    <g className="transition-all duration-500">
                      <line x1="30" y1="120" x2="370" y2="45" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                      <circle cx="30" cy="120" r="5" fill="currentColor" />
                      <circle cx="370" cy="45" r="5" fill="currentColor" fillOpacity="0.5" />
                      <text x="40" y="125" fill="currentColor" fontSize="10" fontFamily="sans-serif">Day 01 (Origin)</text>
                      <text x="270" y="38" fill="currentColor" fontSize="10" fontFamily="sans-serif">Day 90 Horizon</text>
                    </g>
                  )}

                  {/* Step 1: Focus Injection (+35% Thrust) */}
                  {activeStep === 1 && (
                    <g className="transition-all duration-500">
                      <path d="M 30,120 Q 180,95 240,65" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                      <circle cx="240" cy="65" r="6" fill="currentColor" />
                      <line x1="240" y1="65" x2="370" y2="35" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                      <text x="170" y="55" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="sans-serif">+35% Thrust Injected</text>
                    </g>
                  )}

                  {/* Step 2: 2 Routines Anchored (Compounding Ascent) */}
                  {activeStep === 2 && (
                    <g className="transition-all duration-500">
                      <path d="M 30,120 C 130,110 200,60 370,22" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                      <circle cx="370" cy="22" r="6" fill="currentColor" />
                      <text x="220" y="20" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="sans-serif">1.25x Peak Velocity</text>
                    </g>
                  )}

                  {/* Step 3: Buffer Absorbs The Shock */}
                  {activeStep === 3 && (
                    <g className="transition-all duration-500">
                      {/* Buffer Cone Polygon */}
                      <path d="M 180,68 C 240,60 320,30 380,24 L 380,54 C 320,50 240,78 180,82 Z" fill="url(#pinBufferGrad)" />
                      <path d="M 180,68 C 240,60 320,30 380,24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                      <path d="M 180,82 C 240,78 320,50 380,54" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
                      
                      {/* Trajectory with temporary dip cushioned inside buffer */}
                      <path d="M 30,120 C 120,110 180,72 230,76 C 280,80 320,40 375,34" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
                      
                      {/* Shock absorption marker */}
                      <circle cx="230" cy="76" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      <text x="200" y="98" fill="currentColor" fontSize="10" fontFamily="sans-serif">Dip Absorbed</text>
                      <text x="240" y="30" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="sans-serif">90d Target Preserved</text>
                    </g>
                  )}
                </svg>

                {/* Bottom Console Telemetry Readout */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                  <span className="text-muted-foreground">Velocity Engine:</span>
                  <span className="text-foreground font-bold font-tech-mono">{steps[activeStep].metric}</span>
                </div>
              </div>

              {/* Subtext description below graphic */}
              <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate mr-2">
                  {activeStep === 3
                    ? 'Streak Apps: Reset to 0 | Kinetic: Trajectory Absorbs Drift ✓'
                    : 'Deterministic Trajectory • 1 Primary Focus + 2 Routines'}
                </span>
                <span className="text-foreground font-semibold shrink-0">
                  Step {activeStep + 1} of 4
                </span>
              </div>
            </div>

            {/* Interactive Cadence Controls & Progress Line */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Stage"
                  data-cuelume-press="press"
                  className="p-1.5 rounded-lg border border-border bg-card/60 hover:bg-card text-foreground transition-colors active:scale-95"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause Cadence' : 'Play Cadence'}
                  data-cuelume-press="press"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card/60 hover:bg-card text-xs text-foreground transition-colors active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3" />
                      <span>Play</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Stage"
                  data-cuelume-press="press"
                  className="p-1.5 rounded-lg border border-border bg-card/60 hover:bg-card text-foreground transition-colors active:scale-95"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Step dots & active progress indicator */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectStep(i)}
                    aria-label={`Jump to stage ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeStep ? "w-6 bg-foreground" : "w-2 bg-muted hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 4-Stage Selection Stream */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3 sm:space-y-3.5">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;

            return (
              <div
                key={s.num}
                onClick={() => selectStep(idx)}
                data-cuelume-press="press"
                data-cuelume-hover="tick"
                className={cn(
                  "relative p-4 sm:p-4.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                  isActive
                    ? "bg-card/95 border-white/[0.08] scale-[1.01] opacity-100"
                    : "bg-card/35 border-white/[0.08] opacity-55 hover:opacity-90 hover:bg-card/55 scale-[0.99]"
                )}
              >
                {/* Active Step Cadence Progress Bar */}
                {isActive && (
                  <div
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-foreground origin-left transition-all"
                    style={{ width: `${stepProgress}%` }}
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-6 sm:size-7 rounded-md flex items-center justify-center text-xs font-tech-mono font-bold transition-colors",
                        isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {s.num}
                    </div>
                    <h3
                      className={cn(
                        "font-display font-bold text-sm sm:text-base transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.title}
                    </h3>
                  </div>
                  <Icon
                    className={cn(
                      "size-4 sm:size-4.5 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pl-8 sm:pl-9.5">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { resolvedMode } = useThemeContext();
  const isDark = resolvedMode === 'dark';
  const { scrollYProgress } = useScroll();
  const [showAllWhoFor, setShowAllWhoFor] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip text-foreground selection:bg-foreground/20 selection:text-foreground">
      {/* -- IMAGE 01: SCROLL SCRUB PROGRESS BAR (MOTION FOLLOWS SCROLL PROGRESS) -- */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 inset-x-0 h-[2.5px] bg-foreground z-[70] pointer-events-none opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.6)] dark:shadow-[0_0_10px_rgba(255,255,255,0.35)]"
      />

      {/* -- HIGH-CONTRAST MONOCHROMATIC KINETIC MESH BACKGROUND -- */}
      <MonochromaticMeshBackground />

      {/* Progressive Top Glass Blur Wash (Content fades smoothly under navbar) */}
      <div className="fixed top-0 inset-x-0 h-20 pointer-events-none z-40 bg-gradient-to-b from-background/85 via-background/40 to-transparent backdrop-blur-[3px]" />

      {/* -- HIGH-END LIQUID FROSTED GLASS FLOATING NAVBAR (ISLAND DOCK) -- */}
      <AtmosphericLift yOffset={-16} duration={0.8} blurAmount={6} className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-6 md:inset-x-8 max-w-5xl mx-auto z-50">
        <header className="w-full kinetic-glass-island rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Brand Identity */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-1 rounded-xl bg-card/90 border border-white/20 dark:border-white/10 shadow-xs shrink-0 backdrop-blur-md">
                <SystemLogo size={22} className="sm:hidden" />
                <SystemLogo size={26} className="hidden sm:block" />
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <MysteriousClipReveal direction="horizontal" duration={0.7} showLaserGlint={true}>
                  <span className="font-display font-extrabold text-xs sm:text-sm tracking-tight text-foreground truncate">
                    Kinetic
                  </span>
                </MysteriousClipReveal>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-muted/80 text-muted-foreground border border-border/80">
                  <span className="size-1.5 rounded-full bg-foreground" />
                  Local Enclave
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
      </AtmosphericLift>

      {/* -- HERO SECTION: HUMAN OUTCOME FIRST, THEN SYSTEM MECHANISM -- */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-8 sm:pb-16 text-center">
        {/* Eyebrow with Atmospheric Lift */}
        <AtmosphericLift yOffset={16} blurAmount={6} duration={0.65} className="inline-block mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/[0.08] shadow-xs">
            <Sparkles className="size-3.5 text-foreground shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium text-foreground">
              <span className="hidden sm:inline">Personal Trajectory Engine • Dynamic Vector, Not Static Streaks</span>
              <span className="sm:hidden">Dynamic Trajectory • ±10% Buffer</span>
            </span>
          </div>
        </AtmosphericLift>

        {/* Main Headline: Outcome-First with Monochromatic Gradient & Mysterious Clip Reveal */}
        <MysteriousClipReveal direction="horizontal" duration={0.9} delay={0.08} showLaserGlint={true} className="max-w-4xl mx-auto mb-3 sm:mb-5 px-2">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.12] drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <span className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-950 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent block sm:inline">
              You don't need to be perfect
            </span>{' '}
            <span className="bg-gradient-to-b from-black via-zinc-950 to-black dark:from-white dark:via-zinc-50 dark:to-zinc-200 bg-clip-text text-transparent font-black block sm:inline">
              to keep improving.
            </span>
          </h1>
        </MysteriousClipReveal>

        {/* Editorial Subline & Supporting Copy with Atmospheric Lift */}
        <AtmosphericLift yOffset={20} blurAmount={8} duration={0.7} delay={0.2} className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2 space-y-2">
          <p className="text-sm sm:text-lg font-medium text-foreground font-display drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
            Streaks are static; trajectory is dynamic. One daily focus cushioned by a ±10% mathematical buffer.
          </p>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            <span className="hidden sm:inline">
              Streaks are fragile binary counters—miss once and 60 days vanish into zero. Kinetic prioritizes Trajectory: a wholesome, velocity-based measure of real progress with a ±10% buffer that absorbs life's volatility so your 90-day momentum never dies.
            </span>
            <span className="sm:hidden">
              Streaks are static and shatter on day one. We protect your 90-day trajectory with 1 focus, 2 routines, and an elastic ±10% buffer cone.
            </span>
          </p>
        </AtmosphericLift>

        {/* Primary CTA Row & Prominent Free Forever Trust Signals with Atmospheric Lift */}
        <AtmosphericLift yOffset={18} blurAmount={6} duration={0.65} delay={0.3} className="flex flex-col items-center justify-center gap-3 mb-8 sm:mb-12 px-3 max-w-md sm:max-w-none mx-auto">
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
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground/90 mt-1">
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
          </div>
        </AtmosphericLift>
      </section>

      {/* -- PRODUCT SNEAK PEEK CONSOLE -- */}
      <section className="hidden md:block relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-8">
        <div
          id="sneak-peek-frame"
          className="relative max-w-5xl mx-auto text-left"
        >
          {/* Anchored Telemetry Chips */}
          <div className="hidden md:flex absolute -top-5 left-4 items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-card/70 backdrop-blur-xl text-[11px] text-muted-foreground shadow-sm pointer-events-none select-none z-20">
            <span className="size-2 rounded-full bg-foreground animate-pulse" />
            <span className="text-foreground font-semibold">Velocity: <span className="font-tech-mono">1.25x</span></span>
            <span className="text-muted-foreground">• <span className="font-tech-mono">+16d</span> Margin</span>
          </div>

          <div className="hidden md:flex absolute -top-5 right-4 items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-card/70 backdrop-blur-xl text-[11px] text-muted-foreground shadow-sm pointer-events-none select-none z-20">
            <ShieldCheck className="size-3.5 text-foreground" />
            <span className="text-foreground font-semibold">±10% Safety Buffer</span>
            <span className="text-muted-foreground">• Drift Absorbed</span>
          </div>

          {/* Hardware Frame with Liquid Frosted Glass */}
          <MysteriousClipReveal direction="center-out" duration={0.9} delay={0.08} showLaserGlint={true} className="rounded-2xl md:rounded-3xl">
            <div className="relative rounded-2xl md:rounded-3xl border border-white/[0.08] bg-card/85 backdrop-blur-2xl shadow-xl overflow-hidden">
              {/* Top Bar HUD */}
              <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-white/[0.08] bg-muted/30 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                  <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                  <span className="size-2.5 rounded-full bg-zinc-500/40 border border-zinc-500/50" />
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    Live Product Sneak Peek // Trajectory Visualizer
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-border/80 text-[10px] text-muted-foreground backdrop-blur-sm shadow-xs">
                    <span className="size-1.5 rounded-full bg-foreground" />
                    <span>Preview</span>
                  </div>
                </div>
              </div>

              {/* Static Preview Image */}
              <div className="p-3.5 sm:p-6 md:p-8">
                <img
                  src="/assets/app-demo-fallback.png"
                  alt="Kinetic app preview"
                  className="w-full h-auto object-cover max-h-[580px] rounded-xl border border-white/[0.08]"
                />
              </div>
            </div>
          </MysteriousClipReveal>
        </div>
      </section>

      {/* -- SECTION: THIS IS FOR YOU IF... (PEOPLE & EMPATHY RECOGNITION) -- */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <AtmosphericLift yOffset={14} blurAmount={4}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Who This Is For
            </p>
          </AtmosphericLift>

          <MysteriousClipReveal direction="horizontal" duration={0.8} showLaserGlint={true}>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
              Built for people who are tired of starting over
            </h2>
          </MysteriousClipReveal>

          <AtmosphericLift yOffset={14} blurAmount={6} delay={0.15}>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              If any of these sound familiar, you don't lack discipline — you were tracking static streaks instead of dynamic trajectory.
            </p>
          </AtmosphericLift>
        </div>

        <TelemetryStaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <TelemetryStaggerItem>
            <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-card/60 backdrop-blur-xl flex items-start gap-3 h-full">
              <div className="size-8 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
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
          </TelemetryStaggerItem>

          <TelemetryStaggerItem>
            <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-card/60 backdrop-blur-xl flex items-start gap-3 h-full">
              <div className="size-8 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
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
          </TelemetryStaggerItem>

          <TelemetryStaggerItem className={showAllWhoFor ? "block" : "hidden md:block"}>
            <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-card/60 backdrop-blur-xl flex items-start gap-3 h-full">
              <div className="size-8 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
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
          </TelemetryStaggerItem>

          <TelemetryStaggerItem className={showAllWhoFor ? "block" : "hidden md:block"}>
            <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-card/60 backdrop-blur-xl flex items-start gap-3 h-full">
              <div className="size-8 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
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
          </TelemetryStaggerItem>
        </TelemetryStaggerContainer>

        {!showAllWhoFor && (
          <div className="mt-4 text-center md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllWhoFor(true)}
              className="text-xs rounded-full border-border/80"
            >
              See all
            </Button>
          </div>
        )}
      </section>

      {/* -- SECTION: VISUAL CORE CONCEPT (FRAGILE STREAK VS. PROTECTED TRAJECTORY) -- */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <AtmosphericLift yOffset={14} blurAmount={4}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              The Mathematical Difference
            </p>
          </AtmosphericLift>

          <MysteriousClipReveal direction="horizontal" duration={0.8} showLaserGlint={true}>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
              Streaks are static. Trajectory is dynamic.
            </h2>
          </MysteriousClipReveal>

          <AtmosphericLift yOffset={14} blurAmount={6} delay={0.15}>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Streaks require robotic perfection and shatter at the first miss. Trajectory is a holistic, velocity-based foundation for real human growth.
            </p>
          </AtmosphericLift>
        </div>

        <TelemetryStaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Fragile Streak Card */}
          <TelemetryStaggerItem>
            <div className="rounded-2xl border border-white/[0.08] bg-card/50 dark:bg-card/30 p-5 sm:p-6 backdrop-blur-xl relative h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    Traditional Habit Apps
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Static Streak
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-3">
                  Binary Counter: One Miss = Complete Reset
                </h3>

                {/* Visual Timeline Diagram */}
                <div className="p-3 rounded-xl bg-background/80 text-[11px] mb-4 space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D1</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D2</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D3</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1 text-foreground font-bold underline"><XCircle className="size-3 text-foreground" /> MISS</span>
                    <span>→</span>
                    <span className="text-foreground font-bold">RESET (0)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Streaks are static: they treat Day 2 and Day 89 with the exact same binary fragility. One unavoidable disruption resets your count to zero, erasing psychological momentum and triggering churn.
              </p>
            </div>
          </TelemetryStaggerItem>

          {/* Protected Trajectory Card (Kinetic) */}
          <TelemetryStaggerItem>
            <div className="rounded-2xl border border-white/[0.08] bg-card/85 dark:bg-card/60 p-5 sm:p-6 backdrop-blur-xl relative h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-foreground text-background font-bold">
                    Kinetic
                  </span>
                  <span className="text-xs text-foreground font-semibold">
                    ±10% Trajectory Buffer
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-3">
                  Cumulative Vector: ±10% Buffer Absorbs Drift
                </h3>

                {/* Visual Timeline Diagram */}
                <div className="p-3 rounded-xl bg-background/90 text-[11px] mb-4 space-y-2">
                  <div className="flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D1</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D2</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-foreground" /> <span className="font-tech-mono">D3</span></span>
                    <span>→</span>
                    <span className="flex items-center gap-1 font-bold"><Zap className="size-3 text-foreground" /> BUFFER</span>
                    <span>→</span>
                    <span className="text-foreground font-bold"><span className="font-tech-mono">D90</span> CONTINUES</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Trajectory is dynamic: it maps cumulative velocity across your 90-day horizon. The ±10% mathematical buffer cushions life's interruptions so a single off-day never wipes out weeks of authentic follow-through.
              </p>
            </div>
          </TelemetryStaggerItem>
        </TelemetryStaggerContainer>
      </section>

      {/* -- SECTION: HOW IT WORKS (PIN + TRANSFORM SCROLL STORYTELLING ENGINE) -- */}
      <PinAndTransformWorkflow isDark={isDark} />

      {/* -- SIDE-BY-SIDE ARCHITECTURAL COMPARISON (REDUCED BASIS, OPTIMAL ON MOBILE & PC) -- */}
      <ComparisonTable onSelectPlan={() => navigate('/auth')} />

      {/* -- FINAL CALL TO ACTION -- */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24 text-center">
        <MysteriousClipReveal direction="center-out" duration={0.9} showLaserGlint={true} className="rounded-2xl sm:rounded-3xl">
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-14 border border-white/[0.08] bg-card/80 backdrop-blur-2xl shadow-xl overflow-hidden">
            <AtmosphericLift yOffset={20} blurAmount={6} delay={0.15}>
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="text-xs font-semibold text-muted-foreground">
                  Initialize Your System
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

                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground mt-6 pt-4 border-t border-border/40">
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
            </AtmosphericLift>
          </div>
        </MysteriousClipReveal>
      </section>

      {/* -- MINIMALIST FOOTER -- */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SystemLogo size={26} />
            <div>
              <span className="font-display font-semibold text-sm text-foreground">
                Kinetic
              </span>
              <p className="text-[10px] text-muted-foreground">
                Personal Trajectory Engine • Consistency Without Perfection
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors touch-target font-medium"
            >
              Log In
            </button>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-muted-foreground/60">© 2026 Kinetic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
