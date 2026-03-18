import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const AVATAR_OPTIONS = [
  { id: 'shadow', name: 'Shadow Hunter', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=shadow&backgroundColor=0a0a1a&hair=long01&eyes=variant01' },
  { id: 'warrior', name: 'Iron Warrior', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ironwarrior&backgroundColor=1a0a0a&eyes=variant04' },
  { id: 'mage', name: 'Arc Mage', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=arcmage&backgroundColor=0a0a2e&eyes=variant06' },
  { id: 'ninja', name: 'Void Ninja', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=voidninja&backgroundColor=0a1a0a&eyes=variant02' },
  { id: 'knight', name: 'Frost Knight', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=frostknight&backgroundColor=0a1a2e&eyes=variant08' },
  { id: 'assassin', name: 'Assassin', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=assassin99&backgroundColor=1a0a1a&eyes=variant05' },
  { id: 'paladin', name: 'Paladin', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=paladin7&backgroundColor=1a1a0a&eyes=variant07' },
  { id: 'berserker', name: 'Berserker', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=berserker3&backgroundColor=2a0a0a&eyes=variant03' },
  { id: 'ranger', name: 'Ranger', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ranger55&backgroundColor=0a2a1a&eyes=variant09' },
  { id: 'sorcerer', name: 'Sorcerer', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sorcerer22&backgroundColor=1a0a2a&eyes=variant10' },
  { id: 'druid', name: 'Druid', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=druid44&backgroundColor=0a2a0a&eyes=variant11' },
  { id: 'reaper', name: 'Reaper', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=reaper77&backgroundColor=1a1a1a&eyes=variant12' },
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden h-full md:h-auto max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/10">
              
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-base text-foreground">Edit Profile</h2>
                      <p className="text-[11px] text-muted-foreground font-jp">プロフィール編集</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-7">

                {/* Current avatar preview + name */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/40 bg-card shadow-lg shadow-primary/20 flex-shrink-0">
                    <img src={selectedAvatar.url} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">{username || 'Hunter'}</p>
                    <p className="text-xs text-primary mt-0.5">{selectedAvatar.name}</p>
                    {bio && <p className="text-xs text-muted-foreground mt-1 italic">"{bio}"</p>}
                  </div>
                </div>

                {/* Avatar grid */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { playClick(); setAvatarId(avatar.id); }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          avatarId === avatar.id
                            ? 'border-primary shadow-lg shadow-primary/30'
                            : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover bg-card" />
                        {avatarId === avatar.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-primary drop-shadow" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                          <p className="text-[8px] text-center text-white/70 truncate px-1">{avatar.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Hunter Name
                  </Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your hunter name"
                    maxLength={20}
                    className="bg-white/5 border-white/10 focus:border-primary h-10 text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">{username.length}/20</p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</Label>
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short bio about yourself..."
                    maxLength={50}
                    className="bg-white/5 border-white/10 focus:border-primary h-10 text-sm"
                  />
                  <p className={`text-xs text-right ${bio.length >= 45 ? 'text-accent' : 'text-muted-foreground'}`}>{bio.length}/50</p>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-primary h-10 text-sm"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-10 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white h-10 text-sm font-display font-semibold"
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
