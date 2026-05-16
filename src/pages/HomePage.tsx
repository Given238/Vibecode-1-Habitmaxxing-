import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../contexts/HabitStoreContext'
import { expProgress, levelFromTotalExp } from '../lib/game'
import { isValidJournal } from '../lib/journal'
import { currentMonthKey, formatDisplayDate, parseMonthKey, statsForMonth } from '../lib/monthlyReview'
import { scheduleLabel } from '../lib/schedule'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { session } = useAuth()
  const { habits, habitsWithMeta, today } = useHabits()

  const todayLabel = new Date(today + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const doneToday = habitsWithMeta.filter((h) => h.doneToday).length
  const totalHabits = habits.length
  const totalExp = habits.reduce((s, h) => s + h.exp, 0)
  const shamedCount = habits.filter((h) => h.shameActive).length
  const { year, month } = parseMonthKey(currentMonthKey())
  const monthLogs = habits.reduce((n, h) => n + statsForMonth(h, year, month).logs, 0)

  const recentJournals = habits
    .flatMap((h) =>
      Object.entries(h.completions)
        .filter(([, text]) => typeof text === 'string' && isValidJournal(text))
        .map(([date, text]) => ({
          habitId: h.id,
          habitName: h.name,
          date,
          text: (text as string).trim(),
        })),
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3)

  const progressPct = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent-soft/80 via-[var(--color-surface)] to-[var(--color-surface)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Home</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          {greeting()}, {session?.username}
        </h1>
        <p className="mt-2 text-sm text-muted">{todayLabel}</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Your command center — track habits, journal with intent, and level up one day at a time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/today"
            className="inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Open today →
          </Link>
          <Link
            to="/review"
            className="inline-flex items-center rounded-xl border border-line bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-line/50"
          >
            Monthly review
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Habits" value={String(totalHabits)} sub="active" />
        <StatCard
          label="Today"
          value={`${doneToday}/${totalHabits || 0}`}
          sub={totalHabits ? `${progressPct}% logged` : 'add a habit'}
          highlight={doneToday === totalHabits && totalHabits > 0}
        />
        <StatCard label="Total XP" value={String(totalExp)} sub={`≈ Lv ${levelFromTotalExp(totalExp)} avg`} />
        <StatCard
          label="This month"
          value={String(monthLogs)}
          sub="journal entries"
          warn={shamedCount > 0}
          warnText={shamedCount > 0 ? `${shamedCount} in shame` : undefined}
        />
      </section>

      {shamedCount > 0 ? (
        <div className="rounded-2xl border-2 border-warn/40 bg-warn-soft/60 px-5 py-4 text-sm text-warn">
          <span className="font-semibold">{shamedCount} habit{shamedCount > 1 ? 's' : ''} in shame mode.</span>{' '}
          Complete today&apos;s journal on the Today page to clear the badge.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your habits</h2>
            <Link to="/today" className="text-sm text-accent hover:underline">
              Manage →
            </Link>
          </div>
          {habits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <p className="text-sm text-muted">No habits yet.</p>
              <Link to="/today" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
                Create your first habit
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {habitsWithMeta.map(({ habit, streak, doneToday: done }) => {
                const { inLevel, toNext } = expProgress(habit.exp)
                const pct = Math.min(100, Math.round((inLevel / toNext) * 100))
                return (
                  <li
                    key={habit.id}
                    className="group rounded-2xl border border-line bg-[var(--color-surface)] p-4 transition hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">{habit.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{scheduleLabel(habit.schedule)}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          done
                            ? 'bg-accent-soft text-accent'
                            : habit.shameActive
                              ? 'bg-warn-soft text-warn'
                              : 'bg-line text-muted'
                        }`}
                      >
                        {done ? 'Done' : habit.shameActive ? 'Shame' : 'Due'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      Lv {levelFromTotalExp(habit.exp)} · {habit.exp} XP · streak {streak}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <Link
                      to={`/habit/${habit.id}`}
                      className="mt-3 inline-block text-xs text-accent sm:opacity-0 sm:transition group-hover:sm:opacity-100"
                    >
                      View journals →
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-ink">Recent journals</h2>
          {recentJournals.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
              Logs show up here after you journal on Today.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentJournals.map((j) => (
                <li key={`${j.habitId}-${j.date}`} className="rounded-2xl border border-line bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-accent">{j.habitName}</span>
                    <time className="text-[10px] text-muted">{formatDisplayDate(j.date)}</time>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{j.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  warn,
  warnText,
}: {
  label: string
  value: string
  sub: string
  highlight?: boolean
  warn?: boolean
  warnText?: string
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        highlight
          ? 'border-accent/40 bg-accent-soft/50'
          : warn
            ? 'border-warn/30 bg-warn-soft/30'
            : 'border-line bg-[var(--color-surface)]'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className={`mt-0.5 text-xs ${warn && warnText ? 'text-warn' : 'text-muted'}`}>{warnText ?? sub}</p>
    </div>
  )
}
