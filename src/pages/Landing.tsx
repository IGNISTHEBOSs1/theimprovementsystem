import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Target,
  ArrowRight,
  Star,
  CheckCircle2,
  Brain,
  Compass,
  TrendingUp,
  Activity,
  Award,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Flame,
  ChevronRight,
  Layers,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';

// ── DATA: The Three Laws ──
const laws = [
  {
    num: '01',
    law: 'LAW OF GRAVITATIONAL FOCUS',
    title: 'One Primary Commitment Daily',
    desc: 'Endless to-do lists create illusionary motion while fracturing real progress. The system forces a single daily non-negotiable anchor, supplemented by two recurring routines.',
    tag: 'Bandwidth Protection',
    metric: '1 Focus / Day',
  },
  {
    num: '02',
    law: 'LAW OF ELASTIC RESILIENCE',
    title: 'The ±10% Trajectory Buffer',
    desc: 'Rigid binary streaks snap when life happens, triggering guilt and abandon. The Improvement System calculates an adaptive buffer cone that absorbs volatility without breaking momentum.',
    tag: 'Anti-Fragile Design',
    metric: '±10% Buffer Cone',
  },
  {
    num: '03',
    law: 'LAW OF VERIFIABLE TELEMETRY',
    title: 'Objective Evidence Over Dopamine',
    desc: 'No casino chimes, predatory notifications, or inflated vanity scores. Every level and sovereign rank upgrade is backed by mathematically indisputable completion logs.',
    tag: 'Solo Leveling Progression',
    metric: 'E → S Rank Scale',
  },
];

// ── DATA: Hunter Ranks ──
const hunterRanks = [
  { rank: 'E', title: 'Novice Operator', minXp: '0 XP', focusReq: 'Establish Baseline', active: false },
  { rank: 'D', title: 'Disciplined Scout', minXp: '500 XP', focusReq: '7-Day Follow-Through', active: false },
  { rank: 'C', title: 'Trajectory Specialist', minXp: '1,500 XP', focusReq: 'Buffer Stability > 85%', active: false },
  { rank: 'B', title: 'Cadence Vanguard', minXp: '3,500 XP', focusReq: 'Consistent Velocity ≥ 1.0x', active: true },
  { rank: 'A', title: 'System Master', minXp: '7,500 XP', focusReq: '30-Day Buffer Lock', active: false },
  { rank: 'S', title: 'Sovereign Executor', minXp: '15,000 XP', focusReq: 'Unbreakable Compound Pace', active: false },
];

