import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, ArrowRight, Star, CheckCircle2, Brain, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';

const steps = [
  {
    num: '01',
    title: 'Clarify Your Direction',
    desc: 'Define your long-term primary goal to anchor your daily energy and decisions.',
  },
  {
    num: '02',
    title: 'Commit to Today',
    desc: 'Lock in your single primary deep focus plus up to two recurring daily routines.',
  },
  {
    num: '03',
    title: 'Build Trajectory',
    desc: 'Follow through with deliberate action and watch honest evidence compound over time.',
  },
];

const stats = [
  { value: '1 Focus', label: 'Primary Commitment / Day' },
  { value: '3 Max', label: 'Simultaneous Active Tasks' },
  { value: '100%', label: 'Private & Distraction-Free' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb-1" />
      <div className="orb-2" />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)/0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-10 container mx-auto px-4 md:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SystemLogo size={36} />
          <div>
            <h1 className="font-display font-bold text-lg text-foreground tracking-tight leading-none">
              THE IMPROVEMENT SYSTEM
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-wider mt-0.5">
              PERSONAL TRAJECTORY ENGINE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
          <Button
            variant="neon"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-8"
          >
            <Star className="size-3.5 text-primary" />
            <span className="text-label text-primary font-medium">A Quiet Operating System for Deliberate Growth</span>
          </motion.div>

          {/* Headline — staggered words */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-display-xl text-foreground mb-6 leading-tight"
          >
            {'Master Your Trajectory'.split(' ').map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}
            <br />
            {'With Deliberate Focus'.split(' ').map((word, i) => (
              <motion.span
                key={`2-${i}`}
                variants={wordVariants}
                className={`inline-block mr-[0.25em] ${i === 0 ? 'text-gradient-primary' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-body-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Cut through the noise of endless task lists and fake gamification. A calm, rigorous system designed
            to help you commit to what matters, execute cleanly, and build lasting evidence of your growth.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              variant="neon"
              onClick={() => navigate('/auth')}
              className="font-display text-base min-w-[200px]"
            >
              Start Your System
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-muted-foreground hover:text-foreground group"
            >
              See How It Works
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-16 mx-auto max-w-3xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />
            <div className="material-surface rounded-2xl border border-border/80 p-6 shadow-card">
              {/* Mock header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Target className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">DAILY TRAJECTORY</div>
                    <div className="text-xs text-muted-foreground">1 Primary Focus + 2 Routines</div>
                  </div>
                </div>
                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Cadence: Active
                </div>
              </div>

              {/* Mock commitments */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded-md border border-primary/40 bg-primary/20 flex items-center justify-center text-primary">
                      <CheckCircle2 className="size-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider">Deep Focus</div>
                      <div className="text-sm font-medium text-foreground">Ship system architecture & token specs</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary">Completed</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded-md border border-border flex items-center justify-center">
                      <CheckCircle2 className="size-3.5 text-muted-foreground/40" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Routine (Daily)</div>
                      <div className="text-sm font-medium text-foreground">30-minute deliberate technical reading</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">In progress</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded-md border border-border flex items-center justify-center">
                      <CheckCircle2 className="size-3.5 text-muted-foreground/40" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Routine (Daily)</div>
                      <div className="text-sm font-medium text-foreground">Evening shutdown & calendar reflection</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 border-y border-border/60 bg-card/40 py-5"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-8 md:gap-20">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`text-center ${i < stats.length - 1 ? 'md:pr-20 md:border-r md:border-border/60' : ''}`}
              >
                <p className="font-display font-bold text-2xl text-foreground tracking-tight">{s.value}</p>
                <p className="text-label text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FEATURES (BENTO GRID) ── */}
      <section id="features" className="relative z-10 container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-label text-primary mb-3">Architecture</p>
            <h2 className="text-display-lg text-foreground mb-4">Designed for Quiet Follow-Through</h2>
            <p className="text-body-md text-muted-foreground max-w-xl mx-auto">
              Every feature exists to reduce cognitive load and protect your attention for what actually matters.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Card 1: 2-column span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card hover:border-primary/40 transition-all duration-300"
          >
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Target className="size-6 text-primary" />
            </div>
            <p className="text-label text-primary mb-1">FOCUS & CADENCE</p>
            <h3 className="text-display-md text-foreground mb-2">1 Deep Focus + 2 Daily Routines</h3>
            <p className="text-body-sm text-muted-foreground max-w-lg leading-relaxed">
              Say goodbye to to-do list paralysis. Each morning, commit to your single highest-leverage task,
              supported by up to two non-negotiable daily habits. Disciplined, clear, and realistic.
            </p>
          </motion.div>

          {/* Card 2: 1-column span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card hover:border-primary/40 transition-all duration-300"
          >
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Brain className="size-6 text-primary" />
            </div>
            <p className="text-label text-primary mb-1">CALIBRATED GUIDANCE</p>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">The Mentor</h3>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              No generic motivational platitudes. The system analyzes your actual completion rate and offers calm,
              objective reflection grounded in evidence.
            </p>
          </motion.div>

          {/* Card 3: 1-column span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card hover:border-primary/40 transition-all duration-300"
          >
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Compass className="size-6 text-primary" />
            </div>
            <p className="text-label text-primary mb-1">ACCOUNTABILITY</p>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Objective Trajectory</h3>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              See your actual progress measured against your long-term goal. Real evidence of daily discipline,
              free of inflated gamification metrics.
            </p>
          </motion.div>

          {/* Card 4: 2-column span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card hover:border-primary/40 transition-all duration-300"
          >
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Shield className="size-6 text-primary" />
            </div>
            <p className="text-label text-primary mb-1">CRAFT & SIMPLICITY</p>
            <h3 className="text-display-md text-foreground mb-2">Zero Artificial Gamification</h3>
            <p className="text-body-sm text-muted-foreground max-w-lg leading-relaxed">
              No casino sounds, predatory streaks, or manipulative dopamine loops. Built with clean typography,
              subtle ambient shadows, and a dedicated Command Palette for effortless focus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-label text-primary mb-3">Workflow</p>
            <h2 className="text-display-lg text-foreground">Three Steps to Deliberate Execution</h2>
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-10 left-[calc(50%/3)] right-[calc(50%/3)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="size-20 mx-auto mb-5 rounded-2xl material-surface border border-primary/20 flex items-center justify-center relative shadow-card">
                  <span className="font-display font-bold text-2xl text-primary">{step.num}</span>
                  <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <CheckCircle2 className="size-3 text-primary" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="material-surface rounded-3xl p-8 md:p-16 text-center border border-primary/20 shadow-elevated relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-label text-primary mb-3">Begin Today</p>
            <h2 className="text-display-lg text-foreground mb-4">
              Your Trajectory Starts With One Commitment
            </h2>
            <p className="text-body-md text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Step off the treadmill of task overload. Commit to quiet focus, deliberate progress, and verifiable growth.
            </p>
            <Button
              size="lg"
              variant="neon"
              onClick={() => navigate('/auth')}
              className="font-display text-base mx-auto px-8"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-border/60 py-8 bg-card/20">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SystemLogo size={24} />
            <span className="text-sm font-semibold text-foreground">The Improvement System</span>
            <span className="text-xs text-muted-foreground ml-2">Personal Trajectory Engine</span>
          </div>
          <div className="flex items-center gap-6 text-body-sm text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
