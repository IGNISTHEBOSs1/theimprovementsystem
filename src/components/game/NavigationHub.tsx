import { motion } from 'framer-motion';
import { Shield, Target, Swords, Lock, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  title: string;
  jp: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  { id: 'awakening',   title: 'Dashboard', jp: 'ダッシュボード', icon: <Shield className="w-5 h-5" />,  description: 'Your hunter overview', color: 'from-primary/15 to-primary/5',     activeColor: 'text-primary' },
  { id: 'quests',      title: 'Quests',    jp: 'クエスト',       icon: <Target className="w-5 h-5" />,  description: 'Daily quests & tasks',  color: 'from-secondary/15 to-secondary/5', activeColor: 'text-secondary' },
  { id: 'habits',      title: 'Habits',    jp: 'ハビット',       icon: <Swords className="w-5 h-5" />,  description: 'Track your habits',     color: 'from-accent/15 to-accent/5',       activeColor: 'text-accent' },
  { id: 'gates',       title: 'Gates',     jp: 'ゲート',         icon: <Lock className="w-5 h-5" />,    description: 'Boss challenges',       color: 'from-red-500/15 to-red-500/5',     activeColor: 'text-red-400' },
  { id: 'leaderboards',title: 'Rankings',  jp: 'ランキング',     icon: <Users className="w-5 h-5" />,   description: 'Global leaderboard',    color: 'from-green-500/15 to-green-500/5', activeColor: 'text-green-400' },
  { id: 'profile',     title: 'Profile',   jp: 'プロフィール',   icon: <User className="w-5 h-5" />,    description: 'Hunter profile',        color: 'from-violet-500/15 to-violet-500/5',activeColor: 'text-violet-400' },
];

interface NavigationHubProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const NavigationHub = ({ activeSection, onNavigate }: NavigationHubProps) => {
  return (
    <>
      {/* ── Desktop: card grid ── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
        {navItems.map((item, index) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'relative overflow-hidden rounded-xl p-4 border text-left transition-all duration-200',
                isActive
                  ? 'border-primary/40 bg-primary/10 shadow-[var(--shadow-glow-primary)]'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/5'
              )}
              aria-label={item.title}
            >
              {/* Gradient bg */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', item.color)} />

              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bar"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
                />
              )}

              <div className="relative flex flex-col gap-2">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex-center flex-shrink-0 transition-colors',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                )}>
                  {item.icon}
                </div>
                <div>
                  <p className={cn('font-display font-bold text-xs leading-none', isActive ? 'text-primary' : 'text-foreground')}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-jp mt-1">{item.jp}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Mobile: bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 glass-strong border-t border-white/10">
        <div className="flex items-stretch h-full">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 relative touch-target transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={item.title}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]"
                  />
                )}
                <span className={cn('transition-transform', isActive && 'scale-110')}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-medium tracking-wide leading-none">{item.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
};
