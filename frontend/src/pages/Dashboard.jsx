import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  MapPin,
  Pencil,
  Plus,
  Store,
  Trash2,
  Store as StoreIcon,
} from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { deleteUmkm, listMyUmkms } from '../lib/api'
import { invalidateUmkmCache } from '../lib/cities'
import { useAuth } from '../context/AuthContext'
import { categoryColor } from '../lib/format'

function MyUmkmRow({ umkm, onDelete, busy }) {
  const cover = umkm.image_cover ? (
    <img src={umkm.image_cover} alt={umkm.name} className="size-full object-cover" />
  ) : (
    <div className={`grid size-full place-items-center ${categoryColor(umkm.category?.name)}`}>
      <StoreIcon className="size-8 text-white/80" />
    </div>
  )
  return (
    <li className="card flex items-center gap-4 p-3 sm:p-4">
      <Link
        to={`/umkms/${umkm.slug}`}
        className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100 sm:h-24 sm:w-28"
      >
        {cover}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/umkms/${umkm.slug}`}
            className="truncate font-display text-base font-semibold text-ink-900 hover:text-brand-700"
          >
            {umkm.name}
          </Link>
          <span className="rounded-full bg-wa-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wa-700">
            Verifikasi
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
          {umkm.category?.name} · <MapPin className="size-3" /> {umkm.city}, {umkm.province}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to={`/manage/${umkm.slug}`} className="btn btn-outline px-3 py-2 text-xs">
          <Pencil className="size-3.5" /> Edit
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(umkm)}
          className="btn px-3 py-2 text-xs text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" /> Hapus
        </button>
      </div>
    </li>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [endpointMissing, setEndpointMissing] = useState(false)
  const [busyDelete, setBusyDelete] = useState(null)
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    listMyUmkms()
      .then((res) => {
        setItems(res.data ?? [])
        setTotal(res.total ?? res.data?.length ?? 0)
        setEndpointMissing(false)
      })
      .catch((err) => {
        const status = err?.response?.status
        if (status === 404 || status === 405) {
          setEndpointMissing(true)
          setItems([])
          setTotal(null)
        } else {
          setItems([])
          setTotal(0)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleDelete = async (umkm) => {
    if (!window.confirm(`Yakin ingin menghapus "${umkm.name}"?`)) return
    setBusyDelete(umkm.id)
    try {
      await deleteUmkm(umkm.id)
      invalidateUmkmCache()
      setMessage('UMKM berhasil dihapus.')
      load()
    } catch {
      setMessage('Gagal menghapus UMKM.')
    } finally {
      setBusyDelete(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="container-site animate-fade-in py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Dashboard</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Halo, {user?.name?.split(' ')[0] || 'Pemilik UMKM'}
            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <StoreIcon className="size-5" />
            </span>
          </h1>
          <p className="mt-2 text-sm text-ink-500">{user?.email}</p>
        </div>
        <Link to="/manage/new" className="btn btn-primary px-5 py-2.5 text-sm">
          <Plus className="size-4" /> Tambah UMKM Baru
        </Link>
      </div>

      {message && (
        <div className="mt-6 rounded-xl border border-wa-200 bg-wa-50 px-4 py-3 text-sm font-medium text-wa-700">
          {message}
        </div>
      )}

      {endpointMissing && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Halaman ini butuh endpoint <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">GET /api/my-umkms</code>{' '}
            yang belum tersedia di backend. Tambahkan endpoint tersebut (lihat CATATAN-BACKEND.md).
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-600">
            <Store className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink-900">
              {loading ? '…' : (total ?? '–')}
            </p>
            <p className="text-xs font-medium text-ink-400">UMKM milikmu</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-wa-100 text-wa-700">
            <MapPin className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink-900">—</p>
            <p className="text-xs font-medium text-ink-400">Total kunjungan</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
            <Store className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink-900">Terbuka</p>
            <p className="text-xs font-medium text-ink-400">Pendaftaran UMKM</p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink-900">UMKM milikmu</h2>
        {loading ? (
          <Spinner />
        ) : items.length === 0 && !endpointMissing ? (
          <div className="mt-4">
            <EmptyState
              title="Kamu belum punya UMKM"
              description="Daftarkan usaha pertamamu sekarang dan tampilkan ke publik."
              action={
                <Link to="/manage/new" className="btn btn-primary px-5 py-2.5 text-sm">
                  <Plus className="size-4" /> Tambah UMKM
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((u) => (
              <MyUmkmRow key={u.id} umkm={u} onDelete={handleDelete} busy={busyDelete === u.id} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}