import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: { full_name?: string; phone?: string | null }) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  deleteAccount: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) {
      setProfile(data as Profile)
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone: phone || null },
        },
      })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const updateProfile = async (data: { full_name?: string; phone?: string | null }) => {
    if (!user) return { error: new Error('Not signed in') }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) return { error: error as Error }

      if (data.full_name !== undefined) {
        await supabase.auth.updateUser({
          data: { full_name: data.full_name, phone: data.phone ?? undefined },
        })
      }

      await fetchProfile(user.id)
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  /** Permanently deletes the user in auth + app tables via RPC */
  const deleteAccount = async () => {
    if (!user) return { error: new Error('Not signed in') }
    try {
      const { error } = await supabase.rpc('delete_own_account')
      if (error) return { error: error as Error }

      // Clear local session (user already removed server-side)
      await supabase.auth.signOut({ scope: 'local' })
      setUser(null)
      setSession(null)
      setProfile(null)
      try {
        localStorage.removeItem('kulu_cart')
      } catch {
        /* ignore */
      }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateProfile,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
