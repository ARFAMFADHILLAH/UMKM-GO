import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, MessageCircle, Search, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react'
import CategoryIcon from '../components/ui/CategoryIcon'
import UmkmCard from '../components/UmkmCard'
import UmkmMap from '../components/map/UmkmMap'
import Spinner from '../components/ui/Spinner'
import Dropdown from '../components/ui/Dropdown'
import { listCategories } from '../lib/api'
import { fetchAllUmkms } from '../lib/cities'
import { formatPhoneWhatsApp, makeWhatsAppLink } from '../lib/format'

export default function Home() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPreviewUmkm, setSelectedPreviewUmkm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    Promise.all([fetchAllUmkms(), listCategories()])
      .then(([umkms, cats]) => {
        setItems(umkms)
        setCategories(cats)
        setSelectedPreviewUmkm(umkms.find((u) => u.latitude != null) ?? umkms[0] ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoriesWithCount = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        count: items.filter((i) => i.category?.name === c.name).length,
      })),
    [categories, items],
  )

  const latestItems = useMemo(() => items.slice(0, 6), [items])
  const pinsWithCoords = useMemo(() => items.filter((u) => u.latitude != null), [items])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (selectedCity) params.set('city', selectedCity)
    navigate(`/explore?${params.toString()}`)
  }

  return (
    <div>
      {/* 1. HERO - ink pekat, tipografi tebal, chrome bersih */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent-400/40 to-transparent"
        />
        <div className="container-site relative pb-20 pt-10 sm:pb-28 sm:pt-14">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <span className="label-caption text-cream-100/70! inline-flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-accent-400" />
              <span className="text-accent-400">UMKM Indonesia</span>
            </span>

            <h1 className="hero-title font-display font-black leading-[1.05] tracking-tight">
              Cari lapak lokal di
              <span className="mt-1 block text-accent-400">sekitar Anda.</span>
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-cream-100/70 sm:text-base">
              Peta interaktif UMKM: kuliner, kriya, fashion, jasa, dan pertanian. Temukan UMKM
              terdekat, hubungi langsung via <span className="font-semibold text-wa-500">WhatsApp</span>,
              tanpa iklan &amp; tanpa perantara.
            </p>

            {/* Search bar besar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-6 flex max-w-2xl flex-col items-stretch gap-2 rounded-2xl bg-white p-2 text-ink-900 shadow-2xl sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-4 shrink-0 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sate klathak, batik tulis, bengkel dinamo..."
                  className="w-full bg-transparent py-2.5 text-sm placeholder:text-ink-400 focus:outline-none"
                />
              </div>
              <div aria-hidden className="my-2 hidden w-px bg-ink-900/10 sm:block" />
              <div className="flex items-center gap-1.5 px-2">
                <MapPin className="size-4 shrink-0 text-accent-500" />
                <Dropdown
                  value={selectedCity}
                  onChange={(v) => setSelectedCity(v)}
                  placeholder="Semua kota"
                  options={[
                    { value: '', label: 'Semua kota' },
                    ...[...new Set(items.map((i) => i.city).filter(Boolean))].map((c) => ({ value: c, label: c })),
                  ]}
                  buttonClassName="bg-transparent py-2.5 pr-1 text-sm font-semibold text-ink-900 hover:text-brand-500"
                  listClassName="z-30"
                />
              </div>
              <button type="submit" className="btn btn-primary rounded-xl px-6! py-3! text-sm! font-bold">
                Cari Lapak
              </button>
            </form>

            {/* Statistik live */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-3 text-caption text-cream-100/60">
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-400" />
                <strong className="text-sm font-bold text-white">{items.length}</strong> lapak terdaftar
              </span>
              <span>
                <strong className="text-sm font-bold text-white">{categoriesWithCount.length}</strong> kategori usaha
              </span>
              <span>
                <strong className="text-sm font-bold text-white">{pinsWithCoords.length}</strong> titik di peta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid kategori mengambang di atas hero */}
      <section className="container-site relative z-10 -mt-12">
        <div className="rounded-2xl border border-ink-900/5 bg-white p-4 shadow-[0_20px_60px_-20px_rgba(16,12,42,0.25)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <span className="label-caption">Jelajahi sektor</span>
              <h2 className="font-display text-lg font-bold text-ink-900">Kategori Usaha</h2>
            </div>
            <Link to="/explore" className="flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-brand-500">
              Semua lapak <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categoriesWithCount.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/explore?category_id=${cat.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-ink-900/5 p-4 text-left transition-all hover:border-ink-900/15 hover:bg-cream-50/60"
                >
                  <CategoryIcon category={cat.name} size="lg" />
                  <div className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold text-ink-900">
                      {cat.name}
                    </span>
                    <span className="text-caption text-ink-400">{cat.count} lapak</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-14" />

      {/* 3. Peta interaktif terbagi */}
      <section className="container-site">
        <div className="overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-[0_8px_30px_-12px_rgba(16,12,42,0.1)]">
          <div className="flex flex-col justify-between gap-3 border-b border-ink-900/5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <span className="label-caption mb-1.5">Peta live · {pinsWithCoords.length} kios</span>
              <h2 className="font-display text-xl font-bold text-ink-900">Sebaran kios UMKM saat ini</h2>
            </div>
            <Link to="/peta" className="btn btn-primary self-start rounded-xl px-4! py-2.5! text-xs! font-bold sm:self-auto">
              <MapPin className="size-4" />
              Buka Peta Penuh
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
            <div className="h-95 lg:col-span-2 sm:h-115">
              {loading ? (
                <Spinner label="Memuat peta…" />
              ) : (
                <UmkmMap
                  items={pinsWithCoords}
                  selectedUmkm={selectedPreviewUmkm}
                  onSelectUmkm={setSelectedPreviewUmkm}
                  zoom={11}
                  center={
                    selectedPreviewUmkm?.latitude != null
                      ? [Number(selectedPreviewUmkm.latitude), Number(selectedPreviewUmkm.longitude)]
                      : [-2.5489, 118.0149]
                  }
                  showCategoryLegend={true}
                  className="h-full w-full rounded-none! border-0!"
                />
              )}
            </div>

            <aside className="flex min-h-65 flex-col justify-between border-t border-ink-900/5 bg-cream-50/40 p-5 lg:border-l lg:border-t-0">
              {selectedPreviewUmkm ? (
                <div className="space-y-3">
                  <span className="label-caption">Kios yang dipilih</span>
                  {selectedPreviewUmkm.image_cover && (
                    <div className="aspect-video overflow-hidden rounded-xl border border-ink-900/10">
                      <img
                        src={selectedPreviewUmkm.image_cover}
                        alt={`Foto ${selectedPreviewUmkm.name}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-base font-bold leading-tight text-ink-900">
                      {selectedPreviewUmkm.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-500">
                      {selectedPreviewUmkm.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-ink-900/5 bg-white p-2.5 text-caption">
                    <span className="text-ink-500">Kota</span>
                    <span className="truncate text-right font-bold text-ink-900">
                      {selectedPreviewUmkm.city}
                    </span>
                    <span className="text-ink-500">WhatsApp</span>
                    <span className="text-right font-bold tabular-nums text-ink-900">
                      {formatPhoneWhatsApp(selectedPreviewUmkm.phone_whatsapp)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/umkms/${selectedPreviewUmkm.slug}`}
                      className="btn btn-outline flex-1 rounded-lg py-2! text-xs!"
                    >
                      Detail
                    </Link>
                    <a
                      href={makeWhatsAppLink(selectedPreviewUmkm.phone_whatsapp, selectedPreviewUmkm.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-wa rounded-lg py-2! text-xs!"
                    >
                      <MessageCircle className="size-4" />
                      Chat WA
                    </a>
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center text-xs text-ink-400">
                  Klik pin kios di peta untuk melihat detail singkat.
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <div className="h-20" />

      {/* 4. Lapak terbaru */}
      <section className="container-site space-y-6">
        <div className="flex flex-col justify-between gap-3 border-b border-ink-900/5 pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="label-caption mb-1.5 text-accent-600! inline-flex items-center gap-2">
              <Sparkles className="size-3.5 shrink-0" />
              Baru bergabung
            </span>
            <h2 className="font-display text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
              Lapak UMKM terbaru
            </h2>
          </div>
          <Link to="/explore" className="btn btn-outline self-start rounded-lg px-4! py-2! text-xs!">
            <SlidersHorizontal className="size-3.5" />
            Lihat {items.length} lapak
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestItems.map((umkm) => (
            <UmkmCard key={umkm.id} umkm={umkm} />
          ))}
        </div>
      </section>

      <div className="h-20" />

      {/* 5. CTA pemilik usaha */}
      <section className="container-site">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-ink-900 p-8 text-white shadow-[0_20px_60px_-20px_rgba(16,12,42,0.5)] sm:p-12">
          <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div>
              <span className="label-caption text-cream-100/70! mb-3 inline-flex items-center gap-2">
                <TrendingUp className="size-3 shrink-0 text-accent-400" />
                <span className="text-accent-400">Untuk pelaku usaha</span>
              </span>
              <h3 className="font-display text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                Pasang titik kios Anda. <br />
                Terima order langsung via WhatsApp.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-100/70">
                Pendaftaran 100% gratis, tanpa biaya komisi. Profil lapak tampil di peta dan
                direktori, pelanggan terdekat bisa menghubungi Anda dalam satu klik.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 md:justify-end sm:flex-row">
              <Link to="/register" className="btn btn-accent w-full rounded-xl px-6! py-3! text-sm! font-bold sm:w-auto">
                Daftarkan Lapak Sekarang
              </Link>
              <Link
                to="/dashboard"
                className="btn w-full rounded-xl border border-white/15 bg-white/10 px-5! py-3! text-sm! font-semibold text-white hover:bg-white/20 sm:w-auto"
              >
                Masuk Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
