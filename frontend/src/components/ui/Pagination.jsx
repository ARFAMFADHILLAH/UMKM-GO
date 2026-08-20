import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ current, last, onPage }) {
  if (!last || last <= 1) return null

  const pages = []
  const start = Math.max(1, Math.min(current - 2, last - 4))
  const end = Math.min(last, start + 4)
  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Paginasi">
      <button
        type="button"
        disabled={current <= 1}
        onClick={() => onPage(current - 1)}
        className="btn btn-outline size-9 p-0 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="size-4" />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPage(1)} className="btn size-9 p-0 text-sm text-ink-500 hover:text-brand-700">
            1
          </button>
          {start > 2 && <span className="px-1 text-sm text-ink-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === current ? 'page' : undefined}
          className={`btn size-9 p-0 text-sm ${
            p === current ? 'btn-primary' : 'text-ink-500 hover:text-brand-700'
          }`}
        >
          {p}
        </button>
      ))}

      {end < last && (
        <>
          {end < last - 1 && <span className="px-1 text-sm text-ink-400">…</span>}
          <button type="button" onClick={() => onPage(last)} className="btn size-9 p-0 text-sm text-ink-500 hover:text-brand-700">
            {last}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={current >= last}
        onClick={() => onPage(current + 1)}
        className="btn btn-outline size-9 p-0 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}