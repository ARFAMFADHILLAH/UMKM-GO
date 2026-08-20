export default function SectionHeading({ kicker, title, description, className = '' }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {kicker && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{kicker}</p>
      )}
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{description}</p>}
    </div>
  )
}