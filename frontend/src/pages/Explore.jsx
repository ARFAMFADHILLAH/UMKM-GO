import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw, Search } from 'lucide-react'
import Select from '../components/ui/Select'
import UmkmCard from '../components/UmkmCard'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { listCategories, listUmkms } from '../lib/api'
import { gatherCities } from '../lib/cities'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const search = params.get('search') ?? ''
  const categoryId = params.get('category_id') ?? ''
  const city = params.get('city') ?? ''

  const [input, setInput] = useState(search)
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const requested = useRef('')

  useEffect(() => {
    listCategories().then(setCategories)
    gatherCities().then(setCities)
  }, [])

  useEffect(() => {
    if (input !== search) setInput(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const cacheKey = JSON.stringify({ page, search, categoryId, city })
  useEffect(() => {
    if (requested.current === cacheKey) return
    requested.current = cacheKey
    setLoading(true)
    const q = new URLSearchParams({ page: String(page) })
    if (search) q.set('search', search)
    if (categoryId) q.set('category_id', categoryId)
    if (city) q.set('city', city)
    listUmkms(q)
      .then(setResult)
      .finally(() => setLoading(false))
  }, [cacheKey, page, search, categoryId, city])

  const updateParams = (next) => {
    const q = new URLSearchParams()
    if (next.search) q.set('search', next.search)
    if (next.category_id) q.set('category_id', next.category_id)
    if (next.city) q.set('city', next.city)
    const pageNum = next.page ?? 1
    if (pageNum > 1) q.set('page', String(pageNum))
    setParams(q)
  }

  const hasFilters = Boolean(search || categoryId || city)
  const items = result?.data ?? []
  const activeCategory = categories.find((c) => String(c.id) === String(categoryId))

  const heading = useMemo(() => {
    if (search && activeCategory) return `Hasil “${search}” di ${activeCategory.name}`
    if (search) return `Hasil pencarian “${search}”`
    if (activeCategory) return `Semua UMKM ${activeCategory.name}`
    if (city) return `UMKM di ${city}`
    return 'Semua UMKM'
  }, [search, activeCategory, city])

  return (
    <div className="animate-fade-in">
      <section className="border-b border-ink-900/5 bg-white/70">
        <div className="container-site py-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Katalog UMKM</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {loading && !result
              ? 'Memuat data…'
              : `${result?.total ?? 0} usaha ditemukan${result?.total ? ` · halaman ${result.current_page} dari ${result.last_page}` : ''}`}
          </p>

          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
            onSubmit={(e) => {
              e.preventDefault()
              updateParams({ search: input.trim(), category_id: categoryId, city })
            }}
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cari nama atau deskripsi usaha…"
                className="field pl-10"
              />
            </label>
            <Select
              value={categoryId}
              onChange={(e) => updateParams({ search, category_id: e.target.value, city })}
              className="sm:w-44"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={city}
              onChange={(e) => updateParams({ search, category_id: categoryId, city: e.target.value })}
              className="sm:w-44"
              disabled={cities.length === 0}
            >
              <option value="">Semua kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <button type="submit" className="btn btn-primary px-6 py-2.5 text-sm">
              Terapkan
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams())}
                className="btn btn-ghost px-3 py-2.5 text-sm"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            )}
          </form>
        </div>
      </section>

      <section className="container-site py-10 sm:py-12">
        {loading ? (
          <Spinner label="Memuat katalog…" />
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada hasil ditemukan"
            description={
              hasFilters
                ? 'Coba ubah kata kunci atau filter, atau reset semua filter.'
                : 'Belum ada UMKM terdaftar. Jalankan seeder backend dulu ya!'
            }
            action={
              hasFilters && (
                <button type="button" onClick={() => setParams(new URLSearchParams())} className="btn btn-outline px-4 py-2 text-sm">
                  Reset filter
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((u) => (
                <UmkmCard key={u.id} umkm={u} />
              ))}
            </div>
            <div className="mt-12">
              <Pagination
                current={result?.current_page}
                last={result?.last_page}
                onPage={(p) => updateParams({ search, category_id: categoryId, city, page: p })}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}