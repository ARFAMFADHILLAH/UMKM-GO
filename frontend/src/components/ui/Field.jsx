import { AlertCircle } from 'lucide-react'

export default function Field({ label, error, required, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="label-caption">
          {label} {required && <span className="text-cabai-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </span>
      )}
    </label>
  )
}
