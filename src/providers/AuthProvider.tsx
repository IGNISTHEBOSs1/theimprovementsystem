import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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
  profileLoading: boolean;
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
// (a Context consumer) instead of starting its own lifecycle.
//
// Auth state and profile state are deliberately handled by two separate
// effects. The auth effect (getSession/onAuthStateChange) performs no
// database requests at all — it only ever calls supabase.auth methods.
// The profile effect watches `user` and performs the profiles query
// independently, after auth state has already settled. This matters
// because every PostgREST request (supabase.from(...)) indirectly calls
// supabase.auth.getSession() again internally (via _getAccessToken(), to
// attach the Authorization header) — source-verified in
// @supabase/supabase-js's fetchWithAuth/_getAccessToken. Calling
// fetchProfile() from inside the auth callback re-entered the same
// no-acquisition-timeout auth lock (_acquireLock(-1, ...)) while it could
// still be held by the in-flight getSession()/token-refresh call that
// triggered the callback in the first place. Splitting these into two
// effects means the profile fetch's internal getSession() call only ever
// starts after the first getSession() call has already fully resolved
// and released the lock, since `loading` (and therefore React rendering
// past it) only flips once the auth effect's own callback has returned —
// which no longer depends on the profile fetch completing.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetches the profile row, retrying briefly to cover the short window
  // between a successful signup and the DB trigger (handle_new_user)
  // committing the corresponding profiles row. Returns once a profile is
  // found or attempts are exhausted.
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

  // Auth-only effect. Performs zero database requests — only
  // supabase.auth.getSession() and supabase.auth.onAuthStateChange().
  // `loading` represents auth state alone: whether we know yet if there
  // is a user or not. It does not wait on profile data.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dedicated profile effect, watching the authenticated user. Runs
  // independently of and after the auth effect above — the app can
  // render past the auth-loading gate while this continues in the
  // background. Not a database request inside onAuthStateChange; this is
  // a normal effect reacting to state React already committed.
  //
  // Guard: during session restoration, onAuthStateChange can fire more
  // than once for the same underlying user (e.g. INITIAL_SESSION, then
  // TOKEN_REFRESHED once a needed refresh completes — confirmed in
  // GoTrueClient's _notifyAllSubscribers/_callRefreshToken). Each of
  // those emits a session with a newly-parsed `user` object, so this
  // effect's [user] dependency (reference equality) would otherwise
  // re-fire and re-fetch the same profile redundantly. lastFetchedUserId
  // compares the stable user id, not object identity, so a duplicate
  // event for the same user is a no-op.
  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      lastFetchedUserId.current = null;
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (lastFetchedUserId.current === user.id) {
      return;
    }
    lastFetchedUserId.current = user.id;

    let cancelled = false;
    setProfileLoading(true);

    (async () => {
      await fetchProfile(user.id);
      if (!cancelled) {
        setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

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
    user, profile, loading, profileLoading,
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
