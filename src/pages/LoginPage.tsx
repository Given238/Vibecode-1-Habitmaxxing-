import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export function LoginPage() {
  const { session, login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(username, password)
    setLoading(false)
    if (result.ok) navigate(from, { replace: true })
    else setError(result.error ?? 'Login failed.')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-lg border border-line px-3 py-1.5 text-sm text-muted"
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Habitmaxxing
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">Phase 2 — your data stays in this browser.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-[var(--color-surface)] p-6 shadow-sm">
          <div>
            <label htmlFor="username" className="text-xs font-medium text-muted">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>
          {error ? <p className="text-sm text-warn">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
