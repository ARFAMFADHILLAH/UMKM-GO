import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, LogOut, MapPin, Pencil, Plus, ShieldCheck, Store as StoreIcon, Trash2, TrendingUp } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { deleteUmkm, listMyUmkms } from '../lib/api'
import { invalidateUmkmCache } from '../lib/cities'
import { useAuth } from '../context/AuthContext'
import { categoryColor, formatDate } from '../lib/format'

function MetricCard({ icon, iconBg, label, value }) {
  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
        <span className="flex items-center gap-0.5 text-caption font-semibold text-wa-600">
          <TrendingUp className="size-3" /> aktif
        </span>
      </div>
      <span className="label-caption mb-1 block">{label}</span>
      <span className="font-display text-2xl font-black leading-none text-ink-900">{value}</span>
    </div>
  )
}

function StatusBadge({ verified }) {
  return verified ? (
    <span className="stamp-verified py-0! text-caption!">
      <ShieldCheck className="size-3" /> Terverifikasi
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded border border-dashed border-accent-400/50 bg-accent-400/8 px-2 py-0.5 text-caption font-bold uppercase tracking-wider text-accent-600">
      <Clock className="size-3" /> Menunggu verifikasi
    </span>
  )
}

function MyUmkmRow({ umkm, onDelete, busy }) {
  const warna = categoryColor(umkm.category?.name)
  return (
    <li className="flex items-center gap-4 rounded-xl border border-ink-900/5 bg-white p-3.5 transition-colors hover:border-ink-900/15">
      <Link
        to={`/umkms/${umkm.slug}`}
        className="block size-16 shrink-0 overflow-hidden rounded-lg border border-ink-900/5 bg-cream-100 sm:size-20"
      >
        {umkm.image_cover ? (
          <img src={umkm.image_cover} alt={`Foto ${umkm.name}`} loading="lazy" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center" style={{ backgroundColor: `${warna}14` }}>
            <StoreIcon className="size-6" style={{ color: warna }} />
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/umkms/${umkm.slug}`}
            className="truncate font-display text-sm font-bold text-ink-900 transition-colors hover:text-brand-500"
          >
            {umkm.name}
          </Link>
          {umkm.is_verified != null && <StatusBadge verified={Boolean(umkm.is_verified)} />}
        </div>
        <p className="mt-1 flex items-center gap-1 text-caption text-ink-500">
          {umkm.category?.name} ? <MapPin className="size-3" /> {umkm.city}, {umkm.province}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to={`/manage/${umkm.slug}`} className="btn btn-outline px-3! py-2! text-xs!">
          <Pencil className="size-3.5" /> Edit
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(umkm)}
          className="btn px-3! py-2! text-xs! text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" /> Hapus
        </button>
      </div>
    </li>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
      setMessage('Lapak berhasil dihapus.')
      load()
    } catch {
      setMessage('Gagal menghapus lapak.')
    } finally {
      setBusyDelete(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="container-site space-y-8 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="label-caption">Area pemilik lapak</span>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink-900">Dashboard Kios</h1>
          <p className="mt-1 tracking-[0.08em] text-caption uppercase tracking-[0.12em] text-ink-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link to="/manage/new" className="btn btn-primary rounded-xl px-4! py-2.5! text-xs! font-bold">
            <Plus className="size-4" /> Tambah Lapak Baru
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
            className="btn btn-outline rounded-xl px-4! py-2.5! text-xs! font-semibold"
          >
            <LogOut className="size-3.5" /> Keluar
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-wa-500/30 bg-wa-500/7 px-4 py-3 text-sm font-medium text-wa-600">
          {message}
        </div>
      )}

      {endpointMissing && (
        <div className="flex items-start gap-3 rounded-xl border border-accent-400/40 bg-accent-400/8 px-4 py-3 text-sm text-ink-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-600" />
          <p>
            Halaman ini butuh endpoint{' '}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">GET /api/my-umkms</code> yang belum
            tersedia di backend. Tambahkan endpoint tersebut (lihat CATATAN-BACKEND.md).
          </p>
        </div>
      )}

      {/* Metrik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<StoreIcon className="size-5" />}
          iconBg="bg-brand-500/10 text-brand-500"
          label="Lapak milikmu"
          value={loading ? '.' : String(total ?? 0)}
        />
        <MetricCard
          icon={<MapPin className="size-5" />}
          iconBg="bg-agro-500/10 text-agro-500"
          label="Kota terdaftar"
          value={loading ? '.' : String(new Set(items.filter((u) => u.city).map((u) => u.city)).size)}
        />
        <MetricCard
          icon={<TrendingUp className="size-5" />}
          iconBg="bg-accent-400/15 text-accent-600"
          label="Bergabung sejak"
          value={user?.created_at ? formatDate(user.created_at) : '-'}
        />
      </div>

      {/* Kelola lapak */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ink-900/5 pb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">Kelola lapak</h3>
            <p className="text-xs text-ink-500">Edit profil, lokasi, dan foto lapak milikmu.</p>
          </div>
          {!loading && !endpointMissing && (
            <span className="text-caption font-bold tabular-nums text-ink-500">{items.length} lapak</span>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : items.length === 0 && !endpointMissing ? (
          <EmptyState
            title="Belum ada lapak terdaftar"
            description="Daftarkan usaha Anda untuk mulai mengelola kios di peta dan menerima order via WhatsApp."
            action={
              <Link to="/manage/new" className="btn btn-primary rounded-xl px-6! py-2.5! text-sm! font-bold">
                Daftarkan UMKM Sekarang
              </Link>
            }
          />
        ) : !endpointMissing ? (
          <ul className="space-y-2">
            {items.map((u) => (
              <MyUmkmRow key={u.id} umkm={u} onDelete={handleDelete} busy={busyDelete === u.id} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
