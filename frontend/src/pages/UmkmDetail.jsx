import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  MapPin,
  MessageCircle,
  Share2,
  Store,
} from 'lucide-react'
import { InstagramIcon } from '../components/ui/BrandIcons'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import UmkmMap, { LocateButton } from '../components/map/UmkmMap'
import CategoryIcon from '../components/ui/CategoryIcon'
import { getUmkm } from '../lib/api'
import { categoryColor, formatDate, instagramLink, waLink } from '../lib/format'

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

  const copyLink = async () => {
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
          title="UMKM tidak ditemukan"
          description={error || 'Data sedang tidak tersedia. Coba kembali lagi.'}
          action={
            <Link to="/explore" className="btn btn-outline px-4 py-2 text-sm">
              Kembali ke katalog
            </Link>
          }
        />
      </div>
    )

  const wa = waLink(umkm.phone_whatsapp)
  const ig = instagramLink(umkm.instagram)
  const hasCoords = umkm.latitude != null && umkm.longitude != null
  const mapPins = useMemo(
    () =>
      hasCoords
        ? [
            {
              ...umkm,
              latitude: Number(umkm.latitude),
              longitude: Number(umkm.longitude),
            },
          ]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [umkm?.id, hasCoords],
  )

  const infoItems = [
    { label: 'Alamat', value: umkm.address },
    { label: 'Provinsi', value: umkm.province },
    { label: 'Kota / Kabupaten', value: umkm.city },
    { label: 'Nomor WhatsApp', value: umkm.phone_whatsapp },
    { label: 'Bergabung', value: formatDate(umkm.created_at) },
  ]

  return (
    <div className="animate-fade-in">
      <div className="container-site py-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-ink-400">
          <Link to="/" className="hover:text-brand-700">Beranda</Link>
          <span aria-hidden>/</span>
          <Link to="/explore" className="hover:text-brand-700">Jelajahi</Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink-700">{umkm.name}</span>
        </nav>

        {/* HERO IMAGE */}
        <div className="relative mt-5 overflow-hidden rounded-3xl bg-cream-100">
          {umkm.image_cover ? (
            <img
              src={umkm.image_cover}
              alt={umkm.name}
              className="h-64 w-full object-cover sm:h-80 lg:h-[26rem]"
            />
          ) : (
            <div className={`grid h-64 w-full place-items-center sm:h-80 lg:h-[26rem] ${categoryColor(umkm.category?.name)}`}>
              <Store className="size-24 text-white/80" strokeWidth={1.1} />
            </div>
          )}
          <div className="absolute inset-0 bg-ink-900/30" />
          <Link
            to="/explore"
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* KONTEN UTAMA */}
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <CategoryIcon name={umkm.category?.name} size="size-6" className="size-12" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {umkm.category?.name}
                    </span>
                  </div>
                  <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                    {umkm.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-none text-[15px] leading-relaxed text-ink-700">
              <p className="whitespace-pre-line">{umkm.description}</p>
            </div>

            <h2 className="mt-10 font-display text-xl font-semibold text-ink-900">Informasi &amp; lokasi</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-ink-900/10 bg-white p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink-900">{item.value}</dd>
                </div>
              ))}
            </dl>

            {hasCoords ? (
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                    <MapPin className="size-4 text-brand-600" /> Lokasi di peta
                  </p>
                  <LocateButton />
                </div>
                <div className="mt-3">
                  <UmkmMap
                    center={[Number(umkm.latitude), Number(umkm.longitude)]}
                    zoom={14}
                    pins={mapPins}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white/60 p-5 text-sm text-ink-500">
                Lokasi peta belum tersedia untuk UMKM ini. Pemilik belum mencantumkan koordinat.
              </div>
            )}
          </div>

          {/* SIDEBAR ACTION */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink-500">
                <MapPin className="size-4 text-brand-600" />
                {umkm.city}, {umkm.province}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className="btn btn-wa w-full py-3 text-sm">
                    <MessageCircle className="size-4" /> Chat WhatsApp
                  </a>
                )}
                {ig && (
                  <a href={ig} target="_blank" rel="noreferrer" className="btn btn-outline w-full py-3 text-sm">
                    <InstagramIcon className="size-4" /> Instagram
                  </a>
                )}
                {umkm.website_url && (
                  <a href={umkm.website_url} target="_blank" rel="noreferrer" className="btn btn-outline w-full py-3 text-sm">
                    <Globe className="size-4" /> Website
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-ink-900/8 pt-5">
                <button type="button" onClick={copyLink} className="btn btn-ghost w-full py-2.5 text-sm">
                  {copied ? <Check className="size-4 text-wa-600" /> : <Copy className="size-4" />}
                  {copied ? 'Tersalin!' : 'Salin tautan'}
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                <Share2 className="size-4 shrink-0" />
                Bagikan halaman ini agar makin banyak orang tahu usaha lokal terbaik.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}