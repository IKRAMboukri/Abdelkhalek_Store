import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthUser } from '@/services'
import { AUTH_UNAUTHORIZED_EVENT, clearStoredToken } from '@/services/api/client'

interface AuthContextValue {
  user: AuthUser | null
  /** True while the stored token is being validated against /auth/me. */
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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

  // Logout must be fully synchronous — never await a network request before
  // navigating.  In a PWA the service worker can intercept / delay fetch()
  // calls (Workbox NetworkFirst with a 10 s timeout), which would leave the
  // user stranded on a protected page while the await hangs.
  const logout = useCallback(() => {
    // 1. Clear auth data synchronously — no async, no await.
    clearStoredToken()
    setUser(null)

    // 2. Clear the service-worker API cache so stale authenticated responses
    //    are never served after logout.
    if ('caches' in window) {
      Promise.all([
        caches.delete('api-cache'),
        caches.delete('stable-api-cache'),
      ]).catch(() => {})
    }

    // 3. Best-effort: notify the server in the background (fire-and-forget).
    authService.logout().catch(() => {})

    // 4. Navigate immediately — a hard replace so the Back button cannot
    //    return to a protected page.
    window.location.replace('/login')
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
