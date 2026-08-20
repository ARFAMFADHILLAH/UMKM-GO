import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center justify-center py-28 text-center">
      <p className="rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-700">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink-900">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-500">
        Mungkin halaman ini sudah dipindah, atau alamatnya salah ketik. Yuk balik ke beranda.
      </p>
      <Link to="/" className="btn btn-primary mt-8 px-6 py-3 text-sm">
        <Home className="size-4" /> Kembali ke beranda
      </Link>
    </div>
  )
}