import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppState, Habit, HabitSchedule, PenaltyEvent } from '../types'
import { applyMissStreakPenalties, currentStreak, removeCompletion, setCompletion } from '../lib/habitLogic'
import { todayLocal } from '../lib/dates'
import { XP_PER_COMPLETION } from '../lib/game'
import { normalizeHabit, parseStoredState } from '../lib/migrate'
import { pickRoast } from '../lib/shame'
import { hasValidLog } from '../lib/journal'

const STORAGE_KEY = 'habitmaxxing:v2'

const defaultState: AppState = {
  habits: [],
  lastPenaltyEvalDate: null,
}

function load(): AppState {
  const v2 = parseStoredState(localStorage.getItem(STORAGE_KEY))
  if (v2) return v2
  const v1 = parseStoredState(localStorage.getItem('habitmaxxing:v1'))
  if (v1) return v1
  return defaultState
}

function save(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export type ShamePayload = {
  roast: string
  events: PenaltyEvent[]
}

function reconcilePenalties(
  state: AppState,
  today: string,
): { next: AppState; shame: ShamePayload | null } {
  if (state.lastPenaltyEvalDate === today) {
    return { next: state, shame: null }
  }
  const { habits, events } = applyMissStreakPenalties(state.habits, today)
  const next: AppState = {
    ...state,
    habits,
    lastPenaltyEvalDate: today,
  }
  if (events.length === 0) return { next, shame: null }
  return { next, shame: { roast: pickRoast(), events } }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function useHabitStore() {
  const [shameModal, setShameModal] = useState<ShamePayload | null>(null)

  const [state, setState] = useState<AppState>(() => {
    const s = load()
    const { next, shame } = reconcilePenalties(s, todayLocal())
    if (shame) queueMicrotask(() => setShameModal(shame))
    save(next)
    return next
  })

  useEffect(() => {
    save(state)
  }, [state])

  const today = todayLocal()

  useEffect(() => {
    const tick = () => {
      const t = todayLocal()
      setState((s) => {
        if (s.lastPenaltyEvalDate === t) return s
        const { next, shame } = reconcilePenalties(s, t)
        if (shame) setShameModal(shame)
        return next
      })
    }
    const id = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  const dismissShame = useCallback(() => setShameModal(null), [])

  const addHabit = useCallback(
    (name: string, schedule: HabitSchedule, customForfeit: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const habit: Habit = normalizeHabit({
        id: uid(),
        name: trimmed,
        createdAt: todayLocal(),
        schedule,
        customForfeit: customForfeit.trim() || 'Do 10 push-ups while apologizing to your future self.',
        completions: {},
        exp: 0,
        penaltyLock: false,
        shameActive: false,
        lastStreakBeforeShame: 0,
      })
      setState((s) => ({ ...s, habits: [habit, ...s.habits] }))
    },
    [],
  )

  const updateHabit = useCallback(
    (id: string, patch: Partial<Pick<Habit, 'name' | 'schedule' | 'customForfeit'>>) => {
      setState((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? normalizeHabit({ ...h, ...patch }) : h)),
      }))
    },
    [],
  )

  const removeHabit = useCallback((id: string) => {
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }))
  }, [])

  const saveJournal = useCallback((id: string, date: string, journal: string): boolean => {
    let ok = false
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => {
        if (h.id !== id) return h
        const updated = setCompletion(h, date, journal, XP_PER_COMPLETION)
        if (!updated) return h
        ok = true
        return updated
      }),
    }))
    return ok
  }, [])

  const clearLog = useCallback((id: string, date: string) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? removeCompletion(h, date, XP_PER_COMPLETION) : h)),
    }))
  }, [])

  const habitsWithMeta = useMemo(
    () =>
      state.habits.map((h) => ({
        habit: h,
        streak: currentStreak(h, today),
        doneToday: hasValidLog(h, today),
        todayJournal: h.completions[today],
      })),
    [state.habits, today],
  )

  return {
    habits: state.habits,
    habitsWithMeta,
    addHabit,
    updateHabit,
    removeHabit,
    saveJournal,
    clearLog,
    shameModal,
    dismissShame,
    today,
  }
}
