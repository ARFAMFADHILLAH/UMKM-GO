import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from './Logo'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/explore', label: 'Jelajahi UMKM' },
  { to: '/peta', label: 'Peta UMKM' },
]

function linkClass({ isActive }) {
  return `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-ink-700 hover:bg-cream-100 hover:text-brand-700'
  }`
}

export default function Navbar() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all ${
        scrolled || open
          ? 'border-ink-900/10 bg-cream-50/90 shadow-[0_4px_20px_-8px_rgba(33,26,20,0.12)] backdrop-blur-md'
          : 'border-transparent bg-cream-50'
      }`}
    >
      <nav className="container-site flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'text-ink-700 hover:text-brand-700'
                  }`
                }
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </NavLink>
              <Link to="/manage/new" className="btn btn-primary px-4 py-2 text-sm">
                Daftarkan UMKM
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost px-4 py-2 text-sm">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary px-4 py-2 text-sm">
                Daftarkan UMKM
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="grid size-10 place-items-center rounded-xl text-ink-900 hover:bg-cream-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-ink-900/10 bg-cream-50 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink-900/10 pt-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-outline w-full py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/manage/new" className="btn btn-primary w-full py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Daftarkan UMKM
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-primary w-full py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Daftarkan UMKM
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}