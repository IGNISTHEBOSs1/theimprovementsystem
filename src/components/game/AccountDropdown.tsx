import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, RefreshCw, Trash2, LogOut, ChevronDown, Shield, Calendar, Mail, Swords, Crown } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { format } from 'date-fns';
import { AVATAR_OPTIONS } from './EditProfileModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AVATAR_RARITY: Record<string, { label: string; color: string; border: string; glow: string }> = {
  shadow:    { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  warrior:   { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/40',  glow: '' },
  mage:      { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/20' },
  ninja:     { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/40',  glow: '' },
  knight:    { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  assassin:  { label: 'Epic',      color: 'text-purple-400', border: 'border-purple-500/60', glow: 'shadow-purple-500/20' },
  paladin:   { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30' },
  berserker: { label: 'Uncommon',  color: 'text-green-400',  border: 'border-green-500/40',  glow: '' },
  ranger:    { label: 'Common',    color: 'text-slate-400',  border: 'border-slate-500/40',  glow: '' },
  sorcerer:  { label: 'Legendary', color: 'text-yellow-400', border: 'border-yellow-400/60', glow: 'shadow-yellow-400/30' },
  druid:     { label: 'Rare',      color: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20' },
  reaper:    { label: 'Mythic',    color: 'text-rose-400',   border: 'border-rose-500/70',   glow: 'shadow-rose-500/40' },
};

interface AccountDropdownProps {
  profile: Profile;
  onEditProfile: () => void;
}

export const AccountDropdown = ({ profile, onEditProfile }: AccountDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { signOut, resetGameProgress, deleteAccount, user } = useAuth();
  const { playClick } = useSoundEffects();

  const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_id) || AVATAR_OPTIONS[0];
  const rarity = AVATAR_RARITY[profile.avatar_id] || AVATAR_RARITY['warrior'];

  const handleSignOut = async () => { playClick(); await signOut(); };
  const handleResetProgress = async () => { playClick(); await resetGameProgress(); setShowResetDialog(false); window.location.reload(); };
  const handleDeleteAccount = async () => { playClick(); await deleteAccount(); setShowDeleteDialog(false); };

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { playClick(); setIsOpen(!isOpen); }}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 hover:border-primary/30 transition-all"
        >
          <div className={`w-8 h-8 rounded-lg overflow-hidden border-2 ${rarity.border} flex-shrink-0 shadow-sm ${rarity.glow}`}>
            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-foreground leading-none truncate max-w-[90px]">{profile.username}</p>
            <p className={`text-[10px] font-medium leading-none mt-0.5 ${rarity.color}`}>{rarity.label}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#08080f] border border-white/8 rounded-2xl overflow-hidden z-50 shadow-2xl shadow-black/60"
              >
                {/* Profile Banner */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                  <div className="relative p-5 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${rarity.border} shadow-lg ${rarity.glow}`}>
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#08080f] border border-white/10 whitespace-nowrap ${rarity.color}`}>
                        {rarity.label}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-display font-bold text-foreground truncate text-base">{profile.username}</h3>
                        {rarity.label === 'Legendary' || rarity.label === 'Mythic' ? (
                          <Crown className={`w-3.5 h-3.5 flex-shrink-0 ${rarity.color}`} />
                        ) : (
                          <Swords className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs mb-1.5 ${rarity.color}`}>{avatar.name}</p>
                      {profile.bio && (
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2">"{profile.bio}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account meta */}
                <div className="px-4 py-3 border-t border-b border-white/5 bg-white/2 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                    <span>Joined {format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {profile.date_of_birth && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                      <span>Born {format(new Date(profile.date_of_birth), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2">
                  <MenuItem icon={<Edit3 className="w-4 h-4" />} label="Edit Profile" sublabel="Avatar, name & bio" onClick={() => { playClick(); onEditProfile(); setIsOpen(false); }} />
                  <div className="h-px bg-white/5 my-1.5" />
                  <MenuItem icon={<RefreshCw className="w-4 h-4" />} label="Reset Progress" sublabel="Start from scratch" onClick={() => { playClick(); setShowResetDialog(true); }} variant="warning" />
                  <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete Account" sublabel="Permanently remove account" onClick={() => { playClick(); setShowDeleteDialog(true); }} variant="danger" />
                  <div className="h-px bg-white/5 my-1.5" />
                  <MenuItem icon={<LogOut className="w-4 h-4" />} label="Sign Out" onClick={handleSignOut} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-[#0d0d14] border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-accent" /> Reset Game Progress?</AlertDialogTitle>
            <AlertDialogDescription>This will reset your level, XP, credits, quests, habits and achievements. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetProgress} className="bg-accent hover:bg-accent/80 rounded-xl">Reset Progress</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0d0d14] border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><Shield className="w-5 h-5" /> Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your account and all data. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/80 rounded-xl">Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const MenuItem = ({ icon, label, sublabel, onClick, variant = 'default' }: {
  icon: React.ReactNode; label: string; sublabel?: string; onClick: () => void; variant?: 'default' | 'warning' | 'danger';
}) => {
  const colors = {
    default: 'text-foreground hover:bg-white/5',
    warning: 'text-accent hover:bg-accent/8',
    danger: 'text-destructive hover:bg-destructive/8',
  };
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${colors[variant]}`}
    >
      <span className="flex-shrink-0 opacity-80">{icon}</span>
      <div className="text-left flex-1">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
    </motion.button>
  );
};
