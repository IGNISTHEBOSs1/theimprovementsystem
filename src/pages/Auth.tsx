import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useThemeContext } from '@/providers/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { SystemLogo } from '@/components/branding/Logo';
import { cn } from '@/lib/utils';
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
  const { mode: themeMode, setMode: setThemeMode } = useThemeContext();
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
      } else { playQuestComplete(); toast({ title: 'Welcome!', description: 'Your account has been created.' }); }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        playError();
        toast({ title: 'Sign in failed', description: error.message.includes('Invalid login') ? 'Invalid email or password.' : error.message, variant: 'destructive' });
      } else { playQuestComplete(); toast({ title: 'Welcome back!' }); }
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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-3 sm:p-4 selection:bg-white/20 selection:text-white">
      {/* Contained Background Layer (Grid + Diffusions) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Precision Trajectory Coordinate Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.1) 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.1) 85%)',
          }}
        />

        {/* Monochromatic Diffusions */}
        <div className="absolute -top-32 -left-24 w-[360px] h-[360px] rounded-full bg-white/[0.02] dark:bg-white/[0.03] blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[340px] h-[340px] rounded-full bg-zinc-800/10 dark:bg-zinc-700/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[340px] sm:max-w-md relative z-10 mx-auto"
      >
        {/* Top Control Bar: Back to Home + Palette Mode Switcher */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[11px] font-tech-mono text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Home</span>
          </button>

          {/* Color Palette / Theme Mode Controls */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-card/85 border border-white/10 backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={cn(
                "p-1.5 rounded text-xs transition-colors",
                themeMode === 'light' ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Light Palette"
              aria-label="Light palette"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={cn(
                "p-1.5 rounded text-xs transition-colors",
                themeMode === 'dark' ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark Palette"
              aria-label="Dark palette"
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={cn(
                "p-1.5 rounded text-xs transition-colors",
                themeMode === 'system' ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Auto Palette"
              aria-label="Auto palette"
            >
              <Monitor className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Liquid Frosted Glass Authentication Card */}
        <div className="rounded-2xl border border-white/15 dark:border-white/10 bg-card/85 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.3),0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden tis-specular-box">
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 text-center bg-muted/20 border-b border-white/10 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280 }}
              className="flex items-center justify-center mb-1.5"
            >
              <div className="p-1.5 rounded-xl bg-card/90 border border-white/10 shadow-xs backdrop-blur-md">
                <SystemLogo size={26} />
              </div>
            </motion.div>
            <h1 className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">The Improvement System</h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 font-tech-mono tracking-widest uppercase">
              PERSONAL TRAJECTORY ENGINE
            </p>
          </div>

          {/* Mode tabs — compact toggle */}
          <AnimatePresence>
            {mode !== 'reset' && (
              <div className="px-3 py-1.5 border-b border-white/10 bg-muted/15">
                <div className="flex p-0.5 rounded-lg bg-muted/60 border border-border/80">
                  {(['signin', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { playClick(); setMode(m); }}
                      className={`flex-1 py-1 rounded text-xs font-display font-semibold transition-all relative ${
                        mode === m ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="auth-tab"
                          className="absolute inset-0 rounded bg-foreground shadow-xs"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{m === 'signin' ? 'Log In' : 'Create Account'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Reset password notice */}
          {mode === 'reset' && (
            <div className="px-4 py-2 bg-muted/40 border-b border-white/10 text-center backdrop-blur-md">
              <p className="text-[11px] font-tech-mono text-muted-foreground">Enter your email to receive password reset instructions</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-2 sm:space-y-2.5">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <Label htmlFor="username" className="text-[10px] font-tech-mono uppercase tracking-wider text-muted-foreground font-medium">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="username" type="text" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name"
                      className="pl-8 bg-muted/30 border-border/80 focus:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-lg text-foreground placeholder:text-muted-foreground/50 h-8 sm:h-9 text-xs"
                      maxLength={20}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[10px] font-tech-mono uppercase tracking-wider text-muted-foreground font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-8 bg-muted/30 border-border/80 focus:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-lg text-foreground placeholder:text-muted-foreground/50 h-8 sm:h-9 text-xs"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <Label htmlFor="password" className="text-[10px] font-tech-mono uppercase tracking-wider text-muted-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-8 pr-8 bg-muted/30 border-border/80 focus:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-lg text-foreground placeholder:text-muted-foreground/50 h-8 sm:h-9 text-xs"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button type="button" onClick={() => { playClick(); setMode('reset'); }}
                  className="text-[10px] font-tech-mono text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className="w-full font-display font-semibold text-xs h-8 sm:h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] shadow-xs"
              size="sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
              {!loading && (mode === 'signin' ? 'Log In' : mode === 'reset' ? 'Send Reset Link' : 'Initialize Account')}
            </Button>

            {mode === 'reset' && (
              <button type="button" onClick={() => { playClick(); setMode('signin'); }}
                className="text-[11px] font-tech-mono text-muted-foreground hover:text-foreground w-full text-center transition-colors flex items-center justify-center gap-1.5 pt-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Log In
              </button>
            )}

            {mode !== 'reset' && (
              <>
                <div className="relative my-2 sm:my-2.5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-[9px] font-tech-mono uppercase tracking-wider text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" disabled={googleLoading}
                    className="rounded-lg border border-white/10 dark:border-white/10 bg-muted/30 hover:bg-muted/60 backdrop-blur-md text-foreground font-tech-mono text-xs h-8 sm:h-9 active:scale-[0.98]"
                    onClick={async () => {
                      playClick(); setGoogleLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                      if (error) { playError(); toast({ title: 'Google sign-in failed', variant: 'destructive' }); setGoogleLoading(false); }
                    }}
                  >
                    {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                      <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Google
                  </Button>
                  <Button type="button" variant="outline" disabled={appleLoading}
                    className="rounded-lg border border-white/10 dark:border-white/10 bg-muted/30 hover:bg-muted/60 backdrop-blur-md text-foreground font-tech-mono text-xs h-8 sm:h-9 active:scale-[0.98]"
                    onClick={async () => {
                      playClick(); setAppleLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } });
                      if (error) { playError(); toast({ title: 'Apple sign-in failed', variant: 'destructive' }); setAppleLoading(false); }
                    }}
                  >
                    {appleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                      <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
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

        <p className="text-center text-[10px] font-tech-mono text-muted-foreground/60 mt-2 sm:mt-3 tracking-wide">
          A quiet operating system for deliberate growth.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
