import { motion } from 'framer-motion';
import { Shield, Target, Swords, Lock, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  title: string;
  jp: string;
  icon: React.ReactNode;
  color: string;
  tabColor: string;
}

const navItems: NavItem[] = [
  { id: 'awakening',    title: 'Dashboard', jp: 'ダッシュボード', icon: <Shield className="w-5 h-5" />,  color: 'from-primary/20 to-primary/5',      tabColor: 'text-primary' },
  { id: 'quests',       title: 'Quests',    jp: 'クエスト',       icon: <Target className="w-5 h-5" />,  color: 'from-secondary/20 to-secondary/5',  tabColor: 'text-secondary' },
  { id: 'habits',       title: 'Habits',    jp: 'ハビット',       icon: <Swords className="w-5 h-5" />,  color: 'from-accent/20 to-accent/5',        tabColor: 'text-amber-400' },
  { id: 'gates',        title: 'Gates',     jp: 'ゲート',         icon: <Lock className="w-5 h-5" />,    color: 'from-red-500/20 to-red-500/5',      tabColor: 'text-red-400' },
  { id: 'leaderboards', title: 'Rankings',  jp: 'ランキング',     icon: <Users className="w-5 h-5" />,   color: 'from-green-500/20 to-green-500/5',  tabColor: 'text-green-400' },
  { id: 'profile',      title: 'Profile',   jp: 'プロフィール',   icon: <User className="w-5 h-5" />,    color: 'from-violet-500/20 to-violet-500/5',tabColor: 'text-violet-400' },
];

interface NavigationHubProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const NavigationHub = ({ activeSection, onNavigate }: NavigationHubProps) => {
  return (
    <>
      {/* ── Desktop: card grid (md and above) ── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
        {navItems.map((item, index) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'relative overflow-hidden rounded-xl p-4 border text-left transition-all duration-200 group',
                isActive
                  ? 'border-primary/40 bg-primary/10 shadow-[var(--shadow-glow-primary)]'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              )}
              aria-label={item.title}
            >
              {/* Gradient background */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none transition-opacity duration-200 group-hover:opacity-80', item.color)} />

              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bar"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary)/0.8)]"
                />
              )}

              <div className="relative flex flex-col gap-2.5">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex-center flex-shrink-0 transition-all duration-200',
                  isActive ? 'bg-primary/25 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]' : 'bg-white/8 text-muted-foreground group-hover:text-foreground group-hover:bg-white/12'
                )}>
                  {item.icon}
                </div>
                <div>
                  <p className={cn('font-display font-bold text-xs leading-none', isActive ? 'text-primary' : 'text-foreground')}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-jp mt-1">{item.jp}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Mobile: fixed bottom tab bar (below md) ── */}
      {/* z-[55] — above main content (z-40 header) but below modals (z-[60]+) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[55] h-[60px]"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)/0.98) 60%, hsl(var(--background)/0.85) 100%)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4), 0 -1px 0 rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="flex items-stretch h-full px-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-[3px] relative transition-colors duration-150 min-w-0',
                  isActive ? item.tabColor : 'text-muted-foreground/60 hover:text-muted-foreground'
                )}
                aria-label={item.title}
              >
                {/* Active top indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full bg-primary"
                    style={{ boxShadow: '0 0 10px hsl(var(--primary)/0.9), 0 0 20px hsl(var(--primary)/0.4)' }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex-shrink-0"
                >
                  {item.icon}
                </motion.span>

                {/* Label */}
                <span className={cn(
                  'text-[9px] font-semibold tracking-wide leading-none truncate w-full text-center transition-all duration-150',
                  isActive ? 'opacity-100' : 'opacity-50'
                )}>
                  {item.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
};
