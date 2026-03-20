import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Calendar, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Dark fantasy character avatars — actual illustrated portraits
export const AVATAR_OPTIONS = [
  {
    id: 'shadow',
    name: 'Shadow Monarch',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=shadowmonarch&backgroundColor=0a0a1a&backgroundType=gradientLinear&backgroundRotation=270',
    rarity: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30',
  },
  {
    id: 'reaper',
    name: 'Soul Reaper',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=soulreaper&backgroundColor=1a0010&backgroundType=gradientLinear&backgroundRotation=135',
    rarity: 'Mythic', color: 'text-rose-400', border: 'border-rose-500/70', glow: 'shadow-rose-500/40',
  },
  {
    id: 'mage',
    name: 'Arc Mage',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=arcmage&backgroundColor=06061f&backgroundType=gradientLinear&backgroundRotation=225',
    rarity: 'Epic', color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/25',
  },
  {
    id: 'assassin',
    name: 'Void Assassin',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=voidassassin&backgroundColor=0d0d0d&backgroundType=gradientLinear&backgroundRotation=180',
    rarity: 'Epic', color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/25',
  },
  {
    id: 'knight',
    name: 'Frost Knight',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=frostknight&backgroundColor=061a2e&backgroundType=gradientLinear&backgroundRotation=315',
    rarity: 'Rare', color: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/20',
  },
  {
    id: 'paladin',
    name: 'Holy Paladin',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=holypaladin&backgroundColor=1a1400&backgroundType=gradientLinear&backgroundRotation=45',
    rarity: 'Rare', color: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/20',
  },
  {
    id: 'warrior',
    name: 'Iron Warrior',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=ironwarrior&backgroundColor=1a0808&backgroundType=gradientLinear&backgroundRotation=0',
    rarity: 'Uncommon', color: 'text-green-400', border: 'border-green-500/40', glow: '',
  },
  {
    id: 'ninja',
    name: 'Void Ninja',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=voidninja&backgroundColor=040d0a&backgroundType=gradientLinear&backgroundRotation=90',
    rarity: 'Uncommon', color: 'text-green-400', border: 'border-green-500/40', glow: '',
  },
  {
    id: 'berserker',
    name: 'Berserker',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=berserkerx&backgroundColor=2a0505&backgroundType=gradientLinear&backgroundRotation=270',
    rarity: 'Common', color: 'text-slate-400', border: 'border-slate-500/40', glow: '',
  },
  {
    id: 'ranger',
    name: 'Forest Ranger',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=forestranger&backgroundColor=021a08&backgroundType=gradientLinear&backgroundRotation=45',
    rarity: 'Common', color: 'text-slate-400', border: 'border-slate-500/40', glow: '',
  },
  {
    id: 'sorcerer',
    name: 'Dark Sorcerer',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=darksorcerer&backgroundColor=12001a&backgroundType=gradientLinear&backgroundRotation=315',
    rarity: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30',
  },
  {
    id: 'druid',
    name: 'Nature Druid',
    url: 'https://api.dicebear.com/9.x/glass/svg?seed=naturedruid&backgroundColor=001a04&backgroundType=gradientLinear&backgroundRotation=180',
    rarity: 'Rare', color: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/20',
  },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const EditProfileModal = ({ isOpen, onClose, profile }: EditProfileModalProps) => {
  const [username, setUsername] = useState(profile.username);
  const [avatarId, setAvatarId] = useState(profile.avatar_id);
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useAuth();
  const { playClick, playQuestComplete } = useSoundEffects();

  const selectedAvatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];

  const handleSave = async () => {
    if (!username.trim()) {
      toast({ title: 'Username required', variant: 'destructive' });
      return;
    }
    if (username.length > 20) {
      toast({ title: 'Username too long', description: 'Max 20 characters', variant: 'destructive' });
      return;
    }
    if (bio.length > 50) {
      toast({ title: 'Bio too long', description: 'Max 50 characters', variant: 'destructive' });
      return;
    }
    setSaving(true);
    playClick();
    const { error } = await updateProfile({
      username: username.trim(),
      avatar_id: avatarId,
      date_of_birth: dateOfBirth || null,
      bio: bio.trim(),
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    } else {
      playQuestComplete();
      toast({ title: '✓ Profile updated' });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-lg flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#080810] border border-white/8 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-primary/10 max-h-[88vh]">

                {/* Header */}
                <div className="relative flex-shrink-0 px-6 pt-5 pb-4 border-b border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-base text-foreground tracking-wide">EDIT PROFILE</h2>
                        <p className="text-[11px] text-muted-foreground font-jp tracking-widest">プロフィール編集</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                  {/* Live preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
                    <div className="relative flex items-center gap-4 p-4">
                      <div className="relative flex-shrink-0">
                        <motion.div
                          key={avatarId}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${selectedAvatar.border} bg-card shadow-lg ${selectedAvatar.glow}`}
                        >
                          <img src={selectedAvatar.url} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                        </motion.div>
                        <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${selectedAvatar.color} bg-[#080810] border border-white/10 whitespace-nowrap`}>
                          {selectedAvatar.rarity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-base text-foreground truncate">{username || 'Hunter'}</p>
                        <p className={`text-xs font-medium mt-0.5 ${selectedAvatar.color}`}>{selectedAvatar.name}</p>
                        {bio && <p className="text-xs text-muted-foreground mt-1 italic">"{bio}"</p>}
                      </div>
                    </div>
                  </div>

                  {/* Avatar grid */}
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Choose Avatar</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = avatarId === avatar.id;
                        return (
                          <motion.button
                            key={avatar.id}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { playClick(); setAvatarId(avatar.id); }}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              isSelected ? `${avatar.border} shadow-lg ${avatar.glow}` : 'border-white/8 hover:border-white/20'
                            }`}
                          >
                            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover bg-[#0a0a14]" />
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                              >
                                <CheckCircle2 className="w-5 h-5 text-white drop-shadow-lg" />
                              </motion.div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pb-1 pt-3">
                              <p className={`text-[8px] text-center font-bold truncate px-1 ${isSelected ? avatar.color : 'text-white/60'}`}>
                                {avatar.name}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Hunter Name
                    </Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your hunter name" maxLength={20} className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl" />
                    <p className={`text-[10px] text-right tabular-nums ${username.length >= 18 ? 'text-accent' : 'text-muted-foreground/50'}`}>{username.length}/20</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Bio
                    </Label>
                    <div className="relative">
                      <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your hunter..." maxLength={50} className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl pr-14" />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${bio.length >= 45 ? 'text-accent' : 'text-muted-foreground/50'}`}>{bio.length}/50</span>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date of Birth <span className="text-muted-foreground/40 normal-case font-normal text-[10px]">(optional)</span>
                    </Label>
                    <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-white/5 flex gap-3 bg-[#080810]">
                  <Button variant="outline" onClick={onClose} className="flex-1 bg-white/4 border-white/8 hover:bg-white/8 h-10 text-sm rounded-xl">Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/80 text-white h-10 text-sm font-display font-bold rounded-xl shadow-lg shadow-primary/20">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Save className="w-4 h-4" />
                        </motion.div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
