import { expProgress, levelFromTotalExp } from '../lib/game'

export function LevelMini({ exp }: { exp: number }) {
  const level = levelFromTotalExp(exp)
  const { inLevel, toNext } = expProgress(exp)
  const pct = Math.min(100, Math.round((inLevel / toNext) * 100))

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">
        Lv {level}
      </span>
      <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted tabular-nums">
        {inLevel}/{toNext}
      </span>
    </div>
  )
}
