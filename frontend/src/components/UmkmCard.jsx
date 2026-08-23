import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, MessageCircle, ShieldCheck, Store } from 'lucide-react'
import { categoryColor, formatPhoneWhatsApp, makeWhatsAppLink } from '../lib/format'

export default function UmkmCard({ umkm, compact = false }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const catColor = categoryColor(umkm.category?.name)
  const wa = makeWhatsAppLink(
    umkm.phone_whatsapp,
    umkm.name,
    `Halo ${umkm.name}, saya melihat profil lapak Anda di UMKM-Go (${window.location.origin}). Boleh tanya informasi produk & pemesanan?`,
  )

  const handleCardClick = () => navigate(`/umkms/${umkm.slug}`)
  const handleWaClick = (e) => {
    e.stopPropagation()
    window.open(wa, '_blank', 'noopener,noreferrer')
  }

  return (
    <article onClick={handleCardClick} className="card group flex cursor-pointer flex-col justify-between bg-white">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-cream-100">
        {!imgError && umkm.image_cover ? (
          <img
            src={umkm.image_cover}
            alt={`Foto sampul ${umkm.name}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center gap-2"
            style={{ backgroundColor: `${catColor}14` }}
          >
            <div
              className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ backgroundColor: catColor }}
            >
              <Store className="size-6" />
            </div>
            <span className="font-mono text-[11px] font-bold tracking-wider" style={{ color: catColor }}>
              {(umkm.category?.name ?? '').toUpperCase()}
            </span>
          </div>
        )}

        {/* Badge kategori kiri-atas (aturan wajib) */}
        <div className="absolute left-3 top-3 z-10">
          <span className="category-badge text-white" style={{ backgroundColor: catColor }}>
            {umkm.category?.name}
          </span>
        </div>

        {/* Scrim gradien bawah — teks di atasnya, tidak pernah langsung di foto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-white shadow-sm">
            <span aria-hidden className="size-1.5 bg-wa-500" />
            {(umkm.city ?? '').toUpperCase()}
          </span>

          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-wide text-white">
            <MapPin className="size-3 text-accent-400" />
            {(umkm.province ?? '').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col justify-between ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            {umkm.is_verified ? (
              <span className="stamp-verified !py-0 !text-[9px]">
                <ShieldCheck className="size-3" />
                Terverifikasi
              </span>
            ) : (
              <span className="font-mono text-[10px] text-ink-400">Lapak Terdaftar</span>
            )}
          </div>

          <h3 className="font-display line-clamp-1 text-[15px] font-extrabold leading-tight text-ink-900 transition-colors group-hover:text-brand-500 sm:text-base">
            {umkm.name}
          </h3>

          <div className="mb-2.5 mt-1 flex items-center gap-1 text-[11px] text-ink-500">
            <MapPin className="size-3 shrink-0 text-ink-400" />
            <span className="truncate">{umkm.city}</span>
            <span aria-hidden className="divider-dot" />
            <span className="truncate">{umkm.province}</span>
          </div>

          {!compact && (
            <p className="mb-3 line-clamp-2 text-[12.5px] leading-relaxed text-ink-700">{umkm.description}</p>
          )}
        </div>

        {/* Footer dengan aksi WhatsApp (wajib kanan-bawah) */}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink-900/5 pt-3">
          <div className="min-w-0">
            <span className="label-caption !mb-0 block">Nomor WhatsApp</span>
            <span className="mt-0.5 block truncate font-mono text-[13px] font-bold leading-tight text-ink-900 tabular-nums">
              {formatPhoneWhatsApp(umkm.phone_whatsapp)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleWaClick}
            title="Hubungi via WhatsApp"
            className="btn btn-wa h-9 rounded-lg !px-3.5 !py-2 !text-[12px]"
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>
      </div>
    </article>
  )
}
