import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearSession, readSession, verifyLogin, writeSession, type Session } from '../lib/auth'

const AuthContext = createContext<{
  session: Session | null
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())

  const login = useCallback(async (username: string, password: string) => {
    const ok = await verifyLogin(username, password)
    if (!ok) return { ok: false, error: 'Invalid username or password.' }
    writeSession(username.trim().toLowerCase())
    setSession(readSession())
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
