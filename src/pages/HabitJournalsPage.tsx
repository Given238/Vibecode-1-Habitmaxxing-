import { Link, useParams } from 'react-router-dom'
import { useHabits } from '../contexts/HabitStoreContext'
import { allJournalEntries, formatDisplayDate } from '../lib/monthlyReview'
import { scheduleLabel } from '../lib/schedule'
import { levelFromTotalExp } from '../lib/game'

export function HabitJournalsPage() {
  const { habitId } = useParams<{ habitId: string }>()
  const { habits } = useHabits()
  const habit = habits.find((h) => h.id === habitId)

  if (!habit) {
    return (
      <div>
        <p className="text-muted">Habit not found.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-accent">
          ← Back to today
        </Link>
      </div>
    )
  }

  const entries = allJournalEntries(habit)

  return (
    <div>
      <Link to="/" className="text-sm text-accent hover:underline">
        ← Today
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold text-ink">{habit.name}</h1>
        <p className="mt-1 text-sm text-muted">{scheduleLabel(habit.schedule)}</p>
        <p className="mt-2 text-xs text-muted">
          Level {levelFromTotalExp(habit.exp)} · {entries.length} journal{entries.length === 1 ? '' : 's'}
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-12 text-center text-sm text-muted">
          No journals yet. Log from the Today page.
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map(({ date, text }) => (
            <li key={date} className="rounded-2xl border border-line bg-[var(--color-surface)] p-4">
              <time className="text-xs font-semibold uppercase tracking-wide text-accent">
                {formatDisplayDate(date)}
              </time>
              <p className="mt-2 text-sm leading-relaxed text-ink">{text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
