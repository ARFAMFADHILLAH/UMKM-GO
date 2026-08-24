import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * Dropdown kustom dengan daftar opsi yang bisa distyle penuh
 * (native <select> tidak mendukung styling menu terbukanya).
 *
 * options: [{ value, label }]
 */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Pilih',
  disabled = false,
  className = '',
  buttonClassName = '',
  listClassName = '',
  error = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => String(o.value) === String(value))
  const hasValue = selected != null

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${buttonClassName}`}
      >
        <span className={`truncate ${hasValue ? '' : 'text-ink-400'}`}>
          {hasValue ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-ink-700' : 'text-ink-400'}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`custom-scroll absolute z-50 mt-1.5 max-h-64 w-full min-w-[10rem] overflow-y-auto rounded-xl border border-ink-900/10 bg-white p-1 shadow-[0_12px_40px_-12px_rgba(16,12,42,0.25)] ${listClassName}`}
        >
          {options.map((o) => {
            const isActive = String(o.value) === String(value)
            return (
              <li key={String(o.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isActive ? 'bg-brand-500/[0.06] font-bold text-ink-900' : 'text-ink-700 hover:bg-cream-100'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isActive && <Check className="size-3.5 shrink-0 text-wa-600" />}
                </button>
              </li>
            )
          })}
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-ink-400">Tidak ada opsi</li>
          )}
        </ul>
      )}

      {error && !open && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}