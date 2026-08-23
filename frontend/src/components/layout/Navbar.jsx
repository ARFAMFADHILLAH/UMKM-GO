import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Compass, LayoutDashboard, MapPin, Menu, PlusCircle, Search, Store, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { gatherCities } from '../../lib/cities'

const NAV_ITEMS = [
  { to: '/peta', label: 'Peta', icon: <MapPin className="size-3.5" /> },
  { to: '/explore', label: 'Jelajah', icon: <Compass className="size-3.5" /> },
  { to: '/dashboard', label: 'Kelola', icon: <LayoutDashboard className="size-3.5" />, authOnly: true },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState([])

  useEffect(() => {
    gatherCities().then(setCities).catch(() => {})
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (selectedCity) params.set('city', selectedCity)
    navigate(`/explore?${params.toString()}`)
    setMobileMenuOpen(false)
  }

  const ctaTo = user ? '/manage/new' : '/register'

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/[0.07] bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.02),0_1px_2px_rgba(21,25,20,0.04)] backdrop-blur-xl">
      <div className="container-site flex items-center justify-between gap-4 py-3">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2.5 text-left">
          <div className="flex size-9 items-center justify-center rounded-xl bg-ink-900 text-accent-400 shadow-sm transition-colors group-hover:bg-brand-500">
            <Store className="size-[18px]" strokeWidth={2.4} />
          </div>
          <div>
            <span className="font-display text-[19px] font-black leading-none tracking-tight text-ink-900">
              UMKM<span className="text-accent-500">-Go</span>
            </span>
            <span className="hidden font-mono text-[10px] font-semibold tracking-widest text-ink-400 sm:block">
              PETA · DIREKTORI · WHATSAPP
            </span>
          </div>
        </Link>

        {/* Desktop search bar */}
        <div className="ml-4 hidden max-w-lg flex-1 items-center gap-2 md:flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari sate, batik, bengkel, sayur..."
              className="w-full rounded-xl border border-ink-900/10 bg-cream-50 py-2.5 pl-10 pr-4 text-[13px] text-ink-900 transition-all placeholder:text-ink-400/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="min-w-[130px] cursor-pointer rounded-xl border border-ink-900/10 bg-cream-50 px-3 py-2.5 font-mono text-[12px] font-semibold text-ink-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          >
            <option value="">Semua kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.filter((i) => !i.authOnly || user).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                  isActive ? 'bg-ink-900 text-white shadow-sm' : 'text-ink-700 hover:bg-ink-900/5'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {!user && (
            <Link to="/login" className="btn btn-ghost !py-2 !text-[12.5px]">
              Masuk
            </Link>
          )}
          <Link to={ctaTo} className="btn btn-primary ml-2 rounded-xl !px-4 !py-2 !text-[12.5px] font-bold">
            <PlusCircle className="size-4" />
            Daftarkan Lapak
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-ink-900/10 bg-cream-50 p-2 text-ink-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="space-y-3 border-t border-ink-900/[0.07] bg-white px-4 pb-5 pt-3 lg:hidden">
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari lapak..."
                className="w-full rounded-xl border border-ink-900/10 bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3 py-2.5 font-mono text-xs text-ink-900 focus:outline-none"
            >
              <option value="">Semua kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-ink-900/5 pt-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `btn justify-start rounded-lg !py-2.5 !text-xs ${isActive ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store className="size-4" /> Beranda
            </NavLink>
            {NAV_ITEMS.filter((i) => !i.authOnly || user).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `btn justify-start rounded-lg !py-2.5 !text-xs ${isActive ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>

          <Link to={ctaTo} className="btn btn-primary w-full rounded-xl !py-3 !text-sm font-bold" onClick={() => setMobileMenuOpen(false)}>
            <PlusCircle className="size-4" />
            Daftarkan Lapak UMKM
          </Link>
        </div>
      )}
    </header>
  )
}
