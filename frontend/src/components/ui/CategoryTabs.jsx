import { Crosshair } from 'lucide-react'

function Tab({ active, color, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-caption font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 ${
        active
          ? 'border-transparent text-white shadow-[0_3px_10px_-3px_rgba(16,12,42,0.35)]'
          : 'border-ink-900/10 bg-white text-ink-600 hover:border-ink-900/25 hover:text-ink-900'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      <span
        aria-hidden
        className={`size-2 shrink-0 rounded-full ${active ? 'ring-2 ring-white/30' : ''}`}
        style={{ backgroundColor: active ? '#ffffff' : color }}
      />
      {label}
      {count != null && (
        <span
          className={`rounded px-1 py-px text-[10px] font-bold tabular-nums ${
            active ? 'bg-white/25' : 'bg-cream-100 text-ink-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/**
 * Tab bar kategori chip berwarna dengan scroll horizontal + fade tepi kanan.
 * categories: [{ id, label, color, count }]
 * actions: node tambahan di ujung bar (mis. tombol lokasi)
 */
export default function CategoryTabs({
  categories,
  activeId,
  allLabel = 'Semua',
  allCount,
  allColor = '#100C2A',
  onSelect,
  actions = null,
}) {
  return (
    <div className="relative min-w-0">
      <nav className={`scrollbar-none flex items-center gap-1.5 overflow-x-auto py-0.5 pr-6 ${actions ? '' : ''}`}>
        <Tab active={activeId === '' || activeId == null} color={allColor} label={allLabel} count={allCount} onClick={() => onSelect('')} />
        {categories.map((cat) => (
          <Tab
            key={String(cat.id)}
            active={String(activeId) === String(cat.id)}
            color={cat.color}
            label={cat.label}
            count={cat.count}
            onClick={() => onSelect(String(cat.id))}
          />
        ))}
        {actions}
      </nav>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent"
      />
    </div>
  )
}

export function LocateButton({ loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Lokasi saya"
      aria-label="Lokasi saya"
      className={`shrink-0 cursor-pointer rounded-lg border p-[7px] transition-all focus-visible:outline-2 focus-visible:outline-offset-1 ${
        loading ? 'border-map-500/50 bg-map-500/[0.08]' : 'border-ink-900/10 bg-white hover:border-ink-900/25'
      }`}
    >
      <Crosshair className={`size-4 ${loading ? 'animate-spin text-map-600' : 'text-map-600'}`} />
    </button>
  )
}