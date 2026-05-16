import type { Habit } from '../types'
import { daysBetweenInclusive, parseLocalDate, toLocalDateString } from './dates'
import { hasValidLog } from './journal'
import { completionsInWeek, isDueOnSchedule, weekStart } from './schedule'
import { levelFromTotalExp, XP_PER_COMPLETION } from './game'

export type MonthStats = {
  year: number
  month: number
  label: string
  logs: number
  dueDays: number
  dueCompleted: number
  weeklyTarget: number | null
  xpEarnedEstimate: number
  level: number
  exp: number
}

export function eachDayInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(toLocalDateString(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function currentMonthKey(): string {
  const now = new Date()
  return monthKey(now.getFullYear(), now.getMonth())
}

export function shiftMonthKey(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month + delta, 1)
  return monthKey(d.getFullYear(), d.getMonth())
}

export function statsForMonth(habit: Habit, year: number, month: number): MonthStats {
  const days = eachDayInMonth(year, month)
  let logs = 0
  let dueDays = 0
  let dueCompleted = 0

  for (const iso of days) {
    if (daysBetweenInclusive(habit.createdAt, iso) < 0) continue
    if (hasValidLog(habit, iso)) logs++
    if (habit.schedule.type === 'weekly') continue
    if (isDueOnSchedule(habit.schedule, iso)) {
      dueDays++
      if (hasValidLog(habit, iso)) dueCompleted++
    }
  }

  const weeklyTarget = habit.schedule.type === 'weekly' ? habit.schedule.times : null
  let xpEarnedEstimate = logs * XP_PER_COMPLETION

  if (weeklyTarget) {
    const weeks = new Set<string>()
    for (const iso of days) {
      if (daysBetweenInclusive(habit.createdAt, iso) >= 0) weeks.add(weekStart(iso))
    }
    let weekHits = 0
    for (const w of weeks) {
      if (completionsInWeek(habit, w) >= weeklyTarget) weekHits++
    }
    dueDays = weeks.size
    dueCompleted = weekHits
    xpEarnedEstimate = logs * XP_PER_COMPLETION
  }

  return {
    year,
    month,
    label: monthLabel(year, month),
    logs,
    dueDays,
    dueCompleted,
    weeklyTarget,
    xpEarnedEstimate,
    level: levelFromTotalExp(habit.exp),
    exp: habit.exp,
  }
}

export function allJournalEntries(habit: Habit): { date: string; text: string }[] {
  return Object.entries(habit.completions)
    .filter(([, text]) => typeof text === 'string' && text.trim())
    .map(([date, text]) => ({ date, text: text.trim() }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function formatDisplayDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
