import { SearchX } from 'lucide-react'

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink-900/15 bg-white/50 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-600">
        <SearchX className="size-7" />
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
        {description && <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}