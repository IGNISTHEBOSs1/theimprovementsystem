import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { detectDeviceTimezone } from '@/lib/serverTime';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_id: string;
  date_of_birth: string | null;
  bio: string | null;
  // The account's single primary goal. Nullable — goal-setting is
  // optional, not a required step of any existing flow (First Launch is
  // untouched by this). Free text, not a referenced entity — see Chunk 3
  // report for why a full Goal model wasn't built.
  primary_goal: string | null;
  // IANA timezone (e.g. 'Asia/Kolkata'), detected from the device once on
  // first authenticated use and stored server-side. Identifies the
  // user's INTENDED zone only — the authoritative clock for Quest
  // recurrence/expiry is always the server's UTC time (see
  // @/lib/serverTime), converted through this value. Null until first
  // detection completes.
  timezone: string | null;
  has_completed_first_launch: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth' | 'bio' | 'primary_goal'>>) => Promise<{ error: Error | null; profile: Profile | null }>;
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
  // Distinguishes "profile row could not be resolved after all retries"
  // from "profile is still loading" and "profile resolved". Without this,
  // an exhausted fetchProfile left `profile` as null with profileLoading
  // false — indistinguishable, downstream, from a state that had simply
  // never started loading. Consumers (e.g. Dashboard) must branch on this
  // explicitly rather than inferring failure from `profile === null`.
  const [profileError, setProfileError] = useState(false);

  // Fetches the profile row, retrying briefly to cover the short window
  // between a successful signup and the DB trigger (handle_new_user)
  // committing the corresponding profiles row. Returns once a profile is
  // found or attempts are exhausted. Also usable directly as a manual
  // retry (e.g. from a profile-unavailable error state) since it owns its
  // own profileLoading/profileError bookkeeping.
  const fetchProfile = async (userId: string, attempts = 3, delayMs = 300) => {
    setProfileLoading(true);
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      // If a newer fetch has since started for a different user (rapid
      // account switch), abandon this one rather than clobbering state
      // that no longer corresponds to the current user. Preserves the
      // race protection the effect used to provide via its own
      // `cancelled` flag, now centralized here so fetchProfile stays
      // safe to call directly for a manual retry too.
      if (lastFetchedUserId.current !== userId) return;
      if (!error && data) {
        setProfile(data as Profile);
        setProfileError(false);
        setProfileLoading(false);
        // Server-authoritative timezone system: identify the user's
        // intended IANA zone from the device exactly once, on whichever
        // authenticated session first has no timezone stored yet. This
        // is fire-and-forget — a failure here doesn't affect profile
        // loading (already resolved above); @/lib/serverTime falls back
        // to UTC if timezone is still null on the next Quest evaluation,
        // and this will simply try again on the next profile fetch.
        if ((data as Profile).timezone === null) {
          const detected = detectDeviceTimezone();
          void supabase
            .from('profiles')
            .update({ timezone: detected })
            .eq('user_id', userId)
            .then(({ error: tzError }) => {
              if (!tzError && lastFetchedUserId.current === userId) {
                setProfile((prev) => prev ? { ...prev, timezone: detected } : prev);
              }
            });
        }
        return;
      }
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    if (lastFetchedUserId.current !== userId) return;
    setProfileError(true);
    setProfileLoading(false);
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
      setProfileError(false);
      return;
    }

    if (lastFetchedUserId.current === user.id) {
      return;
    }
    lastFetchedUserId.current = user.id;

    void fetchProfile(user.id);
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

  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth' | 'bio' | 'primary_goal'>>) => {
    if (!user) return { error: new Error('Not authenticated'), profile: null };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data as Profile);
    return { error, profile: !error && data ? (data as Profile) : null };
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
    user, profile, loading, profileLoading, profileError,
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
