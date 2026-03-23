import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { SystemLogo } from '@/components/game/Logo';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usernameSchema = z.string().min(2, 'Username must be at least 2 characters').max(20, 'Username must be 20 characters or less');

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { signIn, signUp, resetPassword, user, loading: authLoading } = useAuth();
  const { playClick, playQuestComplete, playError } = useSoundEffects();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [user, authLoading, navigate]);

  const validateInputs = () => {
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) { toast({ title: 'Invalid email', description: e.errors[0].message, variant: 'destructive' }); return false; }
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) { toast({ title: 'Invalid password', description: e.errors[0].message, variant: 'destructive' }); return false; }
    }
    if (mode === 'signup') {
      try { usernameSchema.parse(username); } catch (e) {
        if (e instanceof z.ZodError) { toast({ title: 'Invalid username', description: e.errors[0].message, variant: 'destructive' }); return false; }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();

    if (mode === 'reset') {
      try { emailSchema.parse(email); } catch (err) {
        if (err instanceof z.ZodError) { toast({ title: 'Invalid email', description: err.errors[0].message, variant: 'destructive' }); playError(); return; }
      }
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) { playError(); toast({ title: 'Reset failed', description: error.message, variant: 'destructive' }); }
      else { playQuestComplete(); toast({ title: 'Check your email!', description: 'Password reset instructions have been sent.' }); setMode('signin'); }
      return;
    }

    if (!validateInputs()) { playError(); return; }
    setLoading(true);

    if (mode === 'signup') {
      localStorage.removeItem('the-system-game-state');
      localStorage.removeItem('the-system-achievements');
      localStorage.removeItem('pomodoro-state');
      const { error } = await signUp(email, password, username);
      if (error) {
        playError();
        toast({ title: 'Sign up failed', description: error.message.includes('already registered') ? 'This email is already registered.' : error.message, variant: 'destructive' });
      } else { playQuestComplete(); toast({ title: 'Welcome, Hunter!', description: 'Your account has been created' }); navigate('/'); }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        playError();
        toast({ title: 'Sign in failed', description: error.message.includes('Invalid login') ? 'Invalid email or password.' : error.message, variant: 'destructive' });
      } else { playQuestComplete(); toast({ title: 'Welcome back, Hunter!' }); navigate('/'); }
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex-center p-4">
      {/* Background */}
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="fixed inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: `linear-gradient(hsl(var(--primary)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </button>

        <div className="glass-strong rounded-2xl border border-white/12 overflow-hidden shadow-[0_0_60px_hsl(var(--primary)/0.1)]">
          {/* Header */}
          <div className="p-6 pb-5 text-center bg-gradient-to-br from-primary/8 to-transparent border-b border-white/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex-center mb-4"
            >
              <SystemLogo size={48} />
            </motion.div>
            <h1 className="font-display font-black text-2xl text-foreground tracking-widest">THE SYSTEM</h1>
            <p className="text-caption text-muted-foreground font-jp mt-1 tracking-widest">システム</p>
          </div>

          {/* Mode tabs — pill toggle */}
          <AnimatePresence>
            {mode !== 'reset' && (
              <div className="flex p-3 gap-1 border-b border-white/5 bg-black/20">
                {(['signin', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { playClick(); setMode(m); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                      mode === m ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode === m && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-lg bg-primary/90 shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                      />
                    )}
                    <span className="relative z-10">{m === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Reset password notice */}
          {mode === 'reset' && (
            <div className="px-6 py-3 bg-primary/5 border-b border-white/5 text-center">
              <p className="text-body-sm text-muted-foreground">Enter your email to receive password reset instructions</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-label text-muted-foreground">Hunter Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username" type="text" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your hunter name"
                      className="pl-10 bg-muted/50 border-white/10 focus:border-primary/50 focus-visible:ring-primary/30"
                      maxLength={20}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-label text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hunter@example.com"
                  className="pl-10 bg-muted/50 border-white/10 focus:border-primary/50 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-label text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-muted/50 border-white/10 focus:border-primary/50 focus-visible:ring-primary/30"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button type="button" onClick={() => { playClick(); setMode('reset'); }}
                  className="text-caption text-primary hover:text-primary-glow transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="neon"
              disabled={loading}
              className="w-full font-display"
              size="lg"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!loading && (mode === 'signin' ? 'Enter The System' : mode === 'reset' ? 'Send Reset Link' : 'Awaken Your Power')}
            </Button>

            {mode === 'reset' && (
              <button type="button" onClick={() => { playClick(); setMode('signin'); }}
                className="text-body-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            )}

            {mode !== 'reset' && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-transparent px-3 text-label text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="glass" disabled={googleLoading}
                    onClick={async () => {
                      playClick(); setGoogleLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                      if (error) { playError(); toast({ title: 'Google sign-in failed', variant: 'destructive' }); setGoogleLoading(false); }
                    }}
                  >
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Google
                  </Button>
                  <Button type="button" variant="glass" disabled={appleLoading}
                    onClick={async () => {
                      playClick(); setAppleLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } });
                      if (error) { playError(); toast({ title: 'Apple sign-in failed', variant: 'destructive' }); setAppleLoading(false); }
                    }}
                  >
                    {appleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    )}
                    Apple
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-label text-muted-foreground/50 mt-6 font-jp">
          システムに選ばれし者よ、覚醒せよ
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
