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
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-96 rounded-full bg-wa-600/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo dark />
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold text-brand-300">
              Komunitas UMKM Indonesia
            </span>
            <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-tight text-white">
              Satu peta untuk <span className="text-brand-300">usaha lokal</span>.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-200/70">
              Bergabunglah dan tampilkan usahamu ke ribuan pengunjung yang mencari produk dan
              jasa lokal terbaik.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Store, text: 'Tampilkan usaha dengan foto & deskripsi lengkap' },
                { icon: MapPin, text: 'Bagikan lokasi dan mudah ditemukan di peta' },
                { icon: MessageCircle, text: 'Pelanggan bisa chat WhatsApp langsung' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm text-cream-100/80">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-300">
                    <f.icon className="size-4.5" />
                  </span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-cream-200/50">
            © {new Date().getFullYear()} UMKM-Go
          </p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
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
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk untuk mengelola UMKM milikmu."
    >
      <div className="flex items-center justify-between lg:hidden">
        <Logo />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Masuk
      </h1>
      <p className="mt-2 text-sm text-ink-500">{subtitle}</p>

      {message && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-sm">
          <LogIn className="size-4" />
          {loading ? 'Masuk…' : 'Masuk'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Belum punya akun?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Daftar gratis
        </Link>
      </p>
      <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-center text-xs text-brand-800">
        Akun demo: <span className="font-bold">tempemendoanmasadam@gmail.com</span> / <span className="font-bold">tempemendo@nmas@d4m26</span>
      </p>
    </AuthShell>
  )
}