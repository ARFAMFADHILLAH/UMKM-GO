import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Save, Store } from 'lucide-react'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import FileDropzone from '../components/ui/FileDropzone'
import MapPicker from '../components/map/MapPicker'
import { createUmkm, extractError, getUmkm, listCategories, updateUmkm } from '../lib/api'
import { invalidateUmkmCache } from '../lib/cities'

const EMPTY_FORM = {
  name: '',
  category_id: '',
  description: '',
  address: '',
  province: '',
  city: '',
  phone_whatsapp: '',
  instagram: '',
  website_url: '',
}

export default function ManageUmkm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(slug)

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [coords, setCoords] = useState(null)
  const [file, setFile] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [loaded, setLoaded] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listCategories().then(setCategories)
    if (isEdit) {
      getUmkm(slug)
        .then((res) => {
          const u = res.data
          setForm({
            name: u.name,
            category_id: String(u.category?.id ?? ''),
            description: u.description,
            address: u.address,
            province: u.province,
            city: u.city,
            phone_whatsapp: u.phone_whatsapp,
            instagram: u.instagram ?? '',
            website_url: u.website_url ?? '',
          })
          if (u.latitude != null && u.longitude != null) {
            setCoords([Number(u.latitude), Number(u.longitude)])
          }
          setExistingImage(u.image_cover ?? null)
          setLoaded(u)
          document.title = `Edit ${u.name} — UMKM-Go`
        })
        .catch((err) => {
          setMessage(extractError(err).message)
        })
        .finally(() => setLoading(false))
    } else {
      document.title = 'Daftarkan UMKM — UMKM-Go'
    }
  }, [isEdit, slug])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value != null) fd.append(key, value)
      })
      if (coords) {
        fd.append('latitude', String(coords[0]))
        fd.append('longitude', String(coords[1]))
      }
      if (file) fd.append('image_cover', file)

      if (isEdit && loaded) {
        await updateUmkm(loaded.id, fd, Boolean(file))
      } else {
        await createUmkm(fd)
      }
      invalidateUmkmCache()
      navigate('/dashboard')
    } catch (err) {
      const { message: msg, fieldErrors } = extractError(err)
      setMessage(msg)
      if (fieldErrors) setErrors(fieldErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner className="min-h-[50vh]" />

  return (
    <div className="container-site max-w-3xl animate-fade-in py-10 sm:py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="size-4" /> Kembali ke dashboard
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-600">
          <Store className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            {isEdit ? 'Edit UMKM' : 'Daftarkan UMKM Baru'}
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {isEdit ? 'Perbarui informasi usaha milikmu.' : 'Lengkapi data usaha agar mudah ditemukan.'}
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-6" noValidate>
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">Informasi dasar</h2>
          <Field label="Kategori usaha" error={errors.category_id?.[0]} required>
            <Select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nama usaha" error={errors.name?.[0]} required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="field"
              placeholder="contoh: Kripik Tempe Oemah"
            />
          </Field>
          <Field label="Deskripsi usaha" error={errors.description?.[0]} required>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="field min-h-28 resize-y"
              placeholder="Ceritakan produk atau layananmu…"
            />
          </Field>
          <Field label="Foto sampul" hint="Foto yang tampil di kartu dan detail UMKM.">
            <FileDropzone
              initialPreview={existingImage}
              onFile={setFile}
            />
          </Field>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">Lokasi &amp; kontak</h2>
          <Field label="Alamat lengkap" error={errors.address?.[0]} required>
            <textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className="field min-h-20 resize-y"
              placeholder="Jalan, RT/RW, kelurahan…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provinsi" error={errors.province?.[0]} required>
              <input
                value={form.province}
                onChange={(e) => set('province', e.target.value)}
                className="field"
                placeholder="contoh: Jawa Timur"
              />
            </Field>
            <Field label="Kota / Kabupaten" error={errors.city?.[0]} required>
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="field"
                placeholder="contoh: Kota Malang"
              />
            </Field>
          </div>
          <Field
            label="Nomor WhatsApp / HP"
            error={errors.phone_whatsapp?.[0]}
            required
            hint="Format internasional: 6281xxxxx (untuk tombol chat)"
          >
            <input
              value={form.phone_whatsapp}
              onChange={(e) => set('phone_whatsapp', e.target.value)}
              className="field"
              placeholder="contoh: 6281234567890"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" error={errors.instagram?.[0]}>
              <input
                value={form.instagram}
                onChange={(e) => set('instagram', e.target.value)}
                className="field"
                placeholder="contoh: kripiktempe_oemah"
              />
            </Field>
            <Field label="Website / URL" error={errors.website_url?.[0]}>
              <input
                value={form.website_url}
                onChange={(e) => set('website_url', e.target.value)}
                className="field"
                placeholder="https://…"
              />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <MapPin className="size-5 text-brand-600" /> Posisi di peta
          </h2>
          <p className="text-sm text-ink-500">
            Tandai lokasi usahamu di peta. Menjadi nilai plus saat juri melihat fitur peta.
          </p>
          <MapPicker value={coords} onChange={setCoords} />
          {coords && (
            <p className="text-xs font-medium text-wa-700">
              Lokasi tersimpan: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 pt-6">
          <p className="text-xs text-ink-400">
            <span className="text-brand-600">*</span> wajib diisi
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn btn-outline px-5 py-2.5 text-sm">
              Batal
            </Link>
            <button type="submit" disabled={submitting} className="btn btn-primary px-6 py-2.5 text-sm">
              <Save className="size-4" />
              {submitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Daftarkan UMKM'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}