// Port dari referensi src/lib/format.ts - key kategori disinkronkan dengan nama kategori backend.
// Nilai warna mengikuti DESIGN.md ?2.4 (token @theme) - diperbarui ke palet "Cerah Peta".

export const CATEGORY_COLORS = {
  'Kuliner': '#FF4D4D',          // cabai-500
  'Kerajinan Tangan': '#FF7A00', // kerajinan-500
  'Fashion': '#9B51E0',          // fashion-500
  'Jasa & Servis': '#3E7BFA',    // jasa-500 (dipisah dari hijau WA)
  'Pertanian & Perkebunan': '#5CB85C', // agro-500
}

const FALLBACK_COLOR = '#100C2A'

export function categoryColor(name) {
  return CATEGORY_COLORS[name] || FALLBACK_COLOR
}

export function formatPhoneWhatsApp(phone) {
  if (!phone) return '-'
  const clean = String(phone).replace(/[^0-9]/g, '')
  let standard = clean
  if (clean.startsWith('0')) {
    standard = '62' + clean.slice(1)
  } else if (!clean.startsWith('62')) {
    standard = '62' + clean
  }

  if (standard.length >= 11) {
    const p1 = standard.slice(0, 2)
    const p2 = standard.slice(2, 5)
    const p3 = standard.slice(5, 9)
    const p4 = standard.slice(9)
    return `+${p1} ${p2}-${p3}-${p4}`
  }
  return `+${standard}`
}

function formatRawWaNumber(phone) {
  if (!phone) return ''
  const clean = String(phone).replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) return '62' + clean.slice(1)
  if (clean.startsWith('62')) return clean
  return '62' + clean
}

export function makeWhatsAppLink(phone, umkmName, customMsg) {
  const cleanPhone = formatRawWaNumber(phone)
  if (!cleanPhone) return null

  const defaultMsg = `Halo ${umkmName}, saya menemukan lapak Anda di LOKALINK. Apakah saat ini sedang buka dan menerima pesanan?`
  const text = encodeURIComponent(customMsg || defaultMsg)

  return `https://wa.me/${cleanPhone}?text=${text}`
}

export function instagramLink(handle) {
  if (!handle) return null
  const clean = String(handle).replace(/^@/, '').trim()
  return clean ? `https://instagram.com/${clean}` : null
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(String(iso).replace(' ', 'T'))
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return ''
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} km`
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return ''
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} menit`
  const h = Math.floor(mins / 60)
  return `${h} jam ${mins % 60} menit`
}