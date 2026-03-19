import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Calendar, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const AVATAR_OPTIONS = [
  { id: 'shadow',    name: 'Shadow Monarch', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=shadow&backgroundColor=0a0a1a&hair=long01&eyes=variant01' },
  { id: 'warrior',   name: 'Iron Warrior',   url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ironwarrior&backgroundColor=1a0a0a&eyes=variant04' },
  { id: 'mage',      name: 'Arc Mage',       url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=arcmage&backgroundColor=0a0a2e&eyes=variant06' },
  { id: 'ninja',     name: 'Void Ninja',     url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=voidninja&backgroundColor=0a1a0a&eyes=variant02' },
  { id: 'knight',    name: 'Frost Knight',   url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=frostknight&backgroundColor=0a1a2e&eyes=variant08' },
  { id: 'assassin',  name: 'Assassin',       url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=assassin99&backgroundColor=1a0a1a&eyes=variant05' },
  { id: 'paladin',   name: 'Holy Paladin',   url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=paladin7&backgroundColor=1a1a0a&eyes=variant07' },
  { id: 'berserker', name: 'Berserker',      url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=berserker3&backgroundColor=2a0a0a&eyes=variant03' },
  { id: 'ranger',    name: 'Ranger',         url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ranger55&backgroundColor=0a2a1a&eyes=variant09' },
  { id: 'sorcerer',  name: 'Sorcerer',       url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sorcerer22&backgroundColor=1a0a2a&eyes=variant10' },
  { id: 'druid',     name: 'Druid',          url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=druid44&backgroundColor=0a2a0a&eyes=variant11' },
  { id: 'reaper',    name: 'Soul Reaper',    url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=reaper77&backgroundColor=1a1a1a&eyes=variant12' },
];

const AVATAR_RARITY: Record<string, { label: string; color: string; border: string; glow: string }> = {
  shadow:    { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30' },
  warrior:   { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/40',  glow: '' },
  mage:      { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/25' },
  ninja:     { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/40',  glow: '' },
  knight:    { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  assassin:  { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/25' },
  paladin:   { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  berserker: { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/40',  glow: '' },
  ranger:    { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/40',  glow: '' },
  sorcerer:  { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30' },
  druid:     { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  reaper:    { label: 'Mythic',    color: 'text-rose-400',   border: 'border-rose-500/70',   glow: 'shadow-rose-500/40' },
};

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
  const selectedRarity = AVATAR_RARITY[avatarId] || AVATAR_RARITY['warrior'];

  const handleSave = async () => {
    if (!username.trim()) {
      toast({ title: 'Username required', description: 'Please enter a username', variant: 'destructive' });
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
      toast({ title: '✓ Profile updated', description: 'Your changes have been saved' });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
            onClick={onClose}
          />

          {/* Modal — centered with fixed positioning, never goes off screen */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-lg max-h-[88vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#080810] border border-white/8 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-primary/10 max-h-[88vh]">

                {/* Header — fixed, never scrolls */}
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
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-colors"
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
                          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${selectedRarity.border} bg-card shadow-lg ${selectedRarity.glow}`}
                        >
                          <img src={selectedAvatar.url} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                        </motion.div>
                        <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${selectedRarity.color} bg-[#080810] border border-white/10 whitespace-nowrap`}>
                          {selectedRarity.label}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-base text-foreground truncate">{username || 'Hunter'}</p>
                        <p className={`text-xs font-medium mt-0.5 ${selectedRarity.color}`}>{selectedAvatar.name}</p>
                        {bio && <p className="text-xs text-muted-foreground mt-1 italic">"{bio}"</p>}
                      </div>
                    </div>
                  </div>

                  {/* Avatar grid */}
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Choose Avatar
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const rarity = AVATAR_RARITY[avatar.id];
                        const isSelected = avatarId === avatar.id;
                        return (
                          <motion.button
                            key={avatar.id}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { playClick(); setAvatarId(avatar.id); }}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              isSelected ? `${rarity.border} shadow-lg ${rarity.glow}` : 'border-white/8 hover:border-white/20'
                            }`}
                          >
                            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover bg-card" />
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                              >
                                <CheckCircle2 className="w-5 h-5 text-white drop-shadow-lg" />
                              </motion.div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pb-1 pt-2">
                              <p className={`text-[8px] text-center font-bold truncate px-1 ${isSelected ? rarity.color : 'text-white/60'}`}>
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
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your hunter name"
                      maxLength={20}
                      className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl"
                    />
                    <p className={`text-[10px] text-right tabular-nums ${username.length >= 18 ? 'text-accent' : 'text-muted-foreground/50'}`}>
                      {username.length}/20
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Bio
                      <span className="text-muted-foreground/40 normal-case font-normal text-[10px]">(max 50 chars)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your hunter..."
                        maxLength={50}
                        className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl pr-14"
                      />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                        bio.length >= 45 ? 'text-accent' : 'text-muted-foreground/50'
                      }`}>
                        {bio.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date of Birth
                      <span className="text-muted-foreground/40 normal-case font-normal text-[10px]">(optional)</span>
                    </Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-white/4 border-white/8 focus:border-primary h-10 text-sm rounded-xl"
                    />
                  </div>

                </div>

                {/* Footer — fixed, never scrolls */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-white/5 flex gap-3 bg-[#080810]">
                  <Button variant="outline" onClick={onClose} className="flex-1 bg-white/4 border-white/8 hover:bg-white/8 h-10 text-sm rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/80 text-white h-10 text-sm font-display font-bold rounded-xl shadow-lg shadow-primary/20"
                  >
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
