import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Compass, LayoutDashboard, LogOut, MapPin, Menu, PlusCircle, Search, ShieldCheck, Store, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { gatherCities } from '../../lib/cities'
import Dropdown from '../ui/Dropdown'

const NAV_ITEMS = [
  { to: '/peta', label: 'Peta', icon: <MapPin className="size-3.5" /> },
  { to: '/explore', label: 'Jelajah', icon: <Compass className="size-3.5" /> },
  { to: '/dashboard', label: 'Kelola', icon: <LayoutDashboard className="size-3.5" />, authOnly: true },
  { to: '/admin', label: 'Verifikasi', icon: <ShieldCheck className="size-3.5" />, adminOnly: true },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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

  const visibleNavItems = NAV_ITEMS.filter(
    (i) => (!i.authOnly || user) && (!i.adminOnly || user?.role === 'admin'),
  )

  const handleLogout = async () => {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/[0.07] bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.02),0_1px_2px_rgba(16,12,42,0.04)] backdrop-blur-xl">
      <div className="container-full flex items-center justify-between gap-4 py-3">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2.5 text-left">
          <div className="flex size-9 items-center justify-center rounded-xl bg-ink-900 text-accent-400 shadow-sm transition-colors group-hover:bg-brand-500">
            <Store className="size-4.5" strokeWidth={2.4} />
          </div>
          <div>
            <span className="font-display text-lg font-black leading-none tracking-tight text-ink-900">
              LOKA<span className="text-accent-500">LINK</span>
            </span>
          </div>
        </Link>

        {/* Desktop search bar - disembunyikan di Home (hero sudah punya versi besar) */}
        {!isHome && (
          <div className="ml-4 hidden max-w-lg flex-1 items-center gap-2 md:flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari sate, batik, bengkel, sayur..."
              className="w-full rounded-xl border border-ink-900/10 bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-ink-900 transition-all placeholder:text-ink-400/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <Dropdown
            value={selectedCity}
            onChange={(v) => setSelectedCity(v)}
            placeholder="Semua kota"
            options={[{ value: '', label: 'Semua kota' }, ...cities.map((c) => ({ value: c, label: c }))]}
            className="min-w-35 shrink-0"
            buttonClassName="rounded-xl border border-ink-900/10 bg-cream-50 px-3 py-2.5 font-semibold text-xs text-ink-900 hover:border-ink-900/25 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500"
          />
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-ink-900 text-white shadow-sm' : 'text-ink-700 hover:bg-ink-900/5'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {!user && (
            <Link to="/login" className="btn btn-ghost py-2! text-sm!">
              Masuk
            </Link>
          )}
          {user && (
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label="Menu akun"
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-900/10 bg-white p-1 pr-2 transition-colors hover:bg-cream-100"
              >
                <span className="grid size-7 place-items-center rounded-lg bg-brand-500 text-caption font-bold text-white">
                  {initials}
                </span>
                <ChevronDown className={`size-3.5 text-ink-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-lg">
                    <div className="border-b border-ink-900/5 px-4 py-3">
                      <p className="truncate text-sm font-bold text-ink-900">{user?.name}</p>
                      <p className="truncate text-caption text-ink-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-100"
                    >
                      <LayoutDashboard className="size-4" /> Dashboard Kios
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-100"
                      >
                        <ShieldCheck className="size-4" /> Verifikasi Lapak
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="size-4" /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!user && (
            <Link to={ctaTo} className="btn btn-primary ml-2 rounded-xl px-4! py-2! text-sm! font-bold">
              <PlusCircle className="size-4" />
              Daftarkan Lapak
            </Link>
          )}
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
            <Dropdown
              value={selectedCity}
              onChange={(v) => setSelectedCity(v)}
              placeholder="Semua kota"
              options={[{ value: '', label: 'Semua kota' }, ...cities.map((c) => ({ value: c, label: c }))]}
              className="w-full"
              buttonClassName="rounded-xl border border-ink-900/10 bg-cream-50 px-3 py-2.5 text-xs text-ink-900 hover:border-ink-900/25 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500"
              listClassName="z-[60]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-ink-900/5 pt-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `btn justify-start rounded-lg py-2.5! text-xs! ${isActive ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store className="size-4" /> Beranda
            </NavLink>
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `btn justify-start rounded-lg py-2.5! text-xs! ${isActive ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn w-full justify-center rounded-xl py-3! text-sm! font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" /> Keluar ({user?.name?.split(' ')[0]})
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn-outline w-full justify-center rounded-xl py-3! text-sm! font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masuk
            </Link>
          )}

          {!user && (
            <Link to={ctaTo} className="btn btn-primary w-full rounded-xl py-3! text-sm! font-bold" onClick={() => setMobileMenuOpen(false)}>
              <PlusCircle className="size-4" />
              Daftarkan Lapak UMKM
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
