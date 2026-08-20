import { Link } from 'react-router-dom'
import { MapPin, Mail } from 'lucide-react'
import { InstagramIcon } from '../ui/BrandIcons'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-cream-200">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-200/70">
            Direktori usaha mikro, kecil, dan menengah di Indonesia. Mari bangkitkan ekonomi
            lokal dengan menemukan dan mendukung produk tetangga kita sendiri.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-white">Jelajahi</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-brand-300" to="/explore">Katalog UMKM</Link></li>
            <li><Link className="hover:text-brand-300" to="/peta">Peta UMKM</Link></li>
            <li><Link className="hover:text-brand-300" to="/register">Daftarkan usaha</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-white">Kontak</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-brand-400" /> halo@umkmgo.id
            </li>
            <li className="flex items-center gap-2">
              <InstagramIcon className="size-4 text-brand-400" /> @umkmgo.id
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-400" /> Seluruh Indonesia
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-200/60 sm:flex-row">
          <p>© {new Date().getFullYear()} UMKM-Go. Dibuat dengan semangat untuk UMKM Indonesia.</p>
          <p>Frontend: React · Backend: Laravel API</p>
        </div>
      </div>
    </footer>
  )
}