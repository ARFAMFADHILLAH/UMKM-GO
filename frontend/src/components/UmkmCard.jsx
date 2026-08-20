import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin, MessageCircle, Store } from 'lucide-react'
import { categoryColor, waLink } from '../lib/format'

export default function UmkmCard({ umkm }) {
  const wa = waLink(umkm.phone_whatsapp)
  const placeholder = (
    <div className={`absolute inset-0 grid place-items-center ${categoryColor(umkm.category?.name)}`}>
      <Store className="size-12 text-white/80" />
    </div>
  )

  return (
    <article className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <Link to={`/umkms/${umkm.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream-100">
        {umkm.image_cover ? (
          <img
            src={umkm.image_cover}
            alt={umkm.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          placeholder
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink-900 shadow-sm backdrop-blur">
          {umkm.category?.name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/umkms/${umkm.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 transition group-hover:text-brand-700">
            {umkm.name}
          </h3>
        </Link>
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-ink-500">
          <MapPin className="size-3.5 shrink-0 text-brand-500" />
          {umkm.city}, {umkm.province}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-500">
          {umkm.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-900/8 pt-3.5">
          <Link
            to={`/umkms/${umkm.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Lihat detail <ArrowUpRight className="size-4" />
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              aria-label={`Chat WhatsApp ${umkm.name}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-wa-50 px-3 py-1.5 text-xs font-bold text-wa-700 transition hover:bg-wa-100"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  )
}