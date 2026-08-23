import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, RotateCcw, Search, X } from 'lucide-react'
import UmkmCard from '../components/UmkmCard'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { categoryColor } from '../lib/format'
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
  const [sortBy, setSortBy] = useState('recommended')
  const [viewMode, setViewMode] = useState('grid')

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

  const hasActiveFilters = Boolean(search || categoryId || city)

  const handleReset = () => {
    setInput('')
    setSortBy('recommended')
    setParams(new URLSearchParams())
  }

  const items = useMemo(() => {
    const raw = result?.data ?? []
    if (sortBy === 'name') return [...raw].sort((a, b) => a.name.localeCompare(b.name, 'id'))
    return raw
  }, [result, sortBy])

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId))

  const heading = useMemo(() => {
    if (search && activeCategory) return `Hasil “${search}” di ${activeCategory.name}`
    if (search) return `Hasil pencarian “${search}”`
    if (activeCategory) return `Kategori ${activeCategory.name}`
    if (city) return `Lapak di ${city}`
    return 'Jelajah usaha lokal'
  }, [search, activeCategory, city])

  const tabs = [{ id: '', name: 'Semua' }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))]

  return (
    <div className="container-site space-y-6 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="label-caption">Direktori UMKM</span>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading && !result
              ? 'Memuat data…'
              : `${result?.total ?? 0} lapak ${city ? `di ${city}` : 'di seluruh Indonesia'}`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-ink-900/10 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'}`}
            title="Grid"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'compact' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'}`}
            title="List"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Filter workspace */}
      <div className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateParams({ search: input.trim(), category_id: categoryId, city })
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-12"
        >
          <div className="relative sm:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cari nama toko, menu, jasa, atau kota..."
              className="field pl-10 pr-8"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="sm:col-span-3">
            <select
              value={city}
              onChange={(e) => updateParams({ search, category_id: categoryId, city: e.target.value })}
              className="field cursor-pointer font-medium"
              disabled={cities.length === 0}
            >
              <option value="">Semua kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="field cursor-pointer font-medium"
            >
              <option value="recommended">Urut: Rekomendasi</option>
              <option value="name">Urut: Nama A–Z</option>
            </select>
          </div>

          {/* Tab bar kategori — garis bawah warna kategori, bukan kapsul */}
          <div className="border-t border-ink-900/5 pt-3 sm:col-span-12">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="eyebrow">Kategori</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-cabai-500 hover:text-cabai-600"
                >
                  <RotateCcw className="size-3" /> Reset
                </button>
              )}
            </div>
            <nav className="-mb-px flex items-center gap-1 overflow-x-auto border-b border-ink-900/5">
              {tabs.map((cat) => {
                const isSelected = categoryId === cat.id
                const col = cat.id === '' ? '#151914' : categoryColor(cat.name)
                return (
                  <button
                    key={cat.id || 'all'}
                    type="button"
                    onClick={() => updateParams({ search, category_id: cat.id, city })}
                    className={`relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                      isSelected ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                    }`}
                    style={{ borderColor: isSelected ? col : 'transparent' }}
                  >
                    {cat.id !== '' && (
                      <span aria-hidden className="size-1.5" style={{ backgroundColor: isSelected ? col : '#A8AC9C' }} />
                    )}
                    {cat.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </form>
      </div>

      {loading ? (
        <Spinner label="Memuat katalog…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan lapak yang cocok"
          description={`Tidak ada hasil untuk "${search || 'filter ini'}"${city ? ` di ${city}` : ''}. Coba ubah kata kunci atau reset filter.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <button type="button" onClick={handleReset} className="btn btn-primary px-4 py-2 text-xs sm:text-sm">
                  <RotateCcw className="size-4" /> Reset filter
                </button>
              )}
              <Link to="/register" className="btn btn-outline px-4 py-2 text-xs sm:text-sm">
                Daftarkan lapak Anda
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {items.map((umkm) => (
              <UmkmCard key={umkm.id} umkm={umkm} compact={viewMode === 'compact'} />
            ))}
          </div>

          {/* Paginasi server-side */}
          {result?.last_page > 1 && (
            <nav className="flex items-center justify-center gap-1.5 pt-2" aria-label="Paginasi">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => window.scrollTo({ top: 0 }) || updateParams({ search, category_id: categoryId, city, page: page - 1 })}
                className="btn btn-outline size-9 !p-0 disabled:pointer-events-none disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: result.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0 })
                    updateParams({ search, category_id: categoryId, city, page: p })
                  }}
                  aria-current={p === page ? 'page' : undefined}
                  className={`btn size-9 !p-0 font-mono text-[13px] ${p === page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= result.last_page}
                onClick={() => window.scrollTo({ top: 0 }) || updateParams({ search, category_id: categoryId, city, page: page + 1 })}
                className="btn btn-outline size-9 !p-0 disabled:pointer-events-none disabled:opacity-40"
              >
                ›
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
