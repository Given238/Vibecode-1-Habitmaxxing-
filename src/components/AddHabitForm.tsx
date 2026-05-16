import { type FormEvent, useState } from 'react'
import type { HabitSchedule } from '../types'
import { SCHEDULE_PRESETS } from '../lib/schedule'

const DEFAULT_FORFEIT = 'Do 10 push-ups while apologizing to your future self out loud.'

type Props = {
  onAdd: (name: string, schedule: HabitSchedule, forfeit: string) => void
}

export function AddHabitForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [scheduleIdx, setScheduleIdx] = useState(0)
  const [weeklyTimes, setWeeklyTimes] = useState(3)
  const [forfeit, setForfeit] = useState(DEFAULT_FORFEIT)
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5])
  const [mode, setMode] = useState<'preset' | 'custom' | 'weekly'>('preset')

  function buildSchedule(): HabitSchedule {
    if (mode === 'weekly') return { type: 'weekly', times: Math.min(7, Math.max(1, weeklyTimes)) }
    if (mode === 'custom') return { type: 'days', days: customDays.length ? customDays : [1] }
    return SCHEDULE_PRESETS[scheduleIdx]?.schedule ?? { type: 'daily' }
  }

  function toggleDay(d: number) {
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    )
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    onAdd(name, buildSchedule(), forfeit)
    setName('')
    setForfeit(DEFAULT_FORFEIT)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-line py-4 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        + Add habit with your own rules
      </button>
    )
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-[var(--color-surface)] p-4 shadow-sm">
      <p className="text-sm font-semibold text-ink">New habit</p>

      <label className="mt-3 block text-xs font-medium text-muted">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Morning run"
        className="mt-1 w-full rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        required
      />

      <label className="mt-3 block text-xs font-medium text-muted">How often?</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {(['preset', 'weekly', 'custom'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === m ? 'bg-accent text-white' : 'bg-line/60 text-muted'
            }`}
          >
            {m === 'preset' ? 'Preset' : m === 'weekly' ? '×/week' : 'Pick days'}
          </button>
        ))}
      </div>

      {mode === 'preset' ? (
        <select
          value={scheduleIdx}
          onChange={(e) => setScheduleIdx(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {SCHEDULE_PRESETS.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      ) : null}

      {mode === 'weekly' ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={7}
            value={weeklyTimes}
            onChange={(e) => setWeeklyTimes(Number(e.target.value))}
            className="w-16 rounded-xl border border-line px-2 py-2 text-sm"
          />
          <span className="text-sm text-muted">times per week (2 idle days = penalty)</span>
        </div>
      ) : null}

      {mode === 'custom' ? (
        <div className="mt-2 flex justify-between gap-1">
          {dayLabels.map((lbl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`h-9 w-9 rounded-full text-xs font-semibold ${
                customDays.includes(i) ? 'bg-accent text-white' : 'bg-line text-muted'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      ) : null}

      <label className="mt-4 block text-xs font-medium text-muted">
        Custom forfeit (shown when you miss 2 days)
      </label>
      <textarea
        value={forfeit}
        onChange={(e) => setForfeit(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-none rounded-xl border border-line bg-[var(--color-surface)] px-3 py-2 text-sm text-ink outline-none focus:border-warn focus:ring-2 focus:ring-warn/20"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-line py-2.5 text-sm text-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
        >
          Create
        </button>
      </div>
    </form>
  )
}