export default function Landing() {
  const navigate = useNavigate();

  // Interactive Simulator State
  const [consistency, setConsistency] = useState<number>(86);
  const [mockQuestCompleted, setMockQuestCompleted] = useState<boolean>(false);
  const [selectedRank, setSelectedRank] = useState<string>('B');
  const [paradigmMode, setParadigmMode] = useState<'system' | 'chaos'>('system');

  // Math for dynamic trajectory simulator
  const velocity = (consistency / 80).toFixed(2);
  const velocityNum = parseFloat(velocity);
  const isAhead = velocityNum >= 1.05;
  const isInCorridor = velocityNum >= 0.95 && velocityNum < 1.05;
  const daysSaved = Math.round(((consistency - 50) / 50) * 28);

  // SVG Trajectory Curve points based on consistency
  const startY = 160;
  const targetY = 30;
  const currentActualY = startY - ((consistency - 40) / 60) * (startY - targetY);
  const actualPath = `M 20,${startY} Q 140,${(startY + currentActualY) / 2 + 10} 260,${currentActualY}`;
  const plannedPath = `M 20,${startY} Q 140,95 260,${targetY}`;
  const bufferUpper = `M 20,${startY - 6} Q 140,80 260,${targetY - 14}`;
  const bufferLower = `M 20,${startY + 6} Q 140,110 260,${targetY + 14}`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Ambient background glows */}
      <div className="orb-1 opacity-40 pointer-events-none" />
      <div className="orb-2 opacity-30 pointer-events-none" />

      {/* Cybernetic precision grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.05) 1px, transparent 1px)`,
          backgroundSize: '54px 54px',
        }}
      />

      {/* ── FLOATING GLASS HEADER ── */}
      <header className="sticky top-0 z-50 px-4 md:px-8 py-3.5 backdrop-blur-xl bg-background/70 border-b border-border/40 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
              <SystemLogo size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
                  The Improvement System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  V2.4 CALIBRATED
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider">
                PERSONAL TRAJECTORY ENGINE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Sign In
            </Button>
            <Button
              variant="neon"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs px-3.5 py-1.5 font-display font-medium shadow-sm hover:shadow-emerald-500/20"
            >
              <span>Initialize System</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION WITH INTERACTIVE SIMULATOR ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-20 md:pt-18 md:pb-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-6 shadow-sm"
          >
            <Sparkles className="size-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-emerald-300 tracking-wide">
              SOLO LEVELING TRAJECTORY PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] mb-6 text-foreground"
          >
            Master Your Trajectory.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              With Deliberate Focus.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Replace to-do list paralysis and toxic dopamine streaks with mathematical trajectory modeling. Commit to 1 Deep Focus, calibrate your ±10% buffer cone, and convert daily execution into verifiable evidence.
          </motion.p>

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Button
              size="lg"
              variant="neon"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-7 py-5 font-display text-sm sm:text-base font-semibold shadow-lg shadow-emerald-500/15"
            >
              <span>Begin Your System</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => document.getElementById('laws')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/60 hover:border-border"
            >
              <span>Explore The 3 Laws</span>
              <ChevronRight className="size-4 ml-1 opacity-60" />
            </Button>
          </motion.div>
        </div>

        {/* ── LIVE INTERACTIVE PLAYGROUND (TRAJECTORY & QUEST ENGINE) ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Outer Liquid Glass Frame */}
          <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl p-5 md:p-8 shadow-2xl overflow-hidden">
            {/* Specular Edge Highlights */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of the Simulator */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Activity className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm tracking-tight">LIVE ENGINE SIMULATOR</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      INTERACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Adjust daily discipline to observe real-time buffer stability
                  </p>
                </div>
              </div>

              {/* Dynamic Status Metric */}
              <div className="flex items-center gap-3 bg-background/50 border border-border/60 rounded-xl px-3.5 py-1.5">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Velocity Index</div>
                  <div className="font-mono font-bold text-sm sm:text-base text-foreground flex items-center justify-end gap-1.5">
                    <span className={isAhead ? 'text-emerald-400' : isInCorridor ? 'text-amber-400' : 'text-rose-400'}>
                      {velocity}x
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {isAhead ? 'AHEAD' : isInCorridor ? 'BUFFER' : 'LAG'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Simulator Grid: Graph on Left, Quest Card on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
              {/* Left Column: Interactive Vector Graph & Slider */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                {/* SVG Visualizer */}
                <div className="relative rounded-xl border border-border/60 bg-background/60 p-4 overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      Actual Trajectory
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
                      ±10% Buffer Cone
                    </span>
                    <span>90-Day Horizon</span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="relative h-44 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 280 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="landingEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="landingBufferGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.18" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="20" y1="160" x2="260" y2="160" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 3" />
                      <line x1="20" y1="95" x2="260" y2="95" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                      <line x1="20" y1="30" x2="260" y2="30" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 3" />

                      {/* Buffer Area (±10% cone) */}
                      <path
                        d={`M 20,${startY} Q 140,80 260,${targetY - 14} L 260,${targetY + 14} Q 140,110 20,${startY} Z`}
                        fill="url(#landingBufferGrad)"
                      />
                      <path d={bufferUpper} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />
                      <path d={bufferLower} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />

                      {/* Planned Ideal Baseline */}
                      <path d={plannedPath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4" />

                      {/* Dynamic Actual Line reacting to slider */}
                      <path
                        d={actualPath}
                        fill="none"
                        stroke="url(#landingEmeraldGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />

                      {/* Current Node Point */}
                      <circle
                        cx="260"
                        cy={currentActualY}
                        r="5"
                        fill="#10b981"
                        className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      />
                    </svg>

                    {/* Overlay dynamic badge */}
                    <div className="absolute right-2 top-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                      {isAhead ? `+${daysSaved} Days Projected Margin` : isInCorridor ? 'Within Target Buffer' : 'Recalibration Advised'}
                    </div>
                  </div>
                </div>

                {/* The Interactive Consistency Slider */}
                <div className="p-3.5 rounded-xl border border-border/60 bg-background/40">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-primary" />
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
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5">
                    <span>50% (Slippage)</span>
                    <span>80% (Baseline)</span>
                    <span>100% (Sovereign)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Tactile Interactive Quest Execution Card */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-3.5">
                <div className="p-4 rounded-xl border border-border/80 bg-background/80 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-emerald-400" />
                      <span className="font-display font-semibold text-xs text-foreground tracking-wide">TODAY&apos;S CADENCE</span>
                    </div>
                    <button
                      onClick={() => setMockQuestCompleted(!mockQuestCompleted)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 hover:bg-muted transition-colors"
                      title="Reset mock quest"
                    >
                      <RotateCcw className="size-3" />
                      Toggle
                    </button>
                  </div>

                  {/* Primary Focus Card (Interactive Click) */}
                  <div
                    onClick={() => setMockQuestCompleted(!mockQuestCompleted)}
                    className={`mt-3 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                      mockQuestCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/5'
                        : 'border-border/80 bg-card hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-6 rounded-lg border flex items-center justify-center transition-all duration-200 mt-0.5 ${
                          mockQuestCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
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
                            {mockQuestCompleted ? '+100 XP' : '50 XP'}
                          </span>
                        </div>
                        <p
                          className={`text-xs sm:text-sm font-medium mt-1 leading-snug transition-colors ${
                            mockQuestCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          Ship core engine architecture & buffer specs
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Two Routines */}
                  <div className="space-y-2 mt-2">
                    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-4 rounded-md border border-emerald-500/30 bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Check className="size-2.5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs text-muted-foreground line-through">45m Deep Reading</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400/80">DONE</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-4 rounded-md border border-border flex items-center justify-center" />
                        <span className="text-xs text-foreground">Evening Trajectory Shutdown</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">PENDING</span>
                    </div>
                  </div>

                  {/* Live Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="flex justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-muted-foreground">Daily Quota</span>
                      <span className="text-emerald-400 font-bold">{mockQuestCompleted ? '100%' : '66%'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: mockQuestCompleted ? '100%' : '66%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                  <p className="text-xs text-muted-foreground">
                    Try clicking the quest card above to experience the micro-feedback loop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── METRICS TELEMETRY STRIP ── */}
      <section className="relative z-10 border-y border-border/60 bg-card/30 backdrop-blur-md py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">1 Focus</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">Daily Commitment Cap</p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-emerald-400">±10%</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">Resilience Buffer</p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">E → S</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">Solo Leveling Ranks</p>
            </div>
            <div className="p-2">
              <p className="font-mono font-bold text-2xl sm:text-3xl text-foreground">100%</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-mono">Private & Offline-First</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: THE THREE LAWS (SCROLLABLE STORYTELLING) ── */}
      <section id="laws" className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            SYSTEM FOUNDATION
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Three Laws of Trajectory
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Why traditional productivity apps break down under pressure, and how mathematical constraints create genuine freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {laws.map((law, index) => (
            <motion.div
              key={law.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group relative rounded-2xl border border-border/80 bg-card/70 p-6 md:p-8 backdrop-blur-xl shadow-lg hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/40 transition-colors" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono font-extrabold text-3xl text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                    {law.num}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {law.tag}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  {law.law}
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-3 leading-snug">
                  {law.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {law.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Constraint Metric</span>
                <span className="text-emerald-400 font-semibold">{law.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PARADIGM COMPARISON: THE SYSTEM VS CHAOS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-border/60">
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
                ARCHITECTURAL COMPARISON
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mt-1">
                The Cost of Unconstrained Productivity
              </h2>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center p-1 rounded-xl bg-background/80 border border-border">
              <button
                onClick={() => setParadigmMode('system')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  paradigmMode === 'system'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                The Improvement System
              </button>
              <button
                onClick={() => setParadigmMode('chaos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  paradigmMode === 'chaos'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Standard Habit Apps
              </button>
            </div>
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {paradigmMode === 'system' ? (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                  <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <CheckCircle2 className="size-4" />
                      <span className="font-display font-semibold text-sm">Adaptive Buffers</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A ±10% buffer zone accommodates sickness, travel, and workload spikes. Missing one routine doesn&apos;t destroy your 90-day trajectory.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Target className="size-4" />
                      <span className="font-display font-semibold text-sm">Protected Cognitive Bandwidth</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Strict limit of 1 Primary Focus + 2 Routines. Eliminates decision fatigue and guarantees deep work execution.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Shield className="size-4" />
                      <span className="font-display font-semibold text-sm">Zero Manipulation</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No red notification badges, countdown guilt timers, or casino dopamine sounds. Built for sovereign adults.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chaos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                  <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                      <AlertTriangle className="size-4" />
                      <span className="font-display font-semibold text-sm">Brittle Binary Streaks</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      One unavoidable missed day resets your 120-day streak to zero, destroying morale and prompting app abandonment.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                      <XCircle className="size-4" />
                      <span className="font-display font-semibold text-sm">Infinite Backlog Paralysis</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Lists swell to 60+ pending items. Users spend more time organizing, sorting, and feeling guilty than executing.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                      <Flame className="size-4" />
                      <span className="font-display font-semibold text-sm">Casino Gamification</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Fake confetti, push notification bombardment, and artificial badges that reward superficial taps over deep progress.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── BENTO INSTRUMENT CLUSTER ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            HIGH-PRECISION TOOLING
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground tracking-tight">
            The Instrument Cluster
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Every module is engineered with the tactile depth of an aerospace flight deck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 2-column span — Trajectory Engine */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/30" />

            <div>
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                PREDICTIVE ANALYTICS
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mt-1 mb-3">
                Calculated Trajectory & Buffer Cone
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Rather than asking "Did you complete all 15 tasks today?", the Trajectory Engine computes velocity against your master horizon. If you maintain 85% completion, you finish ahead of schedule.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-foreground">Velocity Vectoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-sm bg-emerald-500/30" />
                <span className="text-muted-foreground">Standard Deviation Buffers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Deterministic Completion Dates</span>
              </div>
            </div>
          </div>

          {/* Card 2: 1-column span — The Mentor */}
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/30" />

            <div>
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Brain className="size-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                CALM INTELLIGENCE
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mt-1 mb-3">
                The Diagnostic Mentor
              </h3>
              <div className="p-3 rounded-lg border border-border/80 bg-background/80 font-mono text-[11px] space-y-1.5 text-muted-foreground">
                <div className="text-emerald-400/90 font-semibold">&gt; TELEMETRY RUN #042</div>
                <div>Status: Trajectory in Buffer</div>
                <div>Variance: -2.4% (Normal)</div>
                <div className="text-foreground">&gt; Recommendation: Protect evening recovery.</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
              Grounded strictly in your logged evidence. Zero generic platitudes.
            </div>
          </div>

          {/* Card 3: 1-column span — Solo Leveling Hunter Ranks */}
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/30" />

            <div>
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Award className="size-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                PROGRESSION SCALE
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mt-1 mb-3">
                Hunter Rank Telemetry
              </h3>

              {/* Mini Rank Selector */}
              <div className="grid grid-cols-6 gap-1.5 p-1 rounded-lg bg-background/80 border border-border/70 mb-3">
                {hunterRanks.map((r) => (
                  <button
                    key={r.rank}
                    onClick={() => setSelectedRank(r.rank)}
                    className={`py-1 text-xs font-mono font-bold rounded transition-colors ${
                      selectedRank === r.rank
                        ? 'bg-emerald-500 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r.rank}
                  </button>
                ))}
              </div>

              {/* Rank Detail Box */}
              {(() => {
                const current = hunterRanks.find((r) => r.rank === selectedRank) || hunterRanks[3];
                return (
                  <div className="p-3 rounded-lg border border-border/60 bg-card/40 text-xs">
                    <div className="font-display font-semibold text-foreground flex items-center justify-between">
                      <span>{current.title}</span>
                      <span className="font-mono text-emerald-400">{current.minXp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                      Gate: {current.focusReq}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
              Mathematical milestones. Authentic pride.
            </div>
          </div>

          {/* Card 4: 2-column span — Local-First Security */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-emerald-400/30" />

            <div>
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <Lock className="size-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                ZERO SURVEILLANCE
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mt-1 mb-3">
                Local-First & Offline Resilience
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Your goals and focus habits are deeply personal. The Improvement System functions completely offline with client-side persistence and end-to-end sync encryption. No tracking pixels, no behavioral profiling, no data broking.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="text-emerald-400 font-medium">✓ Client Encrypted</span>
              <span className="text-muted-foreground">• Full Offline Capability</span>
              <span className="text-muted-foreground">• Zero Third-Party Trackers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION (LIQUID GLASS DOCK) ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-8 sm:p-14 text-center border border-emerald-500/30 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Edge and radial illumination */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
              INITIALIZE PROTOCOL
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground mt-2 mb-4 leading-tight">
              One Commitment Today.
              <br />
              <span className="text-emerald-400">Compounding Evidence Forever.</span>
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mb-8 leading-relaxed">
              Step away from the infinite to-do churn. Anchor your daily focus, protect your buffer, and build an indisputable record of growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                size="lg"
                variant="neon"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-5 font-display text-sm sm:text-base font-semibold shadow-lg shadow-emerald-500/20"
              >
                <span>Enter The System</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/80"
              >
                <span>Open Dashboard Demo</span>
              </Button>
            </div>

            <p className="text-[11px] font-mono text-muted-foreground/80 mt-5">
              Instant Setup • No Credit Card Required • Distraction Free
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
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

          <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <button
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-foreground transition-colors"
            >
              Telemetry Dashboard
            </button>
            <span className="text-border">|</span>
            <span className="text-muted-foreground/60">© 2026 The Improvement System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
