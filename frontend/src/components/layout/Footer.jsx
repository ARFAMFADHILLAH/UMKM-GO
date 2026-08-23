import { Link } from 'react-router-dom'
import { Heart, MapPin, ShieldCheck, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = [
  { name: 'Kuliner', hover: 'hover:text-cabai-500' },
  { name: 'Kerajinan Tangan', label: 'Kerajinan & Kriya', hover: 'hover:text-kerajinan-500' },
  { name: 'Fashion', label: 'Fashion & Busana', hover: 'hover:text-fashion-500' },
  { name: 'Jasa & Servis', label: 'Jasa & Servis', hover: 'hover:text-wa-500' },
  { name: 'Pertanian & Perkebunan', label: 'Pertanian & Agro', hover: 'hover:text-agro-500' },
]

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="mt-20 bg-ink-900 pb-8 pt-14 text-cream-100">
      <div className="container-site">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent-400 text-ink-900 shadow-sm">
                <Store className="size-5" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-white">
                UMKM<span className="text-accent-400">-Go</span>
              </span>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-cream-100/70">
              Peta interaktif dan direktori usaha mikro, kecil &amp; menengah se-Indonesia.
              Temukan lapak terdekat, pesan via WhatsApp, tanpa perantara, tanpa iklan mengganggu.
            </p>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-wa-500">
              <ShieldCheck className="size-3.5" />
              Verifikasi lapak resmi
            </div>
          </div>

          <div>
            <h4 className="font-display mb-4 text-sm font-bold text-white">Navigasi</h4>
            <ul className="space-y-2.5 text-[13px] text-cream-100/70">
              <li><Link to="/" className="transition-colors hover:text-accent-400">Beranda</Link></li>
              <li><Link to="/peta" className="transition-colors hover:text-accent-400">Peta Kios Interaktif</Link></li>
              <li><Link to="/explore" className="transition-colors hover:text-accent-400">Direktori UMKM</Link></li>
              <li><Link to="/dashboard" className="transition-colors hover:text-accent-400">Dashboard Pemilik</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-accent-400">Daftarkan Lapak</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-sm font-bold text-white">Kategori Usaha</h4>
            <ul className="space-y-2.5 text-[13px] text-cream-100/70">
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <Link
                    to={`/explore?search=${encodeURIComponent(c.label ?? c.name)}`}
                    className={`transition-colors ${c.hover}`}
                  >
                    {c.label ?? c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 md:col-span-3">
            <h4 className="font-display text-sm font-bold text-white">Untuk Pelaku Usaha</h4>
            <p className="text-[13px] leading-relaxed text-cream-100/70">
              Pasang titik kios di peta, terima order langsung di WhatsApp, jangkau pelanggan di
              sekitar Anda. 100% gratis tanpa komisi.
            </p>
            <Link
              to={user ? '/manage/new' : '/register'}
              className="btn btn-accent w-full justify-center rounded-xl !py-2.5 !text-sm font-bold"
            >
              Daftarkan Lapak Sekarang
            </Link>
            <div className="flex items-center gap-2 pt-2 font-mono text-[11px] text-cream-100/50">
              <MapPin className="size-3.5 text-accent-400" />
              <span>38 Provinsi · Seluruh Indonesia</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 font-mono text-[11px] text-cream-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} UMKM-Go Indonesia. Gerakan bela produk dan jasa lokal.</p>
          <p className="flex items-center gap-1.5">
            Dibangun dengan <Heart className="size-3 fill-cabai-500 text-cabai-500" /> untuk pelaku UMKM Nusantara.
          </p>
        </div>
      </div>
    </footer>
  )
}
