import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, MapPin, Sparkles } from 'lucide-react'
import UmkmMap from '../components/map/UmkmMap'
import UmkmCard from '../components/UmkmCard'
import FileDropzone from '../components/ui/FileDropzone'
import Spinner from '../components/ui/Spinner'
import { createUmkm, extractError, getUmkm, listCategories, updateUmkm } from '../lib/api'
import { invalidateUmkmCache } from '../lib/cities'
import { categoryColor } from '../lib/format'

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

function Label({ children, required = false }) {
  return (
    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-tight text-ink-700">
      {children}
      {required && <span className="ml-0.5 text-cabai-500">*</span>}
    </label>
  )
}

function SectionHeader({ step, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-900/5 pb-3">
      <span className="flex size-7 items-center justify-center rounded-lg bg-ink-900 font-mono text-xs font-black text-accent-400">
        {step}
      </span>
      <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
    </div>
  )
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
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

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
        .catch((err) => setMessage(extractError(err).message))
        .finally(() => setLoading(false))
    } else {
      document.title = 'Daftarkan Lapak — UMKM-Go'
    }
  }, [isEdit, slug])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const categoryName =
    categories.find((c) => String(c.id) === String(form.category_id))?.name ?? ''

  // Pratinjau langsung untuk kartu UMKM
  const preview = {
    id: 'preview',
    slug: 'preview',
    name: form.name || 'Nama Lapak Anda',
    category: { id: Number(form.category_id) || 0, name: categoryName || 'Kategori' },
    description:
      form.description || 'Deskripsi singkat tentang usaha dan keunggulan lapak Anda.',
    city: form.city || 'Kota Anda',
    province: form.province || 'Provinsi',
    address: form.address,
    latitude: coords?.[0],
    longitude: coords?.[1],
    phone_whatsapp: form.phone_whatsapp || '081234567890',
    instagram: form.instagram || undefined,
    image_cover:
      existingImage && !file ? existingImage : file ? URL.createObjectURL(file) : undefined,
    is_verified: false,
  }

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
        invalidateUmkmCache()
        navigate('/dashboard')
      } else {
        await createUmkm(fd)
        invalidateUmkmCache()
        setSubmittedName(form.name)
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
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

  if (submitted)
    return (
      <div className="container-site mx-auto max-w-xl space-y-6 py-16 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border-2 border-wa-500 bg-wa-500/10 text-wa-600">
          <CheckCircle2 className="size-10" />
        </div>
        <div>
          <span className="stamp-verified">LAPAK BARU TERDAFTAR</span>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-ink-900">
            Berhasil didaftarkan!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Kios <strong>{submittedName}</strong> kini menunggu verifikasi admin dan siap tampil di
            peta interaktif UMKM-Go.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl text-left shadow-lg">
          <UmkmCard umkm={{ ...preview, image_cover: existingImage }} />
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/peta" className="btn btn-primary rounded-xl !px-6 !py-2.5 !text-sm font-bold">
            <MapPin className="size-4" /> Lihat di Peta
          </Link>
          <Link to="/dashboard" className="btn btn-outline rounded-xl !px-6 !py-2.5 !text-sm font-semibold">
            Buka Dashboard
          </Link>
        </div>
      </div>
    )

  return (
    <div className="container-site space-y-8 py-8 sm:py-10">
      <div className="max-w-2xl">
        <span className="label-caption">Pendaftaran gratis</span>
        <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
          {isEdit ? 'Edit lapak Anda' : 'Daftarkan lapak UMKM Anda'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Isi data lapak dalam 2 menit. Pelanggan di sekitar Anda akan langsung bisa menghubungi
          via WhatsApp — tanpa komisi, tanpa langganan.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-cabai-500/30 bg-cabai-500/10 p-4 text-sm text-cabai-600">
          <AlertCircle className="size-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <form onSubmit={submit} noValidate className="space-y-8 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
          {/* STEP 1 */}
          <section className="space-y-4">
            <SectionHeader step={1} title="Informasi lapak" />
            <div>
              <Label required>Nama usaha</Label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                placeholder="Contoh: Warung Sate Bu Siti"
                className="field"
              />
              {errors.name?.[0] && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label required>Kategori</Label>
                <select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  required
                  className="field cursor-pointer font-medium"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Website / URL</Label>
                <input
                  value={form.website_url}
                  onChange={(e) => set('website_url', e.target.value)}
                  placeholder="https://..."
                  className="field"
                />
              </div>
            </div>
            <div>
              <Label required>Deskripsi singkat</Label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                required
                placeholder="Menu andalan, keunikan produk, spesialisasi..."
                className="field resize-none"
              />
              {errors.description?.[0] && (
                <p className="mt-1 text-xs text-red-600">{errors.description[0]}</p>
              )}
            </div>
            <div>
              <Label>Foto sampul</Label>
              <FileDropzone initialPreview={existingImage} onFile={setFile} />
            </div>
          </section>

          {/* STEP 2 */}
          <section className="space-y-4">
            <SectionHeader step={2} title="Lokasi &amp; kontak" />
            <div>
              <Label required>Alamat fisik lengkap</Label>
              <input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                required
                placeholder="Jl. Contoh No. 45, RT/RW, Kelurahan, Kecamatan"
                className="field"
              />
              {errors.address?.[0] && <p className="mt-1 text-xs text-red-600">{errors.address[0]}</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label required>Provinsi</Label>
                <input
                  value={form.province}
                  onChange={(e) => set('province', e.target.value)}
                  required
                  placeholder="Jawa Barat"
                  className="field"
                />
                {errors.province?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{errors.province[0]}</p>
                )}
              </div>
              <div>
                <Label required>Kota / Kabupaten</Label>
                <input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  required
                  placeholder="Kota Malang"
                  className="field"
                />
                {errors.city?.[0] && <p className="mt-1 text-xs text-red-600">{errors.city[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label required>Nomor WhatsApp</Label>
                <input
                  value={form.phone_whatsapp}
                  onChange={(e) => set('phone_whatsapp', e.target.value)}
                  required
                  placeholder="081234567890 atau 6281234567890"
                  className="field font-mono"
                />
                <span className="mt-1 block font-mono text-[11px] text-ink-400">
                  Format bebas — otomatis dinormalkan ke +62
                </span>
              </div>
              <div>
                <Label>Instagram (opsional)</Label>
                <input
                  value={form.instagram}
                  onChange={(e) => set('instagram', e.target.value)}
                  placeholder="@usernameusaha"
                  className="field"
                />
              </div>
            </div>
          </section>

          {/* STEP 3 */}
          <section className="space-y-4">
            <SectionHeader step={3} title="Titik lokasi di peta" />
            <p className="-mt-1 text-xs text-ink-500">
              Klik peta untuk memasang pin lokasi kios. Pin bisa digeser sampai posisinya pas.
            </p>
            <div className="h-72 overflow-hidden rounded-2xl border border-ink-900/10">
              <UmkmMap
                items={[]}
                center={coords ?? [-6.2088, 106.8456]}
                zoom={coords ? 15 : 13}
                selectableLocation
                pickedLocation={coords}
                onMapClick={(lat, lng) => setCoords([lat, lng])}
                className="h-full w-full !rounded-none !border-0"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-ink-900/5 bg-cream-50 p-3 font-mono text-[11px]">
              <span className="text-ink-500">Koordinat terpilih:</span>
              <span className="font-bold tabular-nums text-ink-900">
                {coords ? `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}` : 'belum dipilih'}
              </span>
            </div>
          </section>

          <button type="submit" disabled={submitting} className="btn btn-primary w-full rounded-xl !py-3.5 !text-sm font-bold shadow-lg">
            {submitting
              ? 'Menyimpan…'
              : isEdit
                ? 'Simpan Perubahan'
                : 'Daftarkan Lapak Sekarang (Gratis)'}
          </button>
        </form>

        {/* PRATINJAU LANGSUNG */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-600">
              <Sparkles className="size-3.5" />
              <span>PRATINJAU LANGSUNG</span>
            </div>
            {categoryName && (
              <span className="category-badge text-white" style={{ backgroundColor: categoryColor(categoryName) }}>
                {categoryName}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <UmkmCard umkm={preview} />
          </div>
          <div className="space-y-1.5 rounded-xl border border-ink-900/5 bg-white p-4 text-[11px] text-ink-600">
            <p className="font-display flex items-center gap-2 text-sm font-bold text-ink-900">
              <Sparkles className="size-3.5 text-accent-500" />
              Keuntungan bergabung
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Muncul di pencarian warga sekitar kota Anda.</li>
              <li>Tombol WhatsApp langsung ke nomor Anda.</li>
              <li>Kesempatan cap verifikasi resmi.</li>
              <li>100% gratis, tanpa komisi, tanpa iklan.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
