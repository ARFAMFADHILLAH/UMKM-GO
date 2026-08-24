import { Link } from 'react-router-dom'

export default function Logo({ dark = false, className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 place-items-center rounded-xl bg-accent-400 text-brand-600 shadow-[0_2px_8px_rgba(255,195,0,0.4)] transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" fill="none" className="size-5">
          <path
            d="M12 3c3.8 0 6.9 3.1 6.9 6.9 0 4.3-5.2 9.9-6.4 11a.6.6 0 0 1-.9 0c-1.3-1.1-6.5-6.7-6.5-11A6.9 6.9 0 0 1 12 3Z"
            fill="currentColor"
          />
          <circle cx="12" cy="9.9" r="2.2" fill="#FFC300" />
        </svg>
      </span>
      <span
        className={`font-display text-xl font-semibold tracking-tight ${
          dark ? 'text-white' : 'text-ink-900'
        }`}
      >
        UKM<span className="text-brand-600">VERSE</span>
      </span>
    </Link>
  )
}