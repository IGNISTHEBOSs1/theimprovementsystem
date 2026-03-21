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
}

const navItems: NavItem[] = [
  {
    id: 'awakening',
    title: 'Dashboard',
    jp: 'ダッシュボード',
    icon: <Shield className="w-7 h-7" />,
    description: 'Your hunter overview',
    color: 'from-primary/20 to-primary/5',
  },
  {
    id: 'quests',
    title: 'Quests',
    jp: 'クエスト',
    icon: <Target className="w-7 h-7" />,
    description: 'Daily quests & tasks',
    color: 'from-secondary/20 to-secondary/5',
  },
  {
    id: 'habits',
    title: 'Habits',
    jp: 'ハビット',
    icon: <Swords className="w-7 h-7" />,
    description: 'Track your habits',
    color: 'from-accent/20 to-accent/5',
  },
  {
    id: 'gates',
    title: 'Gates',
    jp: 'ゲート',
    icon: <Lock className="w-7 h-7" />,
    description: 'Boss challenges',
    color: 'from-red-500/20 to-red-500/5',
  },
  {
    id: 'leaderboards',
    title: 'Rankings',
    jp: 'ランキング',
    icon: <Users className="w-7 h-7" />,
    description: 'Global leaderboard',
    color: 'from-green-500/20 to-green-500/5',
  },
  {
    id: 'profile',
    title: 'Profile',
    jp: 'プロフィール',
    icon: <User className="w-7 h-7" />,
    description: 'Hunter profile & shadows',
    color: 'from-violet-500/20 to-violet-500/5',
  },
];

interface NavigationHubProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const NavigationHub = ({ activeSection, onNavigate }: NavigationHubProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {navItems.map((item, index) => {
        const isActive = activeSection === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'relative overflow-hidden rounded-2xl p-4 border text-left transition-all duration-200',
              isActive
                ? 'border-primary/40 bg-primary/10 shadow-lg shadow-primary/10'
                : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
            )}
          >
            {/* Gradient bg */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', item.color)} />

            {/* Active glow line */}
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
              />
            )}

            <div className="relative flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
              )}>
                <div className="w-5 h-5">{item.icon}</div>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className={cn('font-display font-bold text-sm leading-none', isActive ? 'text-primary' : 'text-foreground')}>
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-jp mt-1">{item.jp}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 truncate hidden sm:block">{item.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
