import type { Habit } from '../types'
import { addDays } from '../lib/dates'
import { hasValidLog } from '../lib/journal'
import { isDueOnSchedule } from '../lib/schedule'

type Props = {
  habit: Habit
  today: string
  onOpenLog: (date: string) => void
}

function labelFor(iso: string, today: string): string {
  if (iso === today) return 'Today'
  const yesterday = addDays(today, -1)
  if (iso === yesterday) return 'Yest'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'narrow' })
}

export function HistoryStrip({ habit, today, onOpenLog }: Props) {
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    days.push(addDays(today, -i))
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        Last 14 days · tap to journal
      </p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {days.map((iso) => {
          const done = hasValidLog(habit, iso)
          const due = isDueOnSchedule(habit.schedule, iso)
          const isToday = iso === today
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onOpenLog(iso)}
              title={iso}
              className={`flex min-w-[2.25rem] shrink-0 flex-col items-center rounded-lg border px-1 py-1.5 text-[10px] transition ${
                done
                  ? 'border-accent bg-accent-soft text-accent'
                  : due
                    ? 'border-line bg-transparent text-muted hover:border-muted'
                    : 'border-transparent bg-line/40 text-muted/50'
              } ${isToday ? 'ring-2 ring-accent/40' : ''}`}
            >
              <span className="font-medium">{labelFor(iso, today)}</span>
              <span className="mt-0.5 text-xs">{done ? '✓' : due ? '·' : '—'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
