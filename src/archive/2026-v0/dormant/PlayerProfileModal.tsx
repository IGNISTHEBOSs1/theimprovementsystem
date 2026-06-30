import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Target, Zap, Shield, Star, Crown, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AVATAR_OPTIONS } from './EditProfileModal';
import { cn } from '@/lib/utils';

interface PlayerData {
  username: string;
  level: number;
  rank: string;
  avatar_id: string;
  total_quests_completed: number;
  credits: number;
  current_streak: number;
  longest_streak: number;
  achievements: string[];
  stats?: Record<string, number>;
  bio?: string;
}

const RANK_STYLES: Record<string, { color: string; border: string; bg: string }> = {
  'E-Rank Hunter':         { color: 'text-slate-400',  border: 'border-slate-500/30',  bg: 'from-slate-900/30' },
  'D-Rank Hunter':         { color: 'text-green-400',  border: 'border-green-500/40',  bg: 'from-green-900/30' },
  'C-Rank Hunter':         { color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'from-blue-900/30'  },
  'B-Rank Hunter':         { color: 'text-cyan-400',   border: 'border-cyan-500/40',   bg: 'from-cyan-900/30'  },
  'A-Rank Hunter':         { color: 'text-purple-400', border: 'border-purple-500/50', bg: 'from-purple-900/30'},
  'S-Rank Hunter':         { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'from-yellow-900/30'},
  'National-Level Hunter': { color: 'text-rose-400',   border: 'border-rose-500/60',   bg: 'from-rose-900/30'  },
};

interface PlayerProfileModalProps {
  userId: string;
  username: string;
  onClose: () => void;
}

export const PlayerProfileModal = ({ userId, username, onClose }: PlayerProfileModalProps) => {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('leaderboard_view')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          // Also get profile for bio/avatar
          const { data: profile } = await supabase
            .from('profiles')
            .select('bio, avatar_id')
            .eq('id', userId)
            .single();

          setPlayer({
            username: data.username || username,
            level: data.level || 1,
            rank: data.rank || 'E-Rank Hunter',
            avatar_id: profile?.avatar_id || data.avatar_id || 'warrior',
            total_quests_completed: data.total_quests_completed || 0,
            credits: data.credits || 0,
            current_streak: data.current_streak || 0,
            longest_streak: data.longest_streak || 0,
            achievements: Array.isArray(data.achievements) ? data.achievements : [],
            stats: (data as any).stats,
            bio: profile?.bio,
          });
        }
      } catch (e) {
        console.error('Failed to load player:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const rankStyle = player ? (RANK_STYLES[player.rank] || RANK_STYLES['E-Rank Hunter']) : RANK_STYLES['E-Rank Hunter'];
  const avatar = AVATAR_OPTIONS.find(a => a.id === player?.avatar_id) || AVATAR_OPTIONS[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-md glass-strong rounded-3xl border border-white/10 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn('relative px-6 pt-6 pb-5 bg-gradient-to-br to-transparent', rankStyle.bg)}>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            ) : player ? (
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={cn('w-20 h-20 rounded-2xl overflow-hidden border-2', avatar.border)}>
                    <img src={avatar.url} alt={player.username} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-primary border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-display font-black text-white">{player.level}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-black text-foreground">{player.username}</h2>
                  {player.bio && <p className="text-xs text-muted-foreground italic mt-0.5">"{player.bio}"</p>}
                  <span className={cn('inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold border bg-background/30', rankStyle.color, rankStyle.border)}>
                    {player.rank}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Failed to load player data</p>
            )}
          </div>

          {player && !loading && (
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Target className="w-4 h-4 text-primary" />,     label: 'Quests', value: player.total_quests_completed },
                  { icon: <Flame className="w-4 h-4 text-orange-400" />,   label: 'Streak',  value: `${player.current_streak}d` },
                  { icon: <Trophy className="w-4 h-4 text-accent" />,      label: 'Badges',  value: player.achievements.length },
                  { icon: <Zap className="w-4 h-4 text-yellow-400" />,     label: 'Credits', value: player.credits },
                  { icon: <Star className="w-4 h-4 text-violet-400" />,    label: 'Best Str', value: `${player.longest_streak}d` },
                  { icon: <Crown className="w-4 h-4 text-primary" />,      label: 'Level',   value: player.level },
                ].map((s, i) => (
                  <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5 text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <p className="font-display font-bold text-sm text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Stats bars */}
              {player.stats && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hunter Stats</p>
                  {Object.entries(player.stats).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] font-display font-bold text-muted-foreground w-7">{key}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-6 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
