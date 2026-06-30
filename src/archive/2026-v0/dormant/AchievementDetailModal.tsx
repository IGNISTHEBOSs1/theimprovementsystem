import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Sparkles } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: 'text-slate-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
  mythic: 'text-rose-400',
  godly: 'text-cyan-300',
};

const rarityBg: Record<string, string> = {
  common: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
  uncommon: 'from-green-500/20 to-emerald-600/10 border-green-500/30',
  rare: 'from-blue-500/20 to-cyan-600/10 border-blue-500/30',
  epic: 'from-purple-500/20 to-pink-600/10 border-purple-500/30',
  legendary: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30',
  mythic: 'from-rose-500/20 to-red-600/10 border-rose-500/30',
  godly: 'from-cyan-400/20 to-blue-600/10 border-cyan-400/30',
};

const CACHE_KEY = 'achievement-images-cache';

const getImageCache = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch { return {}; }
};

const setImageCache = (id: string, url: string) => {
  const cache = getImageCache();
  cache[id] = url;
  // Keep cache size manageable - max 50 entries
  const keys = Object.keys(cache);
  if (keys.length > 50) {
    delete cache[keys[0]];
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const AchievementDetailModal = ({ achievement, onClose }: AchievementDetailModalProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    
    const cached = getImageCache()[achievement.id];
    if (cached) {
      setImageUrl(cached);
      return;
    }

    const generateImage = async () => {
      setImageLoading(true);
      setImageUrl(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const prompt = `A mystical ${achievement.rarity} rarity game achievement badge icon for "${achievement.name}": ${achievement.description}. Fantasy RPG style, dark background, glowing effects, ${achievement.rarity === 'godly' ? 'divine golden light, celestial' : achievement.rarity === 'mythic' ? 'crimson aura, ancient power' : achievement.rarity === 'legendary' ? 'golden glow, epic' : 'magical aura'}. Square icon art, detailed, game UI style.`;
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-achievement-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, achievementId: achievement.id }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setImageUrl(data.imageUrl);
            setImageCache(achievement.id, data.imageUrl);
          }
        }
      } catch (err) {
        console.error('Failed to generate achievement image:', err);
      } finally {
        setImageLoading(false);
      }
    };

    generateImage();
  }, [achievement]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-2xl border bg-gradient-to-br ${rarityBg[achievement.rarity]} backdrop-blur-xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${rarityColors[achievement.rarity]}`} />
              <span className={`text-xs uppercase tracking-wider font-bold ${rarityColors[achievement.rarity]}`}>
                {achievement.rarity} Achievement
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Image */}
          <div className="aspect-square w-full max-h-64 bg-black/30 flex items-center justify-center overflow-hidden">
            {imageLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className={`w-8 h-8 animate-spin ${rarityColors[achievement.rarity]}`} />
                <p className="text-xs text-muted-foreground">Generating achievement art...</p>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt={achievement.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">{achievement.icon}</span>
            )}
          </div>

          {/* Details */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{achievement.icon}</span>
              <div>
                <h3 className={`text-lg font-bold ${rarityColors[achievement.rarity]}`}>{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {achievement.unlocked && achievement.unlockedAt ? (
                  <span className="text-foreground">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                ) : (
                  <span className="text-muted-foreground">🔒 Not yet unlocked</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
