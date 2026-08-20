export default function Spinner({ label = 'Memuat…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-ink-500 ${className}`}>
      <span className="size-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  )
}