import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import UmkmMap from '../components/map/UmkmMap'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { listCategories } from '../lib/api'
import { fetchAllUmkms } from '../lib/cities'

export default function MapPage() {
  const [all, setAll] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAllUmkms(), listCategories()])
      .then(([umkms, cats]) => {
        setAll(umkms)
        setCategories(cats)
      })
      .finally(() => setLoading(false))
  }, [])

  const pins = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter((u) => u.latitude != null && u.longitude != null)
      .filter((u) => (categoryId ? String(u.category_id ?? u.category?.id) === String(categoryId) : true))
      .filter((u) =>
        q ? `${u.name} ${u.city} ${u.province} ${u.description}`.toLowerCase().includes(q) : true,
      )
  }, [all, query, categoryId])

  return (
    <div className="animate-fade-in">
      <section className="border-b border-ink-900/5 bg-white/70">
        <div className="container-site py-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Peta interaktif</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Jelajahi UMKM di peta
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">
            Temukan usaha terdekat di sekitarmu. Gunakan tombol “Lokasi saya” untuk memusatkan
            peta ke posisimu, lalu klik pin untuk melihat detail.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari di peta (nama, kota, kategori)…"
              className="field"
            />
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="sm:w-52"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="container-site py-8">
        {loading ? (
          <Spinner label="Memuat peta…" />
        ) : all.filter((u) => u.latitude != null).length === 0 ? (
          <EmptyState
            title="Belum ada pin di peta"
            description="Sepertinya data UMKM belum punya koordinat. Minta temen backend mengisi latitude & longitude di seeder ya!"
            action={
              <Link to="/explore" className="btn btn-outline px-4 py-2 text-sm">
                Lihat katalog dulu
              </Link>
            }
          />
        ) : (
          <div className="relative">
            <UmkmMap pins={pins} className="h-[70vh] w-full" />
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
              <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink-900 shadow-lg backdrop-blur">
                <MapPin className="size-4 text-brand-600" />
                Menampilkan {pins.length} lokasi
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}