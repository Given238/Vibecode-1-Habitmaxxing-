import type { PenaltyEvent } from '../types'

const ROASTS = [
  'Your habits called. They want a new owner.',
  'Two days. TWO. Your goldfish is disappointed.',
  'Consistency? Never met her.',
  'The streak didn’t die — you murdered it.',
  'Achievement unlocked: Professional Procrastinator.',
  'Somewhere, a motivational poster is crying.',
  'You had ONE job. Well, one habit. Still blew it.',
]

export function pickRoast(): string {
  return ROASTS[Math.floor(Math.random() * ROASTS.length)]
}

export function formatPenaltySummary(events: PenaltyEvent[]): string {
  return events.map((e) => `${e.habitName} (−${e.xpLost} XP)`).join(' · ')
}
