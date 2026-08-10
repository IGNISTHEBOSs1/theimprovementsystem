import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Flame, Trophy, ArrowRight, Star, Users, CheckCircle2, Brain, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemLogo } from '@/components/branding/Logo';

const features = [
  {
    icon: Target,
    title: 'Daily Quests',
    jp: 'クエスト',
    description: 'Transform your tasks into epic quests. Complete them to earn XP and level up your hunter rank.',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/20',
    large: true,
  },
  {
    icon: Flame,
    title: 'Habit Tracking',
    jp: '習慣',
    description: 'Build powerful habits through streak rewards and visual heatmaps.',
    color: 'from-orange-500/15 to-orange-500/5',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    large: false,
  },
  {
    icon: Trophy,
    title: 'Achievements',
    jp: '実績',
    description: 'Unlock badges and titles as you conquer milestones.',
    color: 'from-accent/15 to-accent/5',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/20',
    large: false,
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    jp: 'AI アシスタント',
    description: 'Your personal system AI generates quests and guides your growth.',
    color: 'from-secondary/15 to-secondary/5',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/20',
    large: false,
  },
  {
    icon: Swords,
    title: 'Gates & Bosses',
    jp: 'ゲート',
    description: 'Challenge boss encounters and earn legendary titles.',
    color: 'from-red-500/15 to-red-500/5',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
    large: false,
  },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Set your hunter name and choose your avatar to begin your awakening.' },
  { num: '02', title: 'Set Daily Quests', desc: 'Use the AI to generate personalized quests aligned with your goals.' },
  { num: '03', title: 'Level Up', desc: 'Complete quests, build habits, defeat bosses — rise through the ranks.' },
];

