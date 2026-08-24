import { Star } from 'lucide-react'

/**
 * Baris 5 bintang. Mode:
 * - display (default): menampilkan nilai rata-rata / milik user, tidak interaktif
 * - interactive: hover + klik untuk memberi nilai
 */
export default function Stars({
  value = 0,
  size = 'size-4',
  interactive = false,
  hovered = 0,
  onHover = () => {},
  onSelect = () => {},
  disabled = false,
}) {
  const shown = interactive && hovered > 0 ? hovered : value
  return (
    <div
      className={`flex items-center gap-0.5 ${interactive ? '' : ''}`}
      onMouseLeave={interactive ? () => onHover(0) : undefined}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Beri penilaian bintang' : `Nilai ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(shown)
        const star = (
          <Star
            className={`${size} transition-all duration-100 ${
              filled ? 'fill-accent-400 text-accent-400' : 'fill-transparent text-ink-300'
            }`}
          />
        )
        if (!interactive) return <span key={n}>{star}</span>
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} bintang`}
            disabled={disabled}
            onMouseEnter={() => !disabled && onHover(n)}
            onClick={() => !disabled && onSelect(n)}
            className={`cursor-pointer rounded p-0.5 transition-transform ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'
            } focus-visible:outline-2 focus-visible:outline-offset-1`}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}