import type { Habit, PenaltyEvent } from '../types'
import { addDays, daysBetweenInclusive, todayLocal } from './dates'
import { hasValidLog, isValidJournal } from './journal'
import { countsAsMissDay, completionsInWeek, isDueOnSchedule } from './schedule'
import { XP_PENALTY_BASE } from './game'

export function isFulfilled(habit: Habit, iso: string): boolean {
  return hasValidLog(habit, iso)
}

/** Consecutive due-day streak (schedule-aware). */
export function currentStreak(habit: Habit, today: string): number {
  if (habit.schedule.type === 'weekly') {
    return completionsInWeek(habit, today)
  }

  let streak = 0
  let d = today

  if (isDueOnSchedule(habit.schedule, d) && !isFulfilled(habit, d)) {
    d = addDays(d, -1)
  }

  while (daysBetweenInclusive(habit.createdAt, d) >= 0) {
    if (isDueOnSchedule(habit.schedule, d)) {
      if (!isFulfilled(habit, d)) break
      streak++
    }
    d = addDays(d, -1)
  }
  return streak
}

export function weeklyTarget(habit: Habit): number | null {
  if (habit.schedule.type === 'weekly') return habit.schedule.times
  return null
}

function breachedTwoCalendarDays(habit: Habit, refToday: string): boolean {
  const yesterday = addDays(refToday, -1)
  const dayBefore = addDays(refToday, -2)

  if (daysBetweenInclusive(habit.createdAt, yesterday) < 0) return false
  if (daysBetweenInclusive(habit.createdAt, dayBefore) < 0) return false

  return countsAsMissDay(habit, yesterday) && countsAsMissDay(habit, dayBefore)
}

export function applyMissStreakPenalties(
  habits: Habit[],
  refToday: string = todayLocal(),
): { habits: Habit[]; events: PenaltyEvent[] } {
  const events: PenaltyEvent[] = []

  const nextHabits = habits.map((h) => {
    if (h.penaltyLock) return h
    if (!breachedTwoCalendarDays(h, refToday)) return h

    const streakLost =
      h.schedule.type === 'weekly'
        ? completionsInWeek(h, addDays(refToday, -1))
        : currentStreak(h, addDays(refToday, -1))

    const lost = XP_PENALTY_BASE
    events.push({
      habitId: h.id,
      habitName: h.name,
      xpLost: lost,
      forfeit: h.customForfeit,
      streakLost,
    })

    return {
      ...h,
      exp: Math.max(0, h.exp - lost),
      penaltyLock: true,
      shameActive: true,
      lastStreakBeforeShame: streakLost,
    }
  })

  return { habits: nextHabits, events }
}

export function setCompletion(habit: Habit, date: string, journal: string, xpDelta: number): Habit | null {
  if (!isValidJournal(journal)) return null

  const trimmed = journal.trim()
  const had = hasValidLog(habit, date)
  const next = { ...habit.completions, [date]: trimmed }

  return {
    ...habit,
    completions: next,
    exp: had ? habit.exp : habit.exp + xpDelta,
    penaltyLock: false,
    shameActive: false,
    lastStreakBeforeShame: 0,
  }
}

export function removeCompletion(habit: Habit, date: string, xpDelta: number): Habit {
  const next = { ...habit.completions }
  const had = hasValidLog(habit, date)
  delete next[date]
  return {
    ...habit,
    completions: next,
    exp: had ? Math.max(0, habit.exp - xpDelta) : habit.exp,
  }
}
