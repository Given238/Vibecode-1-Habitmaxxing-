import type { PenaltyEvent } from '../types'
import { XP_PENALTY_BASE } from '../lib/game'
import type { ShamePayload } from '../hooks/useHabitStore'

type Props = {
  payload: ShamePayload
  onDismiss: () => void
}

function EventBlock({ e }: { e: PenaltyEvent }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-warn bg-warn-soft/80 p-4 text-left">
      <p className="font-semibold text-ink">{e.habitName}</p>
      <p className="mt-1 text-sm text-warn">
        −{e.xpLost} XP · streak vaporized ({e.streakLost} → 0)
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">Your forfeit</p>
      <p className="mt-1 text-base font-medium leading-snug text-ink">{e.forfeit}</p>
    </div>
  )
}

export function ShameModal({ payload, onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-labelledby="shame-title"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onDismiss}
        aria-label="Dismiss shame"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border-4 border-warn bg-[var(--color-surface)] shadow-2xl shame-wobble">
        <div className="bg-warn px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.25em] text-white shame-flash">
          Public disgrace
        </div>
        <div className="px-5 py-6">
          <p id="shame-title" className="text-center text-2xl font-bold text-warn">
            💀 You blew it 💀
          </p>
          <p className="mt-2 text-center text-sm italic text-muted">{payload.roast}</p>
          <p className="mt-4 text-center text-xs text-muted">
            Two calendar days. Your rules. You still lost {XP_PENALTY_BASE} XP per habit anyway.
          </p>
          <div className="mt-5 space-y-3">
            {payload.events.map((e) => (
              <EventBlock key={e.habitId} e={e} />
            ))}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 w-full rounded-xl border-2 border-warn bg-warn py-3 text-sm font-bold text-white transition hover:brightness-110"
          >
            I accept my humiliation (dismiss)
          </button>
          <p className="mt-3 text-center text-[10px] text-muted">
            Complete the habit to clear the shame badge on your card.
          </p>
        </div>
      </div>
    </div>
  )
}
