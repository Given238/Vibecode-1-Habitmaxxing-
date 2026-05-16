import { type FormEvent, useState } from 'react'
import { addDays } from '../lib/dates'
import {
  JOURNAL_MAX_SENTENCES,
  JOURNAL_MIN_SENTENCES,
  isValidJournal,
  journalHint,
} from '../lib/journal'

type Props = {
  habitName: string
  date: string
  today: string
  existingEntry?: string
  onSave: (journal: string) => void
  onRemove?: () => void
  onClose: () => void
}

function dateHeading(date: string, today: string): string {
  if (date === today) return 'Today'
  if (date === addDays(today, -1)) return 'Yesterday'
  return new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function JournalModal({
  habitName,
  date,
  today,
  existingEntry,
  onSave,
  onRemove,
  onClose,
}: Props) {
  const [text, setText] = useState(existingEntry ?? '')
  const valid = isValidJournal(text)
  const hint = journalHint(text)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    onSave(text.trim())
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-[var(--color-surface)] p-5 shadow-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Journal log</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">{habitName}</h2>
        <p className="text-sm text-muted">{dateHeading(date, today)}</p>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Write <strong className="text-ink">{JOURNAL_MIN_SENTENCES}–{JOURNAL_MAX_SENTENCES} sentences</strong>{' '}
          about what you did. End each sentence with <strong className="text-ink">. ! or ?</strong> — no journal, no
          valid check-in.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="I went for a 20-minute run around the block. My legs were tired but I showed up. I'll sleep better tonight because of it."
          className="mt-3 w-full resize-none rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <p className={`mt-2 text-xs ${valid ? 'text-accent' : 'text-muted'}`}>{hint}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!valid}
            className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {existingEntry ? 'Update log' : 'Save & check in'}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted">
            Cancel
          </button>
        </div>

        {existingEntry && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="mt-3 w-full text-center text-xs text-warn underline"
          >
            Remove this day&apos;s log
          </button>
        ) : null}
      </form>
    </div>
  )
}
