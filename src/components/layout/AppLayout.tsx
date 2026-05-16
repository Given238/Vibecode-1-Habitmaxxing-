import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHabits } from '../../contexts/HabitStoreContext'
import { useTheme } from '../../contexts/ThemeContext'
import { scheduleLabel } from '../../lib/schedule'
import { HamburgerButton } from './HamburgerButton'

const LG = 1024

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
    isActive ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-line/60 hover:text-ink'
  }`
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/today': 'Today',
  '/review': 'Monthly review',
}

function usePageTitle(pathname: string, habitName?: string): string {
  if (habitName) return habitName
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  return 'Habitmaxxing'
}

function useIsWideHome(pathname: string): boolean {
  return pathname === '/'
}

export function AppLayout() {
  const { habits } = useHabits()
  const { logout, session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= LG,
  )
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= LG,
  )

  const habitMatch = location.pathname.match(/^\/habit\/([^/]+)/)
  const activeHabit = habitMatch ? habits.find((h) => h.id === habitMatch[1]) : undefined
  const pageTitle = usePageTitle(location.pathname, activeHabit?.name)
  const wideMain = useIsWideHome(location.pathname)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG}px)`)
    const onChange = () => {
      setIsDesktop(mq.matches)
      if (mq.matches) setSidebarOpen(true)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false)
  }, [location.pathname, isDesktop])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  const showBackdrop = sidebarOpen && !isDesktop

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Habitmaxxing</p>
          <p className="mt-0.5 truncate text-sm text-muted">@{session?.username}</p>
        </div>
        {!isDesktop ? (
          <HamburgerButton open onClick={closeSidebar} />
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Menu</p>
        <div className="space-y-0.5">
          <NavLink to="/" end className={navClass} onClick={closeSidebar}>
            <NavIcon>⌂</NavIcon> Home
          </NavLink>
          <NavLink to="/today" className={navClass} onClick={closeSidebar}>
            <NavIcon>✓</NavIcon> Today
          </NavLink>
          <NavLink to="/review" className={navClass} onClick={closeSidebar}>
            <NavIcon>◷</NavIcon> Monthly review
          </NavLink>
        </div>

        {habits.length > 0 ? (
          <>
            <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Journals
            </p>
            <ul className="space-y-0.5">
              {habits.map((h) => (
                <li key={h.id}>
                  <NavLink
                    to={`/habit/${h.id}`}
                    className={navClass}
                    onClick={closeSidebar}
                    title={scheduleLabel(h.schedule)}
                  >
                    <NavIcon>📓</NavIcon>
                    <span className="line-clamp-1">{h.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </nav>

      <div className="space-y-2 border-t border-line p-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2.5 text-sm text-ink hover:bg-line/50"
        >
          <span>Theme</span>
          <span className="text-muted">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-warn hover:bg-warn-soft"
        >
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh">
      {showBackdrop ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-[var(--color-surface)] shadow-xl transition-[transform,width] duration-300 ease-out lg:static lg:z-auto lg:shrink-0 lg:shadow-none ${
          sidebarOpen
            ? 'w-[min(100vw-3rem,17rem)] translate-x-0 lg:w-64'
            : 'w-[min(100vw-3rem,17rem)] -translate-x-full lg:w-0 lg:border-r-0 lg:overflow-hidden'
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className={`flex h-full w-[min(100vw-3rem,17rem)] flex-col ${sidebarOpen ? '' : 'lg:invisible'}`}>
          {sidebarContent}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur-md sm:px-5">
          <HamburgerButton open={sidebarOpen} onClick={() => setSidebarOpen((o) => !o)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{pageTitle}</p>
            <p className="truncate text-[10px] text-muted lg:hidden">Habitmaxxing</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden rounded-xl border border-line px-3 py-2 text-xs text-muted transition hover:bg-line/50 sm:inline-flex"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div
            className={`mx-auto px-4 py-6 sm:px-6 sm:py-8 ${
              wideMain ? 'max-w-5xl' : 'max-w-2xl'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-line/60 text-xs">
      {children}
    </span>
  )
}
