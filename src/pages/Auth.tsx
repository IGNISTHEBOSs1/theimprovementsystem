import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  Target,
  ShieldCheck,
  Layers,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useThemeContext } from '@/providers/ThemeProvider';
import { signInWithSocial } from '@/services/authDeepLinkService';
import { generateSecurePassword } from '@/lib/passwordGenerator';
import { isCapacitorNative } from '@/services/otaUpdateService';
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { SystemLogo } from '@/components/branding/Logo';
import { TIS_SPRINGS } from '@/lib/motion-tokens';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usernameSchema = z
  .string()
  .min(2, 'Username must be at least 2 characters')
  .max(20, 'Username must be 20 characters or less');

type AuthMode = 'welcome' | 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode');

  // Initial mode determination:
  // Explicit ?mode=signin or ?mode=login -> 'signin'
  // Explicit ?mode=signup -> 'signup'
  // Explicit ?mode=reset -> 'reset'
  // Fresh launch / no query param -> 'welcome' (The Get Started Screen)
  const resolveInitialMode = (): AuthMode => {
    if (queryMode === 'signin' || queryMode === 'login') return 'signin';
    if (queryMode === 'signup') return 'signup';
    if (queryMode === 'reset') return 'reset';
    return 'welcome';
  };

  const [mode, setMode] = useState<AuthMode>(resolveInitialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { signIn, signUp, resetPassword, user, loading: authLoading } = useAuth();
  useGoogleOneTap(!user && !authLoading);
  const { mode: themeMode, setMode: setThemeMode } = useThemeContext();
  const { playClick, playQuestComplete, playError } = useSoundEffects();
  const navigate = useNavigate();

  // Sync mode if query params change
  useEffect(() => {
    const q = searchParams.get('mode');
    if (q === 'signin' || q === 'login') setMode('signin');
    else if (q === 'signup') setMode('signup');
    else if (q === 'reset') setMode('reset');
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [user, authLoading, navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast({ title: 'Invalid email', description: e.errors[0].message, variant: 'destructive' });
        return false;
      }
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast({ title: 'Invalid password', description: e.errors[0].message, variant: 'destructive' });
        return false;
      }
    }
    if (mode === 'signup') {
      try {
        usernameSchema.parse(username);
      } catch (e) {
        if (e instanceof z.ZodError) {
          toast({ title: 'Invalid username', description: e.errors[0].message, variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  const handleGeneratePassword = async () => {
    playClick();
    const generated = generateSecurePassword(16);
    setPassword(generated);
    setShowPassword(true);
    try {
      await navigator.clipboard.writeText(generated);
      toast({
        title: 'Secure password generated',
        description: 'A 16-character password has been generated and copied to your clipboard.',
      });
    } catch {
      toast({
        title: 'Secure password generated',
        description: 'A 16-character password has been filled into the password field.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();

    if (mode === 'reset') {
      try {
        emailSchema.parse(email);
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast({ title: 'Invalid email', description: err.errors[0].message, variant: 'destructive' });
          playError();
          return;
        }
      }
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        playError();
        toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      } else {
        playQuestComplete();
        toast({ title: 'Check your email!', description: 'Password reset instructions have been sent.' });
        setMode('signin');
      }
      return;
    }

    if (!validateInputs()) {
      playError();
      return;
    }
    setLoading(true);

    const formatAuthError = (err: { message: string }) => {
      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('Network') ||
        err.message.includes('Failed to connect')
      ) {
        return 'Cannot reach the server. Please check your internet connection or mobile data.';
      }
      if (err.message.includes('already registered')) {
        return 'This email is already registered.';
      }
      if (err.message.includes('Invalid login') || err.message.includes('invalid_grant')) {
        return 'Invalid email or password.';
      }
      return err.message;
    };

    if (mode === 'signup') {
      localStorage.removeItem('the-system-game-state');
      localStorage.removeItem('the-system-achievements');
      localStorage.removeItem('pomodoro-state');
      const { error } = await signUp(email, password, username);
      if (error) {
        playError();
        toast({ title: 'Sign up failed', description: formatAuthError(error), variant: 'destructive' });
      } else {
        playQuestComplete();
        toast({ title: 'Welcome!', description: 'Your account has been created.' });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        playError();
        toast({ title: 'Sign in failed', description: formatAuthError(error), variant: 'destructive' });
      } else {
        playQuestComplete();
        toast({ title: 'Welcome back!' });
      }
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
    <div className="min-h-[100dvh] w-full bg-background relative overflow-y-auto overflow-x-hidden flex flex-col justify-start sm:justify-center p-3 sm:p-6 lg:p-8 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-[calc(env(safe-area-inset-bottom,0px)+24px)] selection:bg-white/20 selection:text-white">
      {/* Contained Background Layer (Grid) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.22] dark:opacity-[0.14] text-foreground transition-opacity"
          style={{
            backgroundImage: `linear-gradient(currentColor 1.25px, transparent 1.25px), linear-gradient(90deg, currentColor 1.25px, transparent 1.25px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.25) 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.25) 95%)',
          }}
        />
      </div>

      <div className="w-full max-w-5xl relative z-10 mx-auto lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 lg:items-center">
        {/* ── LEFT PANE: PC BRAND & ARCHITECTURE SHOWCASE (Visible on lg+ screens) ── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6 pr-4">
          {!isCapacitorNative() && (
            <nav aria-label="Navigation" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            </nav>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-card border border-border/80 dark:border-white/[0.08] shadow-xs">
                <SystemLogo size={32} />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground block">Kinetic</span>
                <span className="text-xs text-muted-foreground font-medium">Personal Trajectory Engine</span>
              </div>
            </div>

            <h1 className="font-bold text-3xl xl:text-4xl tracking-tight text-foreground leading-[1.18]">
              Deterministic momentum.<br />
              <span className="text-muted-foreground font-medium">Zero noise.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              A personal execution system built on mathematical velocity, an elastic ±10% buffer cone, and strict daily constraints.
            </p>
          </div>

          {/* 3 Architectural Pillars */}
          <div className="space-y-3 pt-1">
            <div className="milled-slab p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                <Target className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-xs text-foreground">1 Primary Focus + up to 5 Routines</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Strict daily constraint eliminates backlog guilt. Execute in under 90 seconds.
                </p>
              </div>
            </div>

            <div className="milled-slab p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-xs text-foreground">±10% Mathematical Safety Buffer</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Life interrupts. Sickness or travel are absorbed without breaking your 90-day vector.
                </p>
              </div>
            </div>

            <div className="milled-slab p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                <Layers className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-xs text-foreground">Local-First Privacy</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Zero third-party trackers or telemetry brokers. You maintain full ownership of your data.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground shadow-2xs font-medium">
              Local-first encrypted
            </span>
            <span className="px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground shadow-2xs font-medium">
              ±10% flexible buffer
            </span>
            <span className="px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground shadow-2xs font-medium">
              Zero trackers
            </span>
          </div>
        </div>

        {/* ── RIGHT PANE: GET STARTED OR AUTHENTICATION TERMINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl sm:max-w-md lg:max-w-none lg:col-span-6 relative z-10 mx-auto min-w-0"
        >
          {/* Top Control Bar: Mode back navigation + Palette switcher */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
            {mode !== 'welcome' ? (
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setMode('welcome');
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            ) : !isCapacitorNative() ? (
              <button
                onClick={() => navigate('/')}
                className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            ) : (
              <div />
            )}

            {/* Color Palette Controls */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-card/90 dark:bg-card/85 border border-border dark:border-white/10 backdrop-blur-md shadow-xs ml-auto">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={cn(
                  'p-1.5 rounded text-xs transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
                  themeMode === 'light' ? 'bg-foreground text-background shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Light Palette"
                aria-label="Light palette"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={cn(
                  'p-1.5 rounded text-xs transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
                  themeMode === 'dark' ? 'bg-foreground text-background shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Dark Palette"
                aria-label="Dark palette"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={cn(
                  'p-1.5 rounded text-xs transition-colors cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
                  themeMode === 'system' ? 'bg-foreground text-background shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Auto Palette"
                aria-label="Auto palette"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Card Surface - Prominent neoskeuomorphic milled card */}
          <div className="w-full milled-slab rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-[var(--shadow-card)] overflow-hidden">
            {mode === 'welcome' ? (
              /* ── 1. THE GET STARTED SCREEN (Initial mobile / unauthenticated entry) ── */
              <div className="p-5 sm:p-7 space-y-5">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2.5 rounded-2xl bg-muted/60 border border-border shadow-xs">
                    <SystemLogo size={38} />
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight text-foreground block">Kinetic</span>
                    <span className="text-xs text-muted-foreground font-medium">Personal Trajectory Engine</span>
                  </div>
                  <h2 className="font-extrabold text-xl sm:text-2xl text-foreground tracking-tight pt-1 leading-snug">
                    Deterministic momentum.<br />
                    <span className="text-muted-foreground font-normal">Zero noise.</span>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto text-pretty">
                    A personal execution system built on mathematical velocity, an elastic ±10% buffer cone, and strict daily constraints.
                  </p>
                </div>

                {/* 3 Value Pillars */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-3 py-1">
                    <div className="size-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                      <Target className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-foreground">1 Primary Focus + up to 5 Routines</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Strict daily discipline eliminates backlog guilt. Execute in under 90 seconds.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-1 border-t border-border/40">
                    <div className="size-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                      <ShieldCheck className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-foreground">±10% Safety Buffer</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        9 flexible buffer days over 90 days absorb disruptions without resetting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-1 border-t border-border/40">
                    <div className="size-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                      <Layers className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-foreground">Local-First & Private</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Encrypted on your device. Zero third-party trackers or telemetry brokers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Get Started Button */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      playClick();
                      navigate('/onboarding');
                    }}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-wide shadow-xs active:scale-[0.98] motion-reduce:transform-none transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    <span>Get Started</span>
                  </Button>

                  <div className="text-center pt-0.5">
                    <p className="text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setMode('signin');
                        }}
                        className="text-foreground font-semibold hover:underline cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded ml-1"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── 2. CREDENTIAL AUTHENTICATION TERMINAL (Sign In, Sign Up, Reset) ── */
              <>
                <div className="px-5 py-4 sm:py-5 text-center bg-muted/40 dark:bg-muted/20 border-b border-border/80 dark:border-white/10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...TIS_SPRINGS.settle, delay: 0.05 }}
                    className="flex flex-col items-center justify-center mb-2 lg:hidden"
                  >
                    <div className="p-1.5 rounded-xl bg-muted/70 border border-border/80 dark:border-white/10 shadow-xs mb-1.5">
                      <SystemLogo size={32} />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground block">Kinetic</span>
                    <span className="text-[11px] text-muted-foreground font-medium">Personal Trajectory Engine</span>
                  </motion.div>
                  <h2 className="font-bold text-lg sm:text-xl text-foreground tracking-tight">
                    {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mode === 'signin'
                      ? 'Sign in to continue your personal progress.'
                      : mode === 'signup'
                      ? 'Save your calibrated trajectory to your cockpit.'
                      : 'Enter your email for password reset instructions.'}
                  </p>
                </div>

                {/* Mode toggle */}
                <AnimatePresence>
                  {mode !== 'reset' && (
                    <div className="px-4 py-2 border-b border-border/80 bg-muted/20">
                      <div className="flex p-1 rounded-xl bg-muted/60 border border-border/80">
                        {(['signin', 'signup'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              playClick();
                              setMode(m);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors relative cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                              mode === m ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {mode === m && (
                              <motion.div
                                layoutId="auth-tab"
                                className="absolute inset-0 rounded-lg bg-card shadow-xs"
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

                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
                  {/* Social OAuth Providers (Google & Apple) */}
                  {mode !== 'reset' && (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={googleLoading}
                          className="rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-foreground text-xs sm:text-sm h-11 active:scale-[0.98] motion-reduce:transform-none shadow-xs cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={async () => {
                            playClick();
                            setGoogleLoading(true);
                            const result = await signInWithSocial('google', () => setGoogleLoading(false));
                            if (!result.success) {
                              playError();
                              toast({
                                title: 'Google sign-in failed',
                                description: result.error?.message,
                                variant: 'destructive',
                              });
                              setGoogleLoading(false);
                            }
                          }}
                        >
                          {googleLoading ? (
                            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
                          ) : (
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          )}
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={appleLoading}
                          className="rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-foreground text-xs sm:text-sm h-11 active:scale-[0.98] motion-reduce:transform-none shadow-xs cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={async () => {
                            playClick();
                            setAppleLoading(true);
                            const result = await signInWithSocial('apple', () => setAppleLoading(false));
                            if (!result.success) {
                              playError();
                              toast({
                                title: 'Apple sign-in failed',
                                description: result.error?.message,
                                variant: 'destructive',
                              });
                              setAppleLoading(false);
                            }
                          }}
                        >
                          {appleLoading ? (
                            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
                          ) : (
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                          )}
                          Apple
                        </Button>
                      </div>

                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-background dark:bg-muted/60 px-2.5 text-xs text-muted-foreground font-medium rounded">or with email</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Username field on signup */}
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        key="username"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5"
                      >
                        <Label htmlFor="username" className="text-xs font-medium text-foreground">
                          Your Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="name"
                            spellCheck={false}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name"
                            className="pl-10 bg-background/90 dark:bg-muted/30 border border-input focus:border-foreground/50 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-xl text-foreground placeholder:text-muted-foreground h-11 text-xs sm:text-sm shadow-2xs"
                            maxLength={20}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        spellCheck={false}
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 bg-background/90 dark:bg-muted/30 border border-input focus:border-foreground/50 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-xl text-foreground placeholder:text-muted-foreground h-11 text-xs sm:text-sm shadow-2xs"
                      />
                    </div>
                  </div>

                  {mode !== 'reset' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-foreground">
                          Password
                        </Label>
                        {mode === 'signup' && (
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded transition-colors"
                            title="Generate a cryptographically secure random password"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Generate password</span>
                          </button>
                        )}
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => {
                              playClick();
                              setMode('reset');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-background/90 dark:bg-muted/30 border border-input focus:border-foreground/50 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-xl text-foreground placeholder:text-muted-foreground h-11 text-xs sm:text-sm shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-semibold text-xs sm:text-sm h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer mt-1"
                    size="default"
                  >
                    {loading && <Loader2 className="w-4 h-4 motion-safe:animate-spin mr-2" />}
                    {loading
                      ? mode === 'signin'
                        ? 'Logging in…'
                        : mode === 'reset'
                        ? 'Sending link…'
                        : 'Creating account…'
                      : mode === 'signin'
                      ? 'Log In'
                      : mode === 'reset'
                      ? 'Send Reset Link'
                      : 'Create Account'}
                  </Button>

                  {mode === 'reset' && (
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setMode('signin');
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors flex items-center justify-center gap-1.5 pt-1 cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Log In
                    </button>
                  )}
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3 tracking-wide">
            A quiet operating system for deliberate growth.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
