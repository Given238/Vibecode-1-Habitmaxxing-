import { useHabits } from '../contexts/HabitStoreContext'
import { AddHabitForm } from '../components/AddHabitForm'
import { HabitCard } from '../components/HabitCard'
import { ShameModal } from '../components/ShameModal'
import { XP_PER_LEVEL, XP_PENALTY_BASE } from '../lib/game'
import { JOURNAL_MAX_SENTENCES, JOURNAL_MIN_SENTENCES } from '../lib/journal'

export function DashboardPage() {
  const {
    habitsWithMeta,
    addHabit,
    updateHabit,
    removeHabit,
    saveJournal,
    clearLog,
    shameModal,
    dismissShame,
    today,
  } = useHabits()

  const shamedCount = habitsWithMeta.filter((h) => h.habit.shameActive).length

  return (
    <>
      {shameModal ? <ShameModal payload={shameModal} onDismiss={dismissShame} /> : null}

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Today</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Log with <strong className="text-ink">{JOURNAL_MIN_SENTENCES}–{JOURNAL_MAX_SENTENCES} sentences</strong>.
          Miss two calendar days → −{XP_PENALTY_BASE} XP & shame. {XP_PER_LEVEL} XP per level, per habit.
        </p>
      </header>

      {shamedCount > 0 ? (
        <div className="mb-6 rounded-xl border-2 border-warn bg-warn-soft px-4 py-3 text-center text-sm font-semibold text-warn shame-flash">
          {shamedCount} habit{shamedCount > 1 ? 's' : ''} in shame. Journal + forfeit.
        </div>
      ) : null}

      <AddHabitForm onAdd={addHabit} />

      <ul className="mt-6 space-y-3">
        {habitsWithMeta.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-5 py-12 text-center text-sm text-muted">
            No habits yet. Add one below or from Home.
          </li>
        ) : (
          habitsWithMeta.map(({ habit, streak, doneToday }) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={streak}
              doneToday={doneToday}
              today={today}
              onSaveJournal={(date, journal) => saveJournal(habit.id, date, journal)}
              onClearLog={(date) => clearLog(habit.id, date)}
              onRemove={() => removeHabit(habit.id)}
              onEditForfeit={(forfeit) => updateHabit(habit.id, { customForfeit: forfeit })}
            />
          ))
        )}
      </ul>
    </>
  )
}
