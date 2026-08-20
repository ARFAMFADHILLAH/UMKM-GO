import { ChevronDown } from 'lucide-react'

export default function Select({ children, className = '', ...props }) {
  return (
    <span className="relative block">
      <select className={`field appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </span>
  )
}