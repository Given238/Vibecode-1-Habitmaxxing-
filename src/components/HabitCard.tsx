import { useState } from 'react'
import type { Habit } from '../types'
import { XP_PER_COMPLETION } from '../lib/game'
import { hasValidLog } from '../lib/journal'
import { scheduleLabel } from '../lib/schedule'
import { weeklyTarget } from '../lib/habitLogic'
import { LevelMini } from './LevelMini'
import { HistoryStrip } from './HistoryStrip'
import { JournalModal } from './JournalModal'

type Props = {
  habit: Habit
  streak: number
  doneToday: boolean
  today: string
  onSaveJournal: (date: string, journal: string) => boolean
  onClearLog: (date: string) => void
  onRemove: () => void
  onEditForfeit: (forfeit: string) => void
}

export function HabitCard({
  habit,
  streak,
  doneToday,
  today,
  onSaveJournal,
  onClearLog,
  onRemove,
  onEditForfeit,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editingForfeit, setEditingForfeit] = useState(false)
  const [forfeitDraft, setForfeitDraft] = useState(habit.customForfeit)
  const [journalDate, setJournalDate] = useState<string | null>(null)

  const weekly = weeklyTarget(habit)
  const shamed = habit.shameActive
  const todayEntry = habit.completions[today]

  function openJournal(date: string) {
    setJournalDate(date)
  }

  function closeJournal() {
    setJournalDate(null)
  }

  return (
    <li
      className={`rounded-2xl border px-4 py-3 transition ${
        shamed
          ? 'border-warn bg-warn-soft/30 shame-card-pulse'
          : 'border-line bg-[var(--color-surface)] shadow-[0_1px_0_rgba(0,0,0,0.03)]'
      }`}
    >
      {journalDate ? (
        <JournalModal
          habitName={habit.name}
          date={journalDate}
          today={today}
          existingEntry={
            hasValidLog(habit, journalDate) ? habit.completions[journalDate] : undefined
          }
          onSave={(journal) => {
            if (onSaveJournal(journalDate, journal)) closeJournal()
          }}
          onRemove={
            hasValidLog(habit, journalDate)
              ? () => {
                  onClearLog(journalDate)
                  closeJournal()
                }
              : undefined
          }
          onClose={closeJournal}
        />
      ) : null}

      {shamed ? (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-warn/15 px-2 py-1.5 text-xs font-bold text-warn">
          <span className="motion-safe:animate-bounce">☠️</span>
          <span>
            SHAME MODE — streak {habit.lastStreakBeforeShame} → 0 · journal + forfeit
          </span>
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => openJournal(today)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 text-lg transition ${
            doneToday
              ? 'border-accent bg-accent-soft text-accent'
              : shamed
                ? 'border-warn bg-warn-soft text-warn motion-safe:animate-pulse'
                : 'border-line text-muted hover:border-muted'
          }`}
          aria-pressed={doneToday}
          aria-label={doneToday ? `Edit journal for ${habit.name}` : `Log ${habit.name} with journal`}
        >
          {doneToday ? '✓' : shamed ? '!' : '✎'}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{habit.name}</p>
          <p className="text-xs text-muted">{scheduleLabel(habit.schedule)}</p>
          <LevelMini exp={habit.exp} />
          <p className="mt-1.5 text-xs text-muted">
            {weekly != null ? (
              <>
                <span className="font-semibold text-ink">{streak}</span>/{weekly} this week
              </>
            ) : (
              <>
                Streak <span className="font-semibold text-ink">{streak}</span> days
              </>
            )}
            <span className="text-muted"> · +{XP_PER_COMPLETION} XP per journal</span>
          </p>
          {doneToday && todayEntry ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted italic">
              &ldquo;{todayEntry}&rdquo;
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">Tap ✎ to log with 2–4 sentences.</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-line"
          >
            {expanded ? 'Hide' : 'Log'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-line hover:text-warn"
          >
            Del
          </button>
        </div>
      </div>

      {shamed && !editingForfeit ? (
        <div className="mt-3 rounded-xl border border-dashed border-warn/50 bg-warn-soft/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-warn">Owed forfeit</p>
          <p className="mt-1 text-sm font-medium text-ink">{habit.customForfeit}</p>
          <button
            type="button"
            onClick={() => {
              setForfeitDraft(habit.customForfeit)
              setEditingForfeit(true)
            }}
            className="mt-2 text-[10px] text-muted underline"
          >
            Edit forfeit
          </button>
        </div>
      ) : null}

      {editingForfeit ? (
        <div className="mt-3">
          <textarea
            value={forfeitDraft}
            onChange={(e) => setForfeitDraft(e.target.value)}
            className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
            rows={2}
          />
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="text-xs text-accent"
              onClick={() => {
                onEditForfeit(forfeitDraft)
                setEditingForfeit(false)
              }}
            >
              Save
            </button>
            <button type="button" className="text-xs text-muted" onClick={() => setEditingForfeit(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {expanded ? (
        <HistoryStrip habit={habit} today={today} onOpenLog={openJournal} />
      ) : null}
    </li>
  )
}
