import { motion } from 'framer-motion';
import { Shield, Target, Swords, Lock, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  title: string;
  jp: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  locked?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'awakening',
    title: 'Awakening',
    jp: '覚醒',
    icon: <Shield className="w-8 h-8" />,
    description: 'View your stats and progression',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    id: 'habits',
    title: 'Habits',
    jp: '習慣',
    icon: <Target className="w-8 h-8" />,
    description: 'Long-term consistency tracking',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    id: 'quests',
    title: 'Quests',
    jp: 'クエスト',
    icon: <Swords className="w-8 h-8" />,
    description: 'Daily to-do challenges',
    color: 'from-amber-500/20 to-amber-600/10',
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    jp: 'ランキング',
    icon: <Users className="w-8 h-8" />,
    description: 'Compare with other players',
    color: 'from-green-500/20 to-green-600/10',
  },
  {
    id: 'gates',
    title: 'Gates',
    jp: 'ゲート',
    icon: <Lock className="w-8 h-8" />,
    description: 'Locked milestone challenges',
    color: 'from-red-500/20 to-red-600/10',
    locked: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

interface NavigationHubProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const NavigationHub = ({ activeSection, onNavigate }: NavigationHubProps) => {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {navItems.map((item) => (
        <motion.button
          key={item.id}
          variants={itemVariants}
          whileHover={{ scale: item.locked ? 1 : 1.02, y: item.locked ? 0 : -4 }}
          whileTap={{ scale: item.locked ? 1 : 0.97 }}
          onClick={() => !item.locked && onNavigate(item.id)}
          disabled={item.locked}
          className={cn(
            "relative glass rounded-2xl p-6 text-left border transition-all duration-200 group overflow-hidden will-animate",
            activeSection === item.id 
              ? "border-primary/50 glow-primary" 
              : "border-white/10 hover:border-white/20",
            item.locked && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Active indicator bar */}
          {activeSection === item.id && (
            <motion.div
              layoutId="nav-active-bar"
              className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            item.color
          )} />

          <div className="relative z-10">
            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
              activeSection === item.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground group-hover:text-foreground"
            )}>
              {item.icon}
              {item.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              {item.title}
            </h3>
            <p className="text-sm font-jp text-muted-foreground mb-3">{item.jp}</p>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {item.description}
            </p>

            {/* Arrow */}
            {!item.locked && (
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <span>Enter</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            )}

            {item.locked && (
              <div className="text-sm text-muted-foreground">
                Unlock at Level 15
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};
