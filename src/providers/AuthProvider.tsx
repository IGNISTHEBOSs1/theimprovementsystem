import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_id: string;
  date_of_birth: string | null;
  bio: string | null;
  has_completed_first_launch: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth' | 'bio'>>) => Promise<{ error: Error | null }>;
  completeFirstLaunch: () => Promise<{ error: Error | null }>;
  resetGameProgress: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchProfile: (userId: string, attempts?: number, delayMs?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Owns the single, application-wide auth lifecycle: exactly one
// getSession() call and exactly one onAuthStateChange() subscription for
// the lifetime of the app. Every component reads this via useAuth() below
// (a Context consumer) instead of starting its own lifecycle — see
// Milestone 2.1 auth-restoration regression fix for why this matters:
// supabase-js's internal auth lock (Web Locks API, no acquisition
// timeout — see supabase/supabase-js#1594, #2013) can hang indefinitely
// under concurrent callers to locked methods like getSession(). Reducing
// to a single caller removes that concurrency.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetches the profile row, retrying briefly to cover the short window
  // between a successful signup and the DB trigger (handle_new_user)
  // committing the corresponding profiles row. Returns once a profile is
  // found or attempts are exhausted — callers await this before treating
  // auth state as settled, so the profile is never still-null at the
  // moment `loading` flips to false on a successful sign-in/sign-up.
  const fetchProfile = async (userId: string, attempts = 3, delayMs = 300) => {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data as Profile);
        return;
      }
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      try {
        if (session?.user) await fetchProfile(session.user.id);
      } finally {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      try {
        if (session?.user) await fetchProfile(session.user.id);
        else setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth' | 'bio'>>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data as Profile);
    return { error };
  };

  // Marks the first-launch experience's primary action as completed.
  // Deliberately separate from updateProfile (rather than widening its
  // allowed-fields union) — this is a one-way, one-purpose transition, not
  // a general profile edit.
  const completeFirstLaunch = async () => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update({ has_completed_first_launch: true })
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data as Profile);
    return { error };
  };

  const resetGameProgress = async () => {
    if (!user) return;
    await supabase.from('game_state').update({
      level: 1, rank: 'E-Rank Hunter', current_xp: 0, max_xp: 1000,
      credits: 0, stats: { FIT: 0, SOC: 0, INT: 0, DIS: 0, FOC: 0, FIN: 0 },
      quests: [], habits: [], system_messages: [], total_quests_completed: 0,
    }).eq('user_id', user.id);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    user, profile, loading,
    signIn, signUp, signOut, resetPassword,
    updateProfile, completeFirstLaunch, resetGameProgress, deleteAccount, fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context consumer only — never starts a new auth lifecycle. Every
// existing call site (`import { useAuth } from '@/hooks/useAuth'`)
// continues to work unchanged; see src/hooks/useAuth.ts.
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