const stats = [
  { value: '1,200+', label: 'Active Hunters' },
  { value: '48,000+', label: 'Quests Completed' },
  { value: '99.9%', label: 'Uptime' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb-1" />
      <div className="orb-2" />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
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
            <h1 className="font-display font-black text-xl text-foreground tracking-widest leading-none">THE SYSTEM</h1>
            <p className="text-[10px] text-muted-foreground font-jp tracking-widest">システム</p>
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
      <section className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-28">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 mb-8"
          >
            <Star className="w-3.5 h-3.5 text-primary" />
            <span className="text-label text-primary">Solo Leveling Meets Real Life</span>
          </motion.div>

          {/* Headline — staggered words */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-display-xl text-foreground mb-6 leading-tight"
          >
            {'Become the Hunter'.split(' ').map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}
            <br />
            {'You Were Meant to Be'.split(' ').map((word, i) => (
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
            Transform your daily habits into epic quests. Track streaks, unlock achievements,
            and level up in real life — guided by an AI that knows your limits.
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
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-muted-foreground hover:text-foreground group"
            >
              See How It Works
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Japanese tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-label text-muted-foreground/60 mt-8 font-jp"
          >
            システムに選ばれし者よ、覚醒せよ
          </motion.p>

          {/* Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-16 mx-auto max-w-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />
            <div className="glass-strong rounded-2xl border border-primary/20 p-6 shadow-[0_0_60px_hsl(var(--primary)/0.15)]">
              {/* Mock header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-display font-bold text-foreground">SHADOW_HUNTER</div>
                    <div className="text-[10px] text-muted-foreground font-jp">B-Rank Hunter</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs font-display font-bold text-primary">42</div>
                    <div className="text-[9px] text-muted-foreground">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-display font-bold text-accent">1,850</div>
                    <div className="text-[9px] text-muted-foreground">Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-display font-bold text-orange-400">12🔥</div>
                    <div className="text-[9px] text-muted-foreground">Streak</div>
                  </div>
                </div>
              </div>
              {/* Mock XP bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Experience</span>
                  <span className="font-display text-primary">7,200 / 10,000 XP</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-primary-glow xp-bar" />
                </div>
              </div>
              {/* Mock quests */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Morning workout', done: true, diff: 'Normal', xp: 150 },
                  { title: 'Read 30 pages', done: true, diff: 'Easy', xp: 100 },
                  { title: 'Cold shower', done: false, diff: 'Hard', xp: 300 },
                ].map((q, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border text-left ${q.done ? 'border-success/30 bg-success/5' : 'border-white/8 bg-white/3'}`}>
                    <div className={`text-[9px] font-display font-semibold mb-1 ${q.done ? 'text-success' : q.diff === 'Hard' ? 'text-purple-400' : q.diff === 'Easy' ? 'text-green-400' : 'text-blue-400'}`}>{q.diff}</div>
                    <div className={`text-[10px] font-medium mb-1 ${q.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{q.title}</div>
                    <div className="text-[9px] text-primary font-display">+{q.xp} XP</div>
                  </div>
                ))}
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
        className="relative z-10 border-y border-white/5 bg-white/[0.015] py-4"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {stats.map((s, i) => (
              <div key={i} className={`text-center ${i < stats.length - 1 ? 'md:pr-16 md:border-r md:border-white/10' : ''}`}>
                <p className="font-display font-black text-2xl text-foreground">{s.value}</p>
                <p className="text-label text-muted-foreground">{s.label}</p>
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
            <p className="text-label text-primary mb-3">Features</p>
            <h2 className="text-display-lg text-foreground mb-4">Your Arsenal for Growth</h2>
            <p className="text-body-md text-muted-foreground max-w-xl mx-auto">
              Every tool you need to become the best version of yourself, wrapped in an RPG that actually works.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-primary/3 hover:border-primary/30 transition-all duration-300 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex-center mb-5">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <p className="text-label text-primary mb-1">クエスト</p>
            <h3 className="text-display-md text-foreground mb-3">Daily Quest System</h3>
            <p className="text-body-sm text-muted-foreground max-w-sm">
              Transform mundane tasks into legendary quests. The AI generates personalized challenges
              based on your goals, difficulty level, and past performance.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Learn more</span>
              <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Small card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-500/3 hover:border-orange-500/30 transition-all duration-300 p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex-center mb-4">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-label text-orange-400/70 mb-1">習慣</p>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Habit Tracking</h3>
            <p className="text-body-sm text-muted-foreground">Visual heatmaps + streak rewards that keep you consistent.</p>
          </motion.div>

          {/* Small card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 to-accent/3 hover:border-accent/30 transition-all duration-300 p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex-center mb-4">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <p className="text-label text-accent/70 mb-1">実績</p>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Achievements</h3>
            <p className="text-body-sm text-muted-foreground">Unlock badges and earn titles that showcase your legend.</p>
          </motion.div>

          {/* Small card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/10 to-secondary/3 hover:border-secondary/30 transition-all duration-300 p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex-center mb-4">
              <Brain className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-label text-secondary/70 mb-1">AI</p>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">AI Assistant</h3>
            <p className="text-body-sm text-muted-foreground">Your personal system AI generates quests and gives advice.</p>
          </motion.div>

          {/* Large card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/10 to-red-500/3 hover:border-red-500/30 transition-all duration-300 p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex-center mb-4">
              <Swords className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-label text-red-400/70 mb-1">ゲート</p>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Boss Gates</h3>
            <p className="text-body-sm text-muted-foreground">Face epic challenges to earn legendary titles and rewards.</p>
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
            <p className="text-label text-primary mb-3">How It Works</p>
            <h2 className="text-display-lg text-foreground">Three Steps to Awakening</h2>
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
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl glass border border-primary/20 flex-center relative">
                  <span className="font-display font-black text-2xl text-primary">{step.num}</span>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-body-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-3xl p-8 md:p-16 text-center border-glow-primary relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-label text-primary mb-4">Ready to Awaken?</p>
            <h2 className="text-display-lg text-foreground mb-4">
              Your Journey Begins Now
            </h2>
            <p className="text-body-md text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of hunters transforming their lives one quest at a time.
              It's free. No excuses.
            </p>
            <Button
              size="lg"
              variant="neon"
              onClick={() => navigate('/auth')}
              className="font-display text-base mx-auto"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-label text-muted-foreground/50 mt-6 font-jp">
              システムに選ばれし者よ、前へ進め
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SystemLogo size={24} />
            <span className="text-sm text-muted-foreground font-jp">システム — Level Up Your Life</span>
          </div>
          <div className="flex items-center gap-6 text-label text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
