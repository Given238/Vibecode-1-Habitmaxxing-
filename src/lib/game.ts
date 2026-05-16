/** Linear levels: level = 1 + floor(totalExp / XP_PER_LEVEL). */
export const XP_PER_LEVEL = 100
export const XP_PER_COMPLETION = 18
export const XP_PENALTY_BASE = 35

export function levelFromTotalExp(totalExp: number): number {
  return 1 + Math.floor(Math.max(0, totalExp) / XP_PER_LEVEL)
}

export function expProgress(totalExp: number): { inLevel: number; toNext: number } {
  const safe = Math.max(0, totalExp)
  const inLevel = safe % XP_PER_LEVEL
  return { inLevel, toNext: XP_PER_LEVEL }
}
