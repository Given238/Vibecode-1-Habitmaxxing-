import type { AppState, Habit, HabitSchedule } from '../types'
import { isValidJournal } from './journal'
import { XP_PER_COMPLETION } from './game'

type LegacyHabit = {
  id: string
  name: string
  createdAt: string
  completions: Record<string, unknown>
  penaltyLock?: boolean
}

type LegacyState = {
  habits: LegacyHabit[]
  totalExp?: number
  lastPenaltyEvalDate?: string | null
}

function defaultSchedule(): HabitSchedule {
  return { type: 'daily' }
}

function normalizeCompletions(raw: Record<string, unknown> | undefined): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [date, val] of Object.entries(raw)) {
    if (typeof val === 'string' && isValidJournal(val)) {
      out[date] = val.trim()
    }
  }
  return out
}

function expFromCompletions(completions: Record<string, string>): number {
  return Object.keys(completions).length * XP_PER_COMPLETION
}

function migrateHabit(h: LegacyHabit): Habit {
  const completions = normalizeCompletions(h.completions as Record<string, unknown>)
  return {
    id: h.id,
    name: h.name,
    createdAt: h.createdAt,
    schedule: defaultSchedule(),
    customForfeit: 'Do 10 push-ups while apologizing to your future self.',
    completions,
    exp: expFromCompletions(completions),
    penaltyLock: Boolean(h.penaltyLock),
    shameActive: Boolean(h.penaltyLock),
    lastStreakBeforeShame: 0,
  }
}

export function parseStoredState(raw: string | null): AppState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AppState & LegacyState
    if (!parsed || !Array.isArray(parsed.habits)) return null

    const first = parsed.habits[0] as Habit | LegacyHabit | undefined
    if (first && 'schedule' in first && 'exp' in first) {
      return {
        habits: (parsed.habits as Habit[]).map(normalizeHabit),
        lastPenaltyEvalDate: parsed.lastPenaltyEvalDate ?? null,
      }
    }

    return {
      habits: (parsed.habits as LegacyHabit[]).map(migrateHabit),
      lastPenaltyEvalDate: parsed.lastPenaltyEvalDate ?? null,
    }
  } catch {
    return null
  }
}

export function normalizeHabit(h: Habit): Habit {
  const completions = normalizeCompletions(h.completions as unknown as Record<string, unknown>)
  return {
    ...h,
    schedule: h.schedule ?? defaultSchedule(),
    customForfeit: h.customForfeit?.trim() || 'Do 10 push-ups while apologizing to your future self.',
    completions,
    exp: expFromCompletions(completions),
    penaltyLock: Boolean(h.penaltyLock),
    shameActive: Boolean(h.shameActive),
    lastStreakBeforeShame: h.lastStreakBeforeShame ?? 0,
  }
}
