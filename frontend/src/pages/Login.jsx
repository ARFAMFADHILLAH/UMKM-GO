import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, MapPin, MessageCircle, Store } from 'lucide-react'
import Field from '../components/ui/Field'
import Logo from '../components/layout/Logo'
import { useAuth } from '../context/AuthContext'
import { extractError } from '../lib/api'

function AuthShell({ children }) {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo dark />
          <div>
            <span className="eyebrow text-cream-100/70">
              <Store className="size-3.5 text-accent-400" />
              <span className="text-accent-400">Komunitas UMKM Indonesia</span>
            </span>
            <h2 className="font-display mt-4 max-w-md text-4xl font-black leading-tight tracking-tight text-white">
              Satu peta untuk
              <span className="block text-accent-400">usaha lokal.</span>
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream-100/70">
              Bergabung dan tampilkan usahamu ke ribuan pengunjung yang mencari produk dan jasa
              lokal terbaik.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Store, text: 'Tampilkan usaha dengan foto & deskripsi lengkap' },
                { icon: MapPin, text: 'Bagikan lokasi dan mudah ditemukan di peta' },
                { icon: MessageCircle, text: 'Pelanggan bisa chat WhatsApp langsung' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm text-cream-100/80">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-accent-400">
                    <f.icon className="size-4" />
                  </span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
          <p className="font-mono text-[11px] text-cream-200/50">© {new Date().getFullYear()} UMKM-Go</p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      const { message: msg, fieldErrors } = extractError(err)
      setMessage(msg)
      if (fieldErrors) setErrors(fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="flex items-center justify-between lg:hidden">
        <Logo />
      </div>
      <h1 className="mt-6 font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
        Masuk
      </h1>
      <p className="mt-2 text-sm text-ink-500">Masuk untuk mengelola lapak milikmu.</p>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-cabai-500/30 bg-cabai-500/10 px-4 py-3 text-sm text-cabai-600">
          {message}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Field label="Email" error={errors.email?.[0]} required>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="field"
            placeholder="nama@email.com"
          />
        </Field>
        <Field label="Password" error={errors.password?.[0]} required>
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="field"
            placeholder="••••••••"
          />
        </Field>

        <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3 !text-sm font-bold">
          <LogIn className="size-4" />
          {loading ? 'Masuk…' : 'Masuk'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Belum punya akun?{' '}
        <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-700">
          Daftar gratis
        </Link>
      </p>
      <p className="mt-3 rounded-xl border border-ink-900/[0.07] bg-ink-100 px-4 py-3 text-center text-xs text-ink-500">
        Akun demo:{' '}
        <span className="font-mono font-semibold text-ink-700">tempemendoanmasadam@gmail.com</span>
      </p>
    </AuthShell>
  )
}
