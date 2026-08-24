import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, MapPin, ShieldX, Store as StoreIcon, X } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { extractError, listPendingUmkms, rejectUmkm, verifyUmkm } from '../lib/api'
import { invalidateUmkmCache } from '../lib/cities'
import { useAuth } from '../context/AuthContext'
import { categoryColor } from '../lib/format'

function PendingRow({ umkm, onVerify, onReject, busy }) {
  const warna = categoryColor(umkm.category?.name)
  return (
    <li className="flex items-center gap-4 rounded-xl border border-ink-900/5 bg-white p-3.5">
      <div className="block size-16 shrink-0 overflow-hidden rounded-lg border border-ink-900/5 bg-cream-100 sm:size-20">
        {umkm.image_cover ? (
          <img src={umkm.image_cover} alt={`Foto ${umkm.name}`} loading="lazy" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center" style={{ backgroundColor: `${warna}14` }}>
            <StoreIcon className="size-6" style={{ color: warna }} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-ink-900">{umkm.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-ink-500">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: warna }}
          >
            {umkm.category?.name}
          </span>
          <MapPin className="size-3" /> {umkm.city}, {umkm.province}
        </p>
        <p className="mt-1 line-clamp-1 text-caption text-ink-400">{umkm.description}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onVerify(umkm)}
          className="btn btn-wa !px-3 !py-2 !text-xs"
        >
          <Check className="size-3.5" /> Setujui
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onReject(umkm)}
          className="btn !px-3 !py-2 !text-xs text-red-600 hover:bg-red-50"
        >
          <X className="size-3.5" /> Tolak
        </button>
      </div>
    </li>
  )
}

export default function AdminVerification() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [endpointMissing, setEndpointMissing] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)

  const isAdmin = user?.role === 'admin'

  const load = useCallback(() => {
    if (!isAdmin) {
      setLoading(false)
      setForbidden(true)
      return
    }
    setLoading(true)
    listPendingUmkms()
      .then((res) => {
        setItems(res.data ?? [])
        setEndpointMissing(false)
      })
      .catch((err) => {
        const status = err?.response?.status
        if (status === 404 || status === 405) setEndpointMissing(true)
        else if (status === 403) setForbidden(true)
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [isAdmin])

  useEffect(load, [load])

  const handleAction = async (umkm, action) => {
    if (action === 'reject' && !window.confirm(`Tolak lapak "${umkm.name}"? Lapak tidak akan tayang di peta.`)) return
    setBusyId(umkm.id)
    try {
      if (action === 'verify') await verifyUmkm(umkm.id)
      else await rejectUmkm(umkm.id)
      invalidateUmkmCache()
      setMessage(
        action === 'verify'
          ? `"${umkm.name}" disetujui dan sekarang tayang di peta.`
          : `"${umkm.name}" ditolak.`,
      )
    } catch (err) {
      setMessage(`Gagal memproses "${umkm.name}". ${extractError(err).message}`)
    } finally {
      setBusyId(null)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  if (!user) {
    return (
      <div className="container-site py-16">
        <EmptyState
          title="Halaman khusus admin"
          description="Masuk terlebih dahulu dengan akun admin untuk memverifikasi lapak."
          action={
            <Link to="/login" className="btn btn-primary rounded-xl px-6 py-2.5 text-sm font-bold">
              Masuk
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-site space-y-8 py-8">
      <div>
        <span className="label-caption">Panel moderator</span>
        <h1 className="font-display text-3xl font-black tracking-tight text-ink-900">Verifikasi Lapak</h1>
        <p className="mt-1 text-sm text-ink-500">
          Tinjau lapak baru sebelum tayang di peta publik. Lapak yang belum diverifikasi tidak
          terlihat oleh pengunjung.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-accent-400/40 bg-accent-400/[0.08] px-4 py-3 text-sm font-medium text-ink-700">
          {message}
        </div>
      )}

      {loading ? (
        <Spinner label="Memuat daftar lapak…" />
      ) : endpointMissing ? (
        <div className="flex items-start gap-3 rounded-xl border border-accent-400/40 bg-accent-400/[0.08] px-4 py-3 text-sm text-ink-700">
          <ShieldX className="mt-0.5 size-4 shrink-0 text-accent-600" />
          <p>
            Endpoint admin{' '}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">GET /api/admin/umkms/pending</code>{' '}
            belum tersedia di backend. Lihat catatan Obsidian "Catatan Backend" untuk spesifikasinya.
          </p>
        </div>
      ) : forbidden || !isAdmin ? (
        <EmptyState
          title="Akses ditolak"
          description="Hanya akun dengan role admin yang bisa membuka halaman ini."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada lapak menunggu verifikasi"
          description="Semua pengajuan lapak sudah diproses. Lapak baru dari pemilik akan muncul di sini."
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink-900/5 pb-3">
            <h3 className="font-display text-lg font-bold text-ink-900">Menunggu tinjauan</h3>
            <span className="text-caption font-bold tabular-nums text-ink-500">{items.length} pengajuan</span>
          </div>
          <ul className="space-y-2">
            {items.map((u) => (
              <PendingRow
                key={u.id}
                umkm={u}
                busy={busyId === u.id}
                onVerify={(umkm) => handleAction(umkm, 'verify')}
                onReject={(umkm) => handleAction(umkm, 'reject')}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
