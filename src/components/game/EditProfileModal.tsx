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
  {
    id: 'shadow',
    name: 'Shadow Hunter',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=shadowhunter&backgroundColor=0a0a1a&skinColor=f2d3b1&hair=long07&hairColor=3b1f0a&eyes=variant01&eyebrows=variant01&mouth=variant01&features=birthmark',
  },
  {
    id: 'warrior',
    name: 'Iron Warrior',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ironwarrior99&backgroundColor=1a0808&skinColor=d08b5b&hair=short01&hairColor=1a0a00&eyes=variant04&eyebrows=variant04&mouth=variant04',
  },
  {
    id: 'mage',
    name: 'Arc Mage',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=arcmage77&backgroundColor=06061f&skinColor=edb98a&hair=long01&hairColor=6a0dad&eyes=variant06&eyebrows=variant06&mouth=variant06',
  },
  {
    id: 'ninja',
    name: 'Void Ninja',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=voidninja44&backgroundColor=040d0a&skinColor=ae5d29&hair=short04&hairColor=000000&eyes=variant02&eyebrows=variant02&mouth=variant02',
  },
  {
    id: 'knight',
    name: 'Frost Knight',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=frostknight11&backgroundColor=060f1a&skinColor=f8d25c&hair=short02&hairColor=e0e0e0&eyes=variant08&eyebrows=variant08&mouth=variant08',
  },
  {
    id: 'assassin',
    name: 'Assassin',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=assassin88&backgroundColor=100610&skinColor=614335&hair=long06&hairColor=090806&eyes=variant05&eyebrows=variant05&mouth=variant05',
  },
  {
    id: 'paladin',
    name: 'Holy Paladin',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=holypaladin33&backgroundColor=141400&skinColor=ffd5dc&hair=short03&hairColor=f4d150&eyes=variant07&eyebrows=variant07&mouth=variant07',
  },
  {
    id: 'berserker',
    name: 'Berserker',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=berserker55&backgroundColor=1a0202&skinColor=b5866a&hair=short05&hairColor=8b0000&eyes=variant03&eyebrows=variant03&mouth=variant03',
  },
  {
    id: 'ranger',
    name: 'Forest Ranger',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=forestranger22&backgroundColor=021a08&skinColor=c57f44&hair=long03&hairColor=3d5a1e&eyes=variant09&eyebrows=variant09&mouth=variant09',
  },
  {
    id: 'sorcerer',
    name: 'Dark Sorcerer',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=darksorcerer66&backgroundColor=0d001a&skinColor=edb98a&hair=long05&hairColor=2e0040&eyes=variant10&eyebrows=variant10&mouth=variant10',
  },
  {
    id: 'druid',
    name: 'Nature Druid',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=naturedruid77&backgroundColor=011a01&skinColor=f4c48a&hair=long02&hairColor=2d6a2d&eyes=variant11&eyebrows=variant11&mouth=variant11',
  },
  {
    id: 'reaper',
    name: 'Soul Reaper',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=soulreaper99&backgroundColor=080808&skinColor=7d4f3a&hair=long08&hairColor=101010&eyes=variant12&eyebrows=variant12&mouth=variant12',
  },
];

// Rarity-style class mapping per avatar for visual flair
const AVATAR_RARITY: Record<string, { label: string; color: string; border: string; glow: string }> = {
  shadow:    { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/60',   glow: 'shadow-blue-500/30' },
  warrior:   { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/50',  glow: '' },
  mage:      { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/30' },
  ninja:     { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/50',  glow: '' },
  knight:    { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/60',   glow: 'shadow-blue-500/20' },
  assassin:  { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/30' },
  paladin:   { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/70', glow: 'shadow-yellow-400/40' },
  berserker: { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/50',  glow: '' },
  ranger:    { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/50',  glow: '' },
  sorcerer:  { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/70', glow: 'shadow-yellow-400/40' },
  druid:     { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/60',   glow: 'shadow-blue-500/20' },
  reaper:    { label: 'Mythic',    color: 'text-rose-400',   border: 'border-rose-500/70',   glow: 'shadow-rose-500/50' },
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="bg-[#080810] border border-white/8 rounded-3xl overflow-hidden h-full md:h-auto max-h-[92vh] flex flex-col shadow-2xl shadow-primary/10">

              {/* Header */}
              <div className="relative px-6 pt-6 pb-5 border-b border-white/5 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
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

              <div className="overflow-y-auto flex-1">
                <div className="p-6 space-y-8">

                  {/* Live preview card */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                    <div className="relative flex items-center gap-5 p-5">
                      {/* Avatar with rarity ring */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          key={avatarId}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${selectedRarity.border} bg-card shadow-lg ${selectedRarity.glow} shadow-lg`}
                        >
                          <img src={selectedAvatar.url} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                        </motion.div>
                        <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${selectedRarity.color} bg-card border border-white/10`}>
                          {selectedRarity.label}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-lg text-foreground truncate">{username || 'Hunter'}</p>
                        <p className={`text-xs font-medium mt-0.5 ${selectedRarity.color}`}>{selectedAvatar.name}</p>
                        {bio && (
                          <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">"{bio}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Avatar selector */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-px bg-muted-foreground/40" /> Choose Your Hunter Class
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const rarity = AVATAR_RARITY[avatar.id];
                        const isSelected = avatarId === avatar.id;
                        return (
                          <motion.button
                            key={avatar.id}
                            whileHover={{ scale: 1.06, y: -2 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => { playClick(); setAvatarId(avatar.id); }}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                              isSelected ? `${rarity.border} shadow-lg ${rarity.glow}` : 'border-white/8 hover:border-white/20'
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
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-3 pb-1">
                              <p className={`text-[8px] text-center font-bold truncate px-1 ${isSelected ? rarity.color : 'text-white/60'}`}>
                                {avatar.name.split(' ')[0]}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        className="bg-white/4 border-white/8 focus:border-primary h-11 text-sm rounded-xl"
                      />
                      <div className="flex justify-end">
                        <span className={`text-[10px] tabular-nums ${username.length >= 18 ? 'text-accent' : 'text-muted-foreground/50'}`}>
                          {username.length}/20
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
                        className="bg-white/4 border-white/8 focus:border-primary h-11 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Bio — full width */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Bio
                      <span className="text-muted-foreground/40 normal-case font-normal text-[10px]">(max 50 characters)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your hunter in a sentence..."
                        maxLength={50}
                        className="bg-white/4 border-white/8 focus:border-primary h-11 text-sm rounded-xl pr-14"
                      />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                        bio.length >= 45 ? 'text-accent' : 'text-muted-foreground/50'
                      }`}>
                        {bio.length}/50
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0 bg-[#080810]">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-white/4 border-white/8 hover:bg-white/8 h-11 text-sm rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white h-11 text-sm font-display font-bold tracking-wide rounded-xl shadow-lg shadow-primary/20"
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
        </>
      )}
    </AnimatePresence>
  );
};
