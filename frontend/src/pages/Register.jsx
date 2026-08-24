import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Field from '../components/ui/Field'
import Logo from '../components/layout/Logo'
import { useAuth } from '../context/AuthContext'
import { extractError } from '../lib/api'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage('')

    const localErrors = {}
    if (!form.name.trim()) localErrors.name = ['Nama wajib diisi']
    if (!form.email.trim()) localErrors.email = ['Email wajib diisi']
    if (form.password.length < 8) localErrors.password = ['Password minimal 8 karakter']
    if (form.confirm !== form.password) localErrors.confirm = ['Konfirmasi password tidak cocok']
    if (Object.keys(localErrors).length) {
      setErrors(localErrors)
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const { message: msg, fieldErrors } = extractError(err)
      setMessage(msg)
      if (fieldErrors) {
        if (fieldErrors.email) fieldErrors.email = ['Email sudah terdaftar']
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-xs font-semibold text-ink-400 hover:text-accent-600">Kembali</Link>
        </div>
        <h1 className="mt-8 font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
          Daftar gratis
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Buat akun untuk mendaftarkan dan mengelola lapak milikmu.
        </p>

        {message && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <Field label="Nama lengkap" error={errors.name?.[0]} required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
              placeholder="Nama sesuai identitas"
            />
          </Field>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" error={errors.password?.[0]} required>
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="field"
                placeholder="Min. 8 karakter"
              />
            </Field>
            <Field label="Ulangi password" error={errors.confirm?.[0]} required>
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="field"
                placeholder="Ulangi password"
              />
            </Field>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3! text-sm! font-bold">
            <UserPlus className="size-4" />
            {loading ? 'Membuat akunâ€¦' : 'Buat Akun'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-700">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
