import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Calendar, RefreshCw, Trash2, 
  LogOut, ChevronDown, Edit3, Shield
} from 'lucide-react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AVATAR_OPTIONS = [
  { id: 'default', emoji: '🎮' },
  { id: 'warrior', emoji: '⚔️' },
  { id: 'mage', emoji: '🧙' },
  { id: 'ninja', emoji: '🥷' },
  { id: 'knight', emoji: '🛡️' },
  { id: 'archer', emoji: '🏹' },
  { id: 'dragon', emoji: '🐉' },
  { id: 'phoenix', emoji: '🔥' },
];

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

  const handleSignOut = async () => {
    playClick();
    await signOut();
  };

  const handleResetProgress = async () => {
    playClick();
    await resetGameProgress();
    setShowResetDialog(false);
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    playClick();
    await deleteAccount();
    setShowDeleteDialog(false);
  };

  const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_id) || AVATAR_OPTIONS[0];

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClick();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-card/50 border border-white/5 hover:border-primary/30 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
            {avatar.emoji}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{profile.username}</p>
            <p className="text-xs text-muted-foreground">Hunter</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                {/* Profile Header */}
                <div className="p-4 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center text-3xl border border-primary/30">
                      {avatar.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-foreground">{profile.username}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-3 border-b border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {profile.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>DOB: {format(new Date(profile.date_of_birth), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2">
                  <DropdownItem 
                    icon={<Edit3 className="w-4 h-4" />} 
                    label="Edit Profile" 
                    onClick={() => {
                      playClick();
                      onEditProfile();
                      setIsOpen(false);
                    }} 
                  />
                  <DropdownItem 
                    icon={<Settings className="w-4 h-4" />} 
                    label="Account Settings" 
                    onClick={() => {
                      playClick();
                      onEditProfile();
                      setIsOpen(false);
                    }} 
                  />
                  <DropdownItem 
                    icon={<RefreshCw className="w-4 h-4" />} 
                    label="Reset Progress" 
                    onClick={() => {
                      playClick();
                      setShowResetDialog(true);
                    }}
                    variant="warning"
                  />
                  <DropdownItem 
                    icon={<Trash2 className="w-4 h-4" />} 
                    label="Delete Account" 
                    onClick={() => {
                      playClick();
                      setShowDeleteDialog(true);
                    }}
                    variant="danger"
                  />
                  <div className="h-px bg-white/5 my-2" />
                  <DropdownItem 
                    icon={<LogOut className="w-4 h-4" />} 
                    label="Sign Out" 
                    onClick={handleSignOut}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Progress Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="glass-strong border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-accent" />
              Reset Game Progress?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your level, XP, credits, quests, habits, and achievements to their initial state. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetProgress}
              className="bg-accent text-accent-foreground hover:bg-accent/80"
            >
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-strong border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data. 
              You will be signed out immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const DropdownItem = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'default' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
}) => {
  const variantStyles = {
    default: 'text-foreground hover:bg-muted/50',
    warning: 'text-accent hover:bg-accent/10',
    danger: 'text-destructive hover:bg-destructive/10'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${variantStyles[variant]}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
};
