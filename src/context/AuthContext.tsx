import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthUser } from '@/services'
import { AUTH_UNAUTHORIZED_EVENT } from '@/services/api/client'

interface AuthContextValue {
  user: AuthUser | null
  /** True while the stored token is being validated against /auth/me. */
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)
  const navigate = useNavigate()

  // Validate the persisted session on startup: a stale/expired token is
  // discarded here instead of letting protected pages flash.
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const current = await authService.me()
        if (!cancelled) setUser(current)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  // Any API call rejected with 401 ends the session globally.
  useEffect(() => {
    function onUnauthorized() {
      setUser(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [navigate])

  const login = useCallback(async (email: string, password: string) => {
    const authenticated = await authService.login(email, password)
    setUser(authenticated)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      // Use a full page replace to nuke the browser history stack so the
      // Back button cannot return the user to any protected page.
      window.location.replace('/login')
    }
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, logout }),
    [user, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
