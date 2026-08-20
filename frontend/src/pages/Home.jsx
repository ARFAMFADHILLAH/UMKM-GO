import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MessageCircle as MessageCircleIcon, Search, Store } from 'lucide-react'
import Select from '../components/ui/Select'
import SectionHeading from '../components/ui/SectionHeading'
import UmkmCard from '../components/UmkmCard'
import CategoryIcon from '../components/ui/CategoryIcon'
import Spinner from '../components/ui/Spinner'
import { listCategories, listUmkms } from '../lib/api'
import { gatherCities } from '../lib/cities'

function DecorativeBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-40 size-[28rem] rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -right-24 top-24 size-96 rounded-full bg-amber-200/40 blur-3xl" />
      <svg className="absolute right-[12%] top-24 opacity-[0.07] text-ink-900" width="280" height="280">
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="currentColor" />
        </pattern>
        <rect width="280" height="280" fill="url(#dots)" />
      </svg>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [latest, setLatest] = useState([])
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listCategories(), listUmkms(), gatherCities()])
      .then(([cats, umkms, cityList]) => {
        setCategories(cats)
        setLatest(umkms.data ?? [])
        setTotal(umkms.total ?? umkms.data?.length ?? 0)
        setCities(cityList)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(
    () => [
      { value: total, label: 'UMKM terdaftar' },
      { value: cities.length, label: 'Kota & kabupaten' },
      { value: categories.length, label: 'Kategori usaha' },
    ],
    [total, cities, categories],
  )

  const goExplore = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (categoryFilter) params.set('category_id', categoryFilter)
    navigate(`/explore?${params.toString()}`)
  }

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-900/5">
        <DecorativeBg />
        <div className="container-site relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-600" />
              Direktori UMKM Indonesia
            </span>

            <h1
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
              style={{ animation: 'fade-up 0.6s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              Temukan &amp; dukung{' '}
              <span className="relative inline-block text-brand-600">
                usaha lokal
                <svg
                  className="absolute -bottom-2 left-0 w-full text-brand-400"
                  viewBox="0 0 120 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 9C30 3 75 3 118 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              di dekatmu.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500">
              Dari kuliner rumahan, kerajinan tangan, hingga jasa lokal — UMKM-Go merangkum
              usaha mikro, kecil, dan menengah terbaik di Indonesia dalam satu tempat.
            </p>

            <form
              onSubmit={goExplore}
              className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_2px_4px_rgba(33,26,20,0.06),0_16px_40px_-12px_rgba(33,26,20,0.18)] sm:flex-row sm:items-center sm:rounded-full"
            >
              <label className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-4 shrink-0 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kuliner, kerajinan, jasa…"
                  className="w-full bg-transparent py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400"
                />
              </label>
              <span className="hidden w-px self-stretch bg-ink-900/10 sm:block" />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border-0 bg-transparent shadow-none sm:w-44"
              >
                <option value="">Semua kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <button type="submit" className="btn btn-primary px-6 py-3 text-sm sm:rounded-full">
                Cari <ArrowRight className="size-4" />
              </button>
            </form>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl font-semibold text-ink-900">
                    {loading ? '…' : s.value}
                  </dd>
                  <dd className="mt-0.5 text-xs font-medium text-ink-400">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-md rotate-1 rounded-3xl border border-white/60 bg-white/70 p-3 shadow-[0_24px_60px_-24px_rgba(33,26,20,0.3)] backdrop-blur">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-brand-600">
                <div className="grid size-full place-items-center opacity-90">
                  <Store className="size-28 text-white/90" strokeWidth={1.2} />
                </div>
              </div>
              <div className="absolute -right-5 -top-5 grid size-14 rotate-12 place-items-center rounded-2xl bg-wa-500 text-white shadow-lg">
                <MessageCircleIcon />
              </div>
              <div className="absolute -left-4 bottom-8 -rotate-6 rounded-2xl bg-white px-4 py-3 shadow-lg">
                <p className="font-display text-sm font-semibold text-ink-900">Kripik Tempe Oemah</p>
                <p className="text-xs text-ink-400">Kota Malang · Jawa Timur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="container-site py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="Jelajahi kategori"
            title="Usaha apa yang kamu cari?"
            description="Pilih kategori di bawah untuk memulai pencarian, atau telusuri semua UMKM sekaligus."
          />
          <Link to="/explore" className="btn btn-outline px-4 py-2 text-sm">
            Semua UMKM <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/explore?category_id=${c.id}`}
                className="group card flex flex-col items-start gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                style={{ animation: `fade-up 0.5s ${i * 0.06}s cubic-bezier(0.22,1,0.36,1) both` }}
              >
                <CategoryIcon name={c.name} size="size-7" className="size-12" />
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900 group-hover:text-brand-700">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
                    Jelajahi →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* UMKM TERBARU */}
      <section className="border-y border-ink-900/5 bg-white/60 py-16 sm:py-20">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Baru masuk"
              title="UMKM terbaru"
              description="Usaha yang baru saja bergabung dan siap untuk ditemukan."
            />
            <Link to="/explore" className="btn btn-ghost px-4 py-2 text-sm">
              Lihat semua <ArrowRight className="size-4" />
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : latest.length === 0 ? (
            <p className="mt-10 text-sm text-ink-500">
              Belum ada UMKM terdaftar. Coba jalankan seeder backend terlebih dahulu.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.slice(0, 6).map((u, i) => (
                <div
                  key={u.id}
                  style={{ animation: `fade-up 0.5s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both` }}
                >
                  <UmkmCard umkm={u} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container-site py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-12 sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-wa-600/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Punya usaha sendiri?
                <br />
                <span className="text-brand-300">Gratis daftarkan di UMKM-Go.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-200/70">
                Tampilkan usaha kamu, bagikan lokasi, dan biarkan pelanggan menghubungi lewat
                WhatsApp langsung.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Link to="/register" className="btn btn-primary px-6 py-3 text-sm">
                Daftar Sekarang
              </Link>
              <Link to="/peta" className="btn px-6 py-3 text-sm text-white hover:bg-white/10">
                Lihat Peta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}