type Props = {
  open: boolean
  onClick: () => void
  className?: string
}

export function HamburgerButton({ open, onClick, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Open menu'}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-[var(--color-surface)] text-ink transition hover:bg-line/50 ${className}`}
    >
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      <span className="flex w-5 flex-col items-center justify-center gap-1.5">
        <span
          className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            open ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            open ? 'scale-x-0 opacity-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            open ? '-translate-y-2 -rotate-45' : ''
          }`}
        />
      </span>
    </button>
  )
}
