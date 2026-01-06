"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  signOut: async () => {},
  isConfigured: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const initializingRef = useRef(false)

  useEffect(() => {
    if (initializingRef.current) return
    initializingRef.current = true

    console.log("[v0] Initializing AuthProvider")
    try {
      const supabase = createClient()

      if (!supabase) {
        console.log("[v0] Supabase not configured - showing configuration prompt")
        setIsConfigured(false)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsConfigured(true)

      // Get initial session
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          console.log("[v0] Initial session retrieved:", session?.user?.id || "none")
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
          setError(null)
        })
        .catch((err) => {
          console.error("[v0] Error retrieving session:", err)
          setError("Failed to retrieve session")
          setIsLoading(false)
        })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[v0] Auth state change event:", event)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        console.log("[v0] Cleaning up AuthProvider subscription")
        subscription.unsubscribe()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize Supabase"
      console.error("[v0] AuthProvider initialization error:", errorMessage)
      setError(errorMessage)
      setIsLoading(false)
      setIsConfigured(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error("[v0] Sign out error:", err)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signOut, isConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
