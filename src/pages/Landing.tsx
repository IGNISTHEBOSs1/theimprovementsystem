import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Flame, Trophy, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Target, title: 'Daily Quests', description: 'Complete tasks to earn XP and level up' },
  { icon: Flame, title: 'Habit Tracking', description: 'Build consistency with streak rewards' },
  { icon: Trophy, title: 'Achievements', description: 'Unlock badges and show your progress' },
  { icon: Zap, title: 'AI Assistant', description: 'Get personalized improvement advice' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.015%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">THE SYSTEM</h1>
              <p className="text-xs text-muted-foreground font-jp">システム</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary active:scale-[0.98] transition-transform duration-100"
          >
            Sign In
          </Button>
        </header>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Level Up Your Life</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
            >
              Become the{' '}
              <span className="text-gradient-primary">Hunter</span>
              <br />
              You're Meant to Be
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Transform your daily habits into epic quests. Track your progress, 
              build streaks, and unlock achievements as you level up in real life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-display text-lg px-8 active:scale-[0.98] transition-transform duration-100"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mt-6 font-jp"
            >
              システムに選ばれし者よ、覚醒せよ
            </motion.p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="glass-strong rounded-3xl p-8 md:p-12 text-center border-glow-primary"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Awaken Your Potential?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of hunters who are transforming their lives one quest at a time.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-display active:scale-[0.98] transition-transform duration-100"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-jp">システムに選ばれし者よ、前へ進め</p>
          <p className="mt-1">Hunter, you have been chosen. Move forward.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
