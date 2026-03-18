import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, RefreshCw, Trash2, LogOut, ChevronDown, Shield, Calendar, Mail, Star } from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { format } from 'date-fns';
import { AVATAR_OPTIONS } from './EditProfileModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

  const handleSignOut = async () => { playClick(); await signOut(); };
  const handleResetProgress = async () => { playClick(); await resetGameProgress(); setShowResetDialog(false); window.location.reload(); };
  const handleDeleteAccount = async () => { playClick(); await deleteAccount(); setShowDeleteDialog(false); };

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { playClick(); setIsOpen(!isOpen); }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 hover:border-primary/40 transition-all"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0">
            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-semibold text-foreground hidden sm:block max-w-[100px] truncate">{profile.username}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl shadow-black/50"
              >
                {/* Profile header */}
                <div className="p-4 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/20 flex-shrink-0">
                      <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground truncate">{profile.username}</h3>
                        <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-primary/80 mb-1">{avatar.name}</p>
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground italic truncate">"{profile.bio}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account info */}
                <div className="px-4 py-3 border-b border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Joined {format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {profile.date_of_birth && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Born {format(new Date(profile.date_of_birth), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2">
                  <MenuItem icon={<Edit3 className="w-4 h-4" />} label="Edit Profile" sublabel="Change name, avatar & bio" onClick={() => { playClick(); onEditProfile(); setIsOpen(false); }} />
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
        <AlertDialogContent className="bg-[#0d0d14] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-accent" /> Reset Game Progress?</AlertDialogTitle>
            <AlertDialogDescription>This will reset your level, XP, credits, quests, habits and achievements. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetProgress} className="bg-accent hover:bg-accent/80">Reset Progress</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0d0d14] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><Shield className="w-5 h-5" /> Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your account and all data. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/80">Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const MenuItem = ({ icon, label, sublabel, onClick, variant = 'default' }: {
  icon: React.ReactNode; label: string; sublabel?: string; onClick: () => void; variant?: 'default' | 'warning' | 'danger';
}) => {
  const colors = { default: 'text-foreground hover:bg-white/5', warning: 'text-accent hover:bg-accent/10', danger: 'text-destructive hover:bg-destructive/10' };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${colors[variant]}`}>
      <span className="flex-shrink-0">{icon}</span>
      <div className="text-left">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </button>
  );
};
