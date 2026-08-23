import { Store } from 'lucide-react'

export default function EmptyState({
  title = 'Lapak tidak ditemukan',
  description = 'Coba ubah kata kunci pencarian, ganti filter kategori, atau perluas jangkauan kota.',
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-cream-300 bg-white/70 p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-cream-200 bg-cream-100 text-ink-500">
        {icon || <Store className="size-7 text-ink-400" strokeWidth={1.8} />}
      </div>

      <h3 className="font-display mb-2 text-lg font-bold text-ink-900">{title}</h3>

      <p className="mb-6 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>

      {action}
    </div>
  )
}
