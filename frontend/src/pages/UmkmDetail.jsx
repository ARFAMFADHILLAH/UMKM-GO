import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Check,
  Globe,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
} from 'lucide-react'
import { InstagramIcon } from '../components/ui/BrandIcons'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import UmkmMap from '../components/map/UmkmMap'
import { getUmkm } from '../lib/api'
import { categoryColor, formatDate, formatPhoneWhatsApp, instagramLink, makeWhatsAppLink } from '../lib/format'

export default function UmkmDetail() {
  const { slug } = useParams()
  const [state, setState] = useState({ loading: true, error: null, umkm: null })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setState({ loading: true, error: null, umkm: null })
    getUmkm(slug)
      .then((res) => setState({ loading: false, umkm: res.data }))
      .catch((err) => {
        const body = err?.response?.data
        setState({ loading: false, error: body?.message || 'Gagal memuat data', umkm: null })
      })
  }, [slug])

  const { loading, error, umkm } = state

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: umkm.name, text: umkm.description, url: window.location.href })
        return
      } catch {
        // user batal share — lanjut fallback copy
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard tidak tersedia — abaikan
    }
  }

  if (loading) return <Spinner className="min-h-[50vh]" />
  if (error || !umkm)
    return (
      <div className="container-site py-16">
        <EmptyState
          title="Lapak tidak ditemukan"
          description={error || 'Data sedang tidak tersedia. Coba kembali lagi.'}
          action={
            <Link to="/explore" className="btn btn-outline px-4 py-2 text-xs sm:text-sm">
              Kembali ke direktori
            </Link>
          }
        />
      </div>
    )

  const catColor = categoryColor(umkm.category?.name)
  const wa = makeWhatsAppLink(
    umkm.phone_whatsapp,
    umkm.name,
    `Halo ${umkm.name}, saya melihat lapak Anda di UMKM-Go.`,
  )
  const ig = instagramLink(umkm.instagram)
  const hasCoords = umkm.latitude != null && umkm.longitude != null

  return (
    <div className="pb-24">
      {/* COVER HERO */}
      <div className="relative h-56 shrink-0 overflow-hidden sm:h-72">
        {umkm.image_cover ? (
          <img src={umkm.image_cover} alt={`Foto sampul ${umkm.name}`} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center" style={{ backgroundColor: `${catColor}20` }}>
            <span className="font-display text-6xl font-black" style={{ color: `${catColor}55` }}>
              {(umkm.name ?? '?').slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/20 to-transparent" />

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Bagikan halaman ini"
            className="flex size-9 items-center justify-center rounded-full border border-ink-900/10 bg-white/95 text-ink-700 shadow-sm backdrop-blur hover:bg-white"
          >
            {copied ? <Check className="size-4 text-wa-600" /> : <Share2 className="size-4" />}
          </button>
          <Link
            to="/explore"
            aria-label="Kembali ke direktori"
            className="flex size-9 items-center justify-center rounded-full border border-ink-900/10 bg-white/95 text-ink-700 shadow-sm backdrop-blur hover:bg-white"
          >
            ✕
          </Link>
        </div>

        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="category-badge text-white" style={{ backgroundColor: catColor }}>
              {umkm.category?.name}
            </span>
            {umkm.is_verified && (
              <span className="inline-flex items-center gap-1.5 border-b border-dashed border-white/50 pb-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
                TERVERIFIKASI
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
            {umkm.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-cream-100/80">
            <MapPin className="size-3 text-accent-400" />
            <span>
              {umkm.city}, {umkm.province}
            </span>
          </div>
        </div>
      </div>

      {/* KONTEN */}
      <div className="container-site space-y-6 pt-6">
        {/* Quick stats — data nyata dari API */}
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-ink-900/5 bg-cream-50 p-4">
          <div>
            <div className="mb-1 flex items-center gap-1">
              <MapPin className="size-3.5 text-cabai-500" />
              <span className="label-caption">Alamat</span>
            </div>
            <div className="text-[13px] font-semibold leading-snug text-ink-900">{umkm.address || '—'}</div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1">
              <MessageCircle className="size-3.5 text-wa-600" />
              <span className="label-caption">WhatsApp</span>
            </div>
            <div className="font-mono text-sm font-bold tabular-nums leading-none text-ink-900">
              {formatPhoneWhatsApp(umkm.phone_whatsapp)}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1">
              <Share2 className="size-3.5 text-accent-500" />
              <span className="label-caption">Bergabung</span>
            </div>
            <div className="font-mono text-sm font-bold leading-none text-ink-900">
              {formatDate(umkm.created_at)}
            </div>
          </div>
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{umkm.description}</p>

        {/* MAP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">Titik lokasi kios</h3>
            {hasCoords && (
              <Link to="/peta" className="flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-brand-500">
                Lihat di peta penuh →
              </Link>
            )}
          </div>
          {hasCoords ? (
            <>
              <div className="h-48 overflow-hidden rounded-2xl border border-ink-900/10">
                <UmkmMap
                  items={[{ ...umkm, latitude: Number(umkm.latitude), longitude: Number(umkm.longitude) }]}
                  selectedUmkm={{ ...umkm, latitude: Number(umkm.latitude), longitude: Number(umkm.longitude) }}
                  center={[Number(umkm.latitude), Number(umkm.longitude)]}
                  zoom={15}
                  className="h-full w-full !rounded-none !border-0"
                />
              </div>
              <div className="flex items-start gap-2 pt-1 text-[12px] text-ink-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-500" />
                <span className="flex-1">{umkm.address}</span>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-ink-900/15 bg-white/60 p-5 text-sm text-ink-500">
              Lokasi kios belum tersedia. Pemilik belum mencantumkan koordinat di peta.
            </div>
          )}

          {(ig || umkm.website_url) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {ig && (
                <a href={ig} target="_blank" rel="noopener noreferrer" className="btn btn-outline !py-2 !text-xs">
                  <InstagramIcon className="size-3.5" /> Instagram
                </a>
              )}
              {umkm.website_url && (
                <a href={umkm.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline !py-2 !text-xs">
                  <Globe className="size-3.5" /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER STICKY — Petunjuk arah + WhatsApp */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/5 bg-white p-4 shadow-[0_-10px_30px_-12px_rgba(21,25,20,0.15)] sm:p-5">
        <div className="container-site flex items-center gap-2.5 !px-0 sm:!px-8 lg:!px-8 max-w-none">
          {hasCoords ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${Number(umkm.latitude)},${Number(umkm.longitude)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline rounded-xl !px-4 !py-3 !text-sm font-semibold"
            >
              <Navigation className="size-4 text-accent-500" />
              <span className="hidden sm:inline">Petunjuk</span>
              <span className="sm:hidden">Arah</span>
            </a>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${umkm.address ?? ''}, ${umkm.city ?? ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline rounded-xl !px-4 !py-3 !text-sm font-semibold"
            >
              <Navigation className="size-4 text-accent-500" />
              <span className="hidden sm:inline">Petunjuk</span>
              <span className="sm:hidden">Arah</span>
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa flex-1 justify-center rounded-xl !py-3 !text-sm font-bold">
              <MessageCircle className="size-4" />
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

