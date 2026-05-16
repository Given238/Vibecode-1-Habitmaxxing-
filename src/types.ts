export type HabitSchedule =
  | { type: 'daily' }
  | { type: 'weekdays' }
  | { type: 'weekends' }
  | { type: 'days'; days: number[] }
  | { type: 'weekly'; times: number }

export type Habit = {
  id: string
  name: string
  createdAt: string
  schedule: HabitSchedule
  /** What you owe yourself when you choke (displayed loudly). */
  customForfeit: string
  /** ISO date → journal entry (2–4 sentences required for a valid log). */
  completions: Record<string, string>
  exp: number
  penaltyLock: boolean
  shameActive: boolean
  /** Streak count right before the last penalty (for public humiliation). */
  lastStreakBeforeShame: number
}

export type AppState = {
  habits: Habit[]
  lastPenaltyEvalDate: string | null
}

export type PenaltyEvent = {
  habitId: string
  habitName: string
  xpLost: number
  forfeit: string
  streakLost: number
}
