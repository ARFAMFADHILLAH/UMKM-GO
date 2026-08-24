import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  X,
} from 'lucide-react'
import { InstagramIcon } from '../components/ui/BrandIcons'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import UmkmMap from '../components/map/UmkmMap'
import Stars from '../components/ui/Stars'
import { getUmkm, fetchMyRating, rateUmkm, fetchComments, postComment } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  categoryColor,
  formatDate,
  formatDistance,
  formatDuration,
  formatPhoneWhatsApp,
  instagramLink,
  makeWhatsAppLink,
} from '../lib/format'

export default function UmkmDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: null, umkm: null })
  const [copied, setCopied] = useState(false)
  const [routeFrom, setRouteFrom] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [locating, setLocating] = useState(false)
  const mapSectionRef = useRef(null)

  // Rating state
  const { user } = useAuth()
  const [myRating, setMyRating] = useState(null)
  const [hoverStar, setHoverStar] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [rateMessage, setRateMessage] = useState(null)
  const [rateError, setRateError] = useState(false)

  // Komentar state
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [commentNotice, setCommentNotice] = useState(null)
  const [commentError, setCommentError] = useState(false)

  useEffect(() => {
    setState({ loading: true, error: null, umkm: null })
    setRouteFrom(null)
    setRouteInfo(null)
    getUmkm(slug)
      .then((res) => setState({ loading: false, umkm: res.data }))
      .catch((err) => {
        const body = err?.response?.data
        setState({ loading: false, error: body?.message || 'Gagal memuat data', umkm: null })
      })
  }, [slug])

  const { loading, error, umkm } = state

  // Galeri foto jualan (backend: umkm.photos - spesifikasi di catatan Obsidian)
  const photos = Array.isArray(umkm?.photos) ? umkm.photos : []
  const [lightbox, setLightbox] = useState(null)

  // Ringkasan rating dari backend (avg_rating & ratings_count - spesifikasi di catatan Obsidian)
  const avgRatingRaw = Number(umkm?.avg_rating)
  const avgRating = Number.isFinite(avgRatingRaw) && avgRatingRaw > 0 ? avgRatingRaw : null
  const ratingCount = Number(umkm?.ratings_count ?? 0)

  // Ambil nilai milik user saat sudah login (404 = endpoint belum ada ATAU memang belum menilai)
  useEffect(() => {
    if (!user || !umkm) return
    fetchMyRating(slug)
      .then((res) => {
        const val = Number(res?.data?.rating)
        if (Number.isFinite(val) && val > 0) setMyRating(val)
      })
      .catch(() => {
        // Diamkan: belum menilai, atau endpoint rating belum terpasang di backend.
        // Section tetap tampil - jangan pernah sembunyikan UI karena ini.
      })
  }, [user, umkm, slug])

  const handleRate = async (val) => {
    setSubmittingRating(true)
    setRateMessage(null)
    setRateError(false)
    try {
      await rateUmkm(slug, val)
      setMyRating(val)
      setRateMessage('Terima kasih! Penilaianmu tersimpan.')
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        navigate('/login', { state: { from: `/umkms/${slug}` } })
      } else if (status === 404 || status === 405) {
        setRateError(true)
        setRateMessage('Penilaian belum tersedia - endpoint backend belum terpasang.')
      } else {
        setRateError(true)
        setRateMessage('Gagal menyimpan penilaian.')
      }
    } finally {
      setSubmittingRating(false)
      setTimeout(() => setRateMessage(null), 4000)
    }
  }

  // Komentar: daftar publik; kalau endpoint belum ada, list tetap kosong tanpa error
  useEffect(() => {
    if (!umkm) return
    fetchComments(slug)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : res?.data?.data ?? []
        setComments(list)
        setCommentError(false)
      })
      .catch(() => setComments([]))
  }, [umkm, slug])

  const handleComment = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return
    setPostingComment(true)
    setCommentNotice(null)
    setCommentError(false)
    try {
      const res = await postComment(slug, text)
      const item = res?.data ?? { comment: text, created_at: new Date().toISOString(), name: user?.name }
      setComments((prev) => [item, ...prev])
      setCommentText('')
      setCommentNotice('Komentar terkirim.')
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        navigate('/login', { state: { from: `/umkms/${slug}` } })
      } else if (status === 404 || status === 405) {
        setCommentError(true)
        setCommentNotice('Komentar belum tersedia - endpoint backend belum terpasang.')
      } else {
        setCommentError(true)
        setCommentNotice('Gagal mengirim komentar.')
      }
    } finally {
      setPostingComment(false)
      setTimeout(() => setCommentNotice(null), 4000)
    }
  }

  // Minta lokasi presisi user lalu gambar rute di peta embed (OSRM) - tanpa keluar dari web
  const handleDirections = async () => {
    if (!hasCoords || !umkm) return false
    if (routeFrom) {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }
    if (!navigator.geolocation) return false
    setLocating(true)
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        }),
      )
      setRouteFrom([pos.coords.latitude, pos.coords.longitude])
      setRouteInfo(null)
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    } catch {
      return false
    } finally {
      setLocating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: umkm.name, text: umkm.description, url: window.location.href })
        return
      } catch {
        // user batal share - lanjut fallback copy
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard tidak tersedia - abaikan
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
    `Halo ${umkm.name}, saya melihat lapak Anda di UKMVERSE.`,
  )
  const ig = instagramLink(umkm.instagram)
  const hasCoords = umkm.latitude != null && umkm.longitude != null

  const mapsDirUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${Number(umkm.latitude)},${Number(umkm.longitude)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${umkm.address ?? ''}, ${umkm.city ?? ''}`)}`

  return (
    <div className="mx-auto max-w-480 pb-28 sm:pb-24 lg:pb-10">
      <div className="container-site pt-4 sm:pt-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* KOLOM KIRI - konten utama */}
          <div className="min-w-0 space-y-6">
            {/* COVER HERO - dalam container, sudut membulat */}
            <div className="relative h-56 shrink-0 overflow-hidden rounded-2xl border border-ink-900/10 shadow-[0_8px_30px_-12px_rgba(16,12,42,0.2)] sm:h-80">
        {umkm.image_cover ? (
          <img src={umkm.image_cover} alt={`Foto sampul ${umkm.name}`} fetchPriority="high" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center" style={{ backgroundColor: `${catColor}20` }}>
            <span className="font-display text-6xl font-black" style={{ color: `${catColor}55` }}>
              {(umkm.name ?? '?').slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink-900/95 via-ink-900/40 to-transparent" />

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
            <X className="size-4" />
          </Link>
        </div>

        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="category-badge text-white" style={{ backgroundColor: catColor }}>
              {umkm.category?.name}
            </span>
            {umkm.is_verified && (
              <span className="inline-flex items-center gap-1.5 border-b border-dashed border-white/50 pb-0.5 text-caption font-bold tracking-wider text-white">
                TERVERIFIKASI
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
            {umkm.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 text-caption text-cream-100/80">
            <MapPin className="size-3 text-accent-400" />
            <span>
              {umkm.city}, {umkm.province}
            </span>
          </div>
        </div>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{umkm.description}</p>

            {/* GALERI FOTO JUALAN */}
            {photos.length > 0 && (
              <section className="space-y-2">
                <h2 className="font-display text-base font-bold text-ink-900">Foto jualan</h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {photos.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="group relative aspect-4/3 cursor-zoom-in overflow-hidden rounded-xl border border-ink-900/10 bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-1"
                      aria-label={`Perbesar foto ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt={`Foto jualan ${umkm.name} ${i + 1}`}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.parentElement.style.visibility = 'hidden' }}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      />
                      <span className="absolute inset-0 bg-brand-500/0 transition-colors group-hover:bg-brand-500/10" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* PENILAIAN */}
            <section className="card space-y-3 rounded-2xl! p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-ink-900">Penilaian pengunjung</h2>
                    {avgRating != null ? (
                      <p className="mt-0.5 text-caption text-ink-500">
                        <strong className="font-bold text-ink-900">{avgRating.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</strong>
                        {' / 5'}
                        {ratingCount > 0 && ` · dari ${ratingCount} penilaian`}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-caption text-ink-500">Belum ada penilaian - jadilah yang pertama!</p>
                    )}
                  </div>
                  {avgRating != null && <Stars value={avgRating} size="size-5" />}
                </div>

                {user ? (
                  <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/5 pt-3">
                    <span className="text-xs font-medium text-ink-500">
                      {myRating ? 'Nilaimu (bisa diubah):' : 'Beri nilai:'}
                    </span>
                    <Stars
                      value={myRating ?? 0}
                      interactive
                      disabled={submittingRating}
                      hovered={hoverStar}
                      onHover={setHoverStar}
                      onSelect={handleRate}
                    />
                    {rateMessage && (
                      <span className={`text-caption font-semibold ${rateError ? 'text-cabai-600' : 'text-wa-600'}`}>
                        {rateMessage}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-900/5 pt-3">
                    <span className="text-xs text-ink-500">Masuk dulu untuk memberi penilaian & komentar.</span>
                    <Link
                      to="/login"
                      state={{ from: `/umkms/${slug}` }}
                      className="btn btn-outline rounded-lg py-2! text-xs! font-semibold"
                    >
                      Masuk
                    </Link>
                  </div>
                )}

                {/* KOMENTAR */}
                <div className="space-y-3 border-t border-ink-900/5 pt-4">
                  {user ? (
                    <form onSubmit={handleComment} className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={`Tulis komentar untuk ${umkm.name}...`}
                        rows={3}
                        maxLength={500}
                        className="field resize-none text-sm"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-caption tabular-nums text-ink-400">
                          {commentText.length}/500
                          {(commentNotice || commentError) && (
                            <span className={`ml-2 font-semibold ${commentError ? 'text-cabai-600' : 'text-wa-600'}`}>
                              {commentNotice}
                            </span>
                          )}
                        </span>
                        <button
                          type="submit"
                          disabled={postingComment || !commentText.trim()}
                          className="btn btn-primary rounded-lg px-4! py-2! text-xs! font-bold"
                        >
                          {postingComment ? 'Mengirim...' : 'Kirim Komentar'}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {comments.length === 0 ? (
                    <p className="text-caption text-ink-400">Belum ada komentar.</p>
                  ) : (
                    <ul className="custom-scroll max-h-96 space-y-3 overflow-y-auto pr-1">
                      {comments.map((c, i) => {
                        const name = c.name ?? c.user?.name ?? 'Pengunjung'
                        const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                        return (
                          <li key={c.id ?? `${name}-${i}`} className="flex gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500/10 text-caption font-bold text-brand-500">
                              {initials}
                            </span>
                            <div className="min-w-0 flex-1 rounded-xl bg-cream-100/70 px-3.5 py-2.5">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <span className="truncate text-xs font-bold text-ink-900">{name}</span>
                                <span className="shrink-0 text-caption text-ink-400">{formatDate(c.created_at)}</span>
                              </div>
                              <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-ink-700">{c.comment}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </section>

            {/* MAP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink-900">Titik lokasi kios</h2>
                {hasCoords && (
                  <Link to="/peta" className="flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-brand-500">
                    Lihat di peta penuh <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
              {hasCoords ? (
                <>
                  {routeInfo?.distanceM != null && (
                    <div className="flex items-center gap-2 rounded-xl border border-map-500/30 bg-map-500/8 px-3 py-2 text-xs font-semibold text-ink-900">
                      <Navigation className="size-3.5 shrink-0 text-map-600" />
                      <span className="flex-1">
                        Rute ke kios: {formatDistance(routeInfo.distanceM)} · sekitar{' '}
                        {formatDuration(routeInfo.durationS)} berkendara
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRouteFrom(null)
                          setRouteInfo(null)
                        }}
                        aria-label="Hapus rute"
                        className="cursor-pointer rounded p-0.5 text-ink-400 hover:bg-white hover:text-ink-900"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {routeInfo?.error && (
                    <p className="rounded-xl border border-accent-400/40 bg-accent-400/8 px-3 py-2 text-xs text-ink-700">
                      Rute tidak bisa dihitung dari lokasi Anda. Coba tombol Petunjuk Arah lagi
                      atau buka Google Maps.
                    </p>
                  )}
                  <div ref={mapSectionRef} className="h-48 overflow-hidden rounded-2xl border border-ink-900/10 sm:h-56">
                    <UmkmMap
                      items={[{ ...umkm, latitude: Number(umkm.latitude), longitude: Number(umkm.longitude) }]}
                      selectedUmkm={{ ...umkm, latitude: Number(umkm.latitude), longitude: Number(umkm.longitude) }}
                      center={[Number(umkm.latitude), Number(umkm.longitude)]}
                      zoom={15}
                      routeFrom={routeFrom}
                      routeTo={hasCoords ? [Number(umkm.latitude), Number(umkm.longitude)] : null}
                      onRouteInfo={setRouteInfo}
                      className="h-full w-full rounded-none! border-0!"
                    />
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-xs text-ink-700">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent-500" />
                    <span className="flex-1">{umkm.address}</span>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-ink-900/15 bg-white/60 p-5 text-sm text-ink-500">
                  Lokasi kios belum tersedia. Pemilik belum mencantumkan koordinat di peta.
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN - kartu kontak sticky */}
          <aside className="space-y-4 self-start lg:sticky lg:top-20">
            <section className="card space-y-4 rounded-2xl! p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="category-badge text-white" style={{ backgroundColor: catColor }}>
                  {umkm.category?.name}
                </span>
                {umkm.is_verified && (
                  <span className="stamp-verified py-0! text-caption!">
                    Terverifikasi
                  </span>
                )}
              </div>

              <div>
                <span className="label-caption mb-1 flex items-center gap-1.5">
                  <MessageCircle className="size-3.5 text-wa-600" />
                  Nomor WhatsApp
                </span>
                <p className="tabular-nums text-lg font-bold leading-tight text-ink-900">
                  {formatPhoneWhatsApp(umkm.phone_whatsapp)}
                </p>
              </div>

              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full justify-center rounded-xl py-3! text-sm! font-bold">
                  <MessageCircle className="size-4" />
                  Hubungi via WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={async () => {
                  if (!hasCoords) {
                    window.open(mapsDirUrl, '_blank', 'noopener,noreferrer')
                    return
                  }
                  const ok = await handleDirections()
                  // Fallback: izin lokasi ditolak / gagal - buka Google Maps
                  if (!ok) window.open(mapsDirUrl, '_blank', 'noopener,noreferrer')
                }}
                disabled={locating}
                className="btn btn-outline w-full justify-center rounded-xl py-3! text-sm! font-semibold"
              >
                <Navigation className={`size-4 ${locating ? 'animate-pulse text-map-600' : 'text-accent-500'}`} />
                {locating ? 'Mencari lokasi Anda...' : routeFrom ? 'Lihat Rute di Peta' : 'Petunjuk Arah'}
              </button>

              {(ig || umkm.website_url) && (
                <div className="grid grid-cols-2 gap-2">
                  {ig && (
                    <a href={ig} target="_blank" rel="noopener noreferrer" className="btn btn-outline justify-center py-2! text-xs!">
                      <InstagramIcon className="size-3.5" /> Instagram
                    </a>
                  )}
                  {umkm.website_url && (
                    <a href={umkm.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline justify-center py-2! text-xs!">
                      <Globe className="size-3.5" /> Website
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-2.5 border-t border-ink-900/5 pt-4">
                <div>
                  <span className="label-caption mb-0.5 block">Alamat</span>
                  <p className="text-xs font-semibold leading-snug text-ink-900">{umkm.address || '-'}</p>
                </div>
                <div>
                  <span className="label-caption mb-0.5 block">Bergabung</span>
                  <p className="tabular-nums text-xs font-semibold text-ink-900">{formatDate(umkm.created_at)}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* FOOTER STICKY - Petunjuk arah + WhatsApp (mobile/tablet saja) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/5 bg-white p-4 shadow-[0_-10px_30px_-12px_rgba(16,12,42,0.15)] sm:p-5 lg:hidden">
        <div className="container-site flex items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              if (!hasCoords) {
                window.open(mapsDirUrl, '_blank', 'noopener,noreferrer')
                return
              }
              const ok = await handleDirections()
              if (!ok) window.open(mapsDirUrl, '_blank', 'noopener,noreferrer')
            }}
            disabled={locating}
            className="btn btn-outline rounded-xl px-4! py-3! text-sm! font-semibold"
          >
            <Navigation className={`size-4 ${locating ? 'animate-pulse text-map-600' : 'text-accent-500'}`} />
            <span className="hidden sm:inline">Petunjuk</span>
            <span className="sm:hidden">Arah</span>
          </button>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa flex-1 justify-center rounded-xl py-3! text-sm! font-bold">
              <MessageCircle className="size-4" />
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </div>
      {/* LIGHTBOX GALERI */}
      {lightbox != null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto jualan diperbesar"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length) }}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length) }}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <img
            src={photos[lightbox]}
            alt={`Foto jualan ${umkm.name} ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-caption font-bold tabular-nums text-white">
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  )
}

