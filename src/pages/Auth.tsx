import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
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
  const { signIn, signUp, resetPassword, user, loading: authLoading } = useAuth();
  const { playClick, playQuestComplete, playError } = useSoundEffects();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
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
        toast({ title: 'Check your email!', description: 'Password reset instructions have been sent to your email.' });
        setMode('signin');
      }
      return;
    }

    if (!validateInputs()) {
      playError();
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      // Clear any existing local storage data for fresh account
      localStorage.removeItem('the-system-game-state');
      localStorage.removeItem('the-system-achievements');
      localStorage.removeItem('pomodoro-state');
      localStorage.removeItem('pomodoro-stats');
      localStorage.removeItem('the-system-rewards-sold-out');
      localStorage.removeItem('the-system-gifts');
      
      const { error } = await signUp(email, password, username);
      if (error) {
        playError();
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        }
        toast({ title: 'Sign up failed', description: errorMessage, variant: 'destructive' });
      } else {
        playQuestComplete();
        toast({ title: 'Welcome, Hunter!', description: 'Your account has been created successfully' });
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        playError();
        let errorMessage = error.message;
        if (error.message.includes('Invalid login')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        toast({ title: 'Sign in failed', description: errorMessage, variant: 'destructive' });
      } else {
        playQuestComplete();
        toast({ title: 'Welcome back, Hunter!', description: 'Successfully signed in' });
        navigate('/');
      }
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.015%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl border-glow-primary overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/5 text-center bg-gradient-to-br from-primary/10 to-transparent">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground">THE SYSTEM</h1>
            <p className="text-sm text-muted-foreground font-jp mt-1">システム</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => {
                playClick();
                setMode('signin');
              }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                playClick();
                setMode('signup');
              }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Password Reset Mode Header */}
          {mode === 'reset' && (
            <div className="p-4 bg-primary/5 border-b border-white/5">
              <p className="text-sm text-muted-foreground text-center">
                Enter your email to receive password reset instructions
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground">
                  Hunter Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your hunter name"
                    className="pl-10 bg-muted/50 border-white/10 focus:border-primary"
                    maxLength={20}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hunter@example.com"
                  className="pl-10 bg-muted/50 border-white/10 focus:border-primary"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-muted/50 border-white/10 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setMode('reset');
                }}
                className="text-sm text-primary hover:underline w-full text-right"
              >
                Forgot password?
              </button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-primary font-display"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                'Enter The System'
              ) : mode === 'reset' ? (
                'Send Reset Link'
              ) : (
                'Awaken Your Power'
              )}
            </Button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setMode('signin');
                }}
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
              >
                ← Back to Sign In
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 font-jp">
          システムに選ばれし者よ、覚醒せよ
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
