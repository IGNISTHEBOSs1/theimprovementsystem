// Thin re-export so every existing `import { useAuth } from '@/hooks/useAuth'`
// (and relative equivalents) continues to work unchanged. The actual auth
// lifecycle lives in AuthProvider — this hook only reads Context; it never
// starts a new getSession()/onAuthStateChange() lifecycle. See
// src/providers/AuthProvider.tsx.
export { useAuthContext as useAuth } from '@/providers/AuthProvider';
export type { Profile } from '@/providers/AuthProvider';
