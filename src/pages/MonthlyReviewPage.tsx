import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHabits } from '../contexts/HabitStoreContext'
import {
  currentMonthKey,
  monthLabel,
  parseMonthKey,
  shiftMonthKey,
  statsForMonth,
} from '../lib/monthlyReview'

export function MonthlyReviewPage() {
  const { habits } = useHabits()
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const { year, month } = parseMonthKey(monthKey)

  const allStats = habits.map((h) => ({ habit: h, stats: statsForMonth(h, year, month) }))
  const totalLogs = allStats.reduce((n, s) => n + s.stats.logs, 0)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Monthly review</h1>
        <p className="mt-2 text-sm text-muted">Simple progress snapshot per habit.</p>
      </header>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[var(--color-surface)] px-4 py-3">
        <button
          type="button"
          onClick={() => setMonthKey((k) => shiftMonthKey(k, -1))}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-line/50"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-ink">{monthLabel(year, month)}</span>
        <button
          type="button"
          onClick={() => setMonthKey((k) => shiftMonthKey(k, 1))}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-line/50"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-accent-soft/50 p-4">
          <p className="text-xs text-muted">Total journals</p>
          <p className="text-2xl font-semibold text-ink">{totalLogs}</p>
        </div>
        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs text-muted">Active habits</p>
          <p className="text-2xl font-semibold text-ink">{habits.length}</p>
        </div>
      </div>

      {habits.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">Add habits on Today to see monthly stats.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {allStats.map(({ habit, stats }) => (
            <li key={habit.id} className="rounded-2xl border border-line bg-[var(--color-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">{habit.name}</h2>
                  <p className="text-xs text-muted">Level {stats.level} · {stats.exp} XP total</p>
                </div>
                <Link to={`/habit/${habit.id}`} className="shrink-0 text-xs text-accent hover:underline">
                  Journals →
                </Link>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">Logs this month</dt>
                  <dd className="font-semibold text-ink">{stats.logs}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {stats.weeklyTarget ? 'Weeks on target' : 'Due days hit'}
                  </dt>
                  <dd className="font-semibold text-ink">
                    {stats.weeklyTarget
                      ? `${stats.dueCompleted} / ${stats.dueDays}`
                      : stats.dueDays > 0
                        ? `${stats.dueCompleted} / ${stats.dueDays} (${Math.round((stats.dueCompleted / stats.dueDays) * 100)}%)`
                        : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Est. XP from logs</dt>
                  <dd className="font-semibold text-ink">+{stats.xpEarnedEstimate}</dd>
                </div>
                {stats.weeklyTarget ? (
                  <div>
                    <dt className="text-xs text-muted">Weekly goal</dt>
                    <dd className="font-semibold text-ink">{stats.weeklyTarget}×/week</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
