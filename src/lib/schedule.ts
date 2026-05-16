import type { Habit, HabitSchedule } from '../types'
import { hasValidLog } from './journal'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function dayOfWeek(iso: string): number {
  return new Date(iso + 'T12:00:00').getDay()
}

export function isDueOnSchedule(schedule: HabitSchedule, iso: string): boolean {
  const dow = dayOfWeek(iso)
  switch (schedule.type) {
    case 'daily':
      return true
    case 'weekdays':
      return dow >= 1 && dow <= 5
    case 'weekends':
      return dow === 0 || dow === 6
    case 'days':
      return schedule.days.includes(dow)
    case 'weekly':
      return false
    default:
      return true
  }
}

/** Day counts as a miss toward the 2-day penalty (user's rules). */
export function countsAsMissDay(habit: Habit, iso: string): boolean {
  if (habit.schedule.type === 'weekly') {
    return !hasValidLog(habit, iso)
  }
  return isDueOnSchedule(habit.schedule, iso) && !hasValidLog(habit, iso)
}

export function scheduleLabel(schedule: HabitSchedule): string {
  switch (schedule.type) {
    case 'daily':
      return 'Every day'
    case 'weekdays':
      return 'Weekdays'
    case 'weekends':
      return 'Weekends'
    case 'days':
      return schedule.days.map((d) => DAY_NAMES[d]).join(', ')
    case 'weekly':
      return `${schedule.times}× per week`
    default:
      return 'Every day'
  }
}

export function weekStart(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function completionsInWeek(habit: Habit, anyDayInWeek: string): number {
  const start = weekStart(anyDayInWeek)
  let count = 0
  for (let i = 0; i < 7; i++) {
    const iso = addDaysLocal(start, i)
    if (hasValidLog(habit, iso)) count++
  }
  return count
}

function addDaysLocal(iso: string, delta: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const SCHEDULE_PRESETS: { label: string; schedule: HabitSchedule }[] = [
  { label: 'Every day', schedule: { type: 'daily' } },
  { label: 'Weekdays', schedule: { type: 'weekdays' } },
  { label: 'Weekends', schedule: { type: 'weekends' } },
  { label: '3× per week', schedule: { type: 'weekly', times: 3 } },
  { label: '5× per week', schedule: { type: 'weekly', times: 5 } },
]
