import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Calendar } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const AVATAR_OPTIONS = [
  { id: 'default', emoji: '🎮', name: 'Gamer' },
  { id: 'warrior', emoji: '⚔️', name: 'Warrior' },
  { id: 'mage', emoji: '🧙', name: 'Mage' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja' },
  { id: 'knight', emoji: '🛡️', name: 'Knight' },
  { id: 'archer', emoji: '🏹', name: 'Archer' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger' },
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
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useAuth();
  const { playClick, playQuestComplete } = useSoundEffects();

  const handleSave = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    if (username.length > 20) {
      toast({
        title: "Username too long",
        description: "Username must be 20 characters or less",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    playClick();

    const { error } = await updateProfile({
      username: username.trim(),
      avatar_id: avatarId,
      date_of_birth: dateOfBirth || null
    });

    setSaving(false);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } else {
      playQuestComplete();
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved"
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="glass-strong rounded-2xl border border-primary/20 overflow-hidden h-full md:h-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg text-foreground">Edit Profile</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Avatar Selection */}
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">Choose Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          playClick();
                          setAvatarId(avatar.id);
                        }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                          avatarId === avatar.id
                            ? 'bg-primary/20 border-2 border-primary glow-primary'
                            : 'bg-muted/50 border border-white/5 hover:border-primary/30'
                        }`}
                      >
                        <span className="text-2xl">{avatar.emoji}</span>
                        <span className="text-[10px] text-muted-foreground">{avatar.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your hunter name"
                    maxLength={20}
                    className="bg-muted/50 border-white/10 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground text-right">{username.length}/20</p>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth (optional)
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-muted/50 border-white/10 focus:border-primary"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-muted/50 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80 glow-primary"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </span>
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
