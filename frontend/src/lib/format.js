// Port dari referensi src/lib/format.ts — key kategori disinkronkan dengan nama kategori backend.
// Nilai warna mengikuti DESIGN.md §2.4 (token @theme).

export const CATEGORY_COLORS = {
  'Kuliner': '#D1432B', // cabai-500
  'Kerajinan Tangan': '#D1772F', // kerajinan-500
  'Fashion': '#824FA5', // fashion-500
  'Jasa & Servis': '#1F8A5B', // wa-500
  'Pertanian & Perkebunan': '#78893F', // agro-500
}

const FALLBACK_COLOR = '#1F334F'

export function categoryColor(name) {
  return CATEGORY_COLORS[name] || FALLBACK_COLOR
}

export function categoryTextColor(name) {
  switch (name) {
    case 'Kuliner':
      return 'text-cabai-500'
    case 'Kerajinan Tangan':
      return 'text-kerajinan-500'
    case 'Fashion':
      return 'text-fashion-500'
    case 'Jasa & Servis':
      return 'text-wa-500'
    case 'Pertanian & Perkebunan':
      return 'text-agro-500'
    default:
      return 'text-brand-500'
  }
}

export function categoryBgLight(name) {
  switch (name) {
    case 'Kuliner':
      return 'bg-cabai-500/10 text-cabai-500 border-cabai-500/30'
    case 'Kerajinan Tangan':
      return 'bg-kerajinan-500/10 text-kerajinan-500 border-kerajinan-500/30'
    case 'Fashion':
      return 'bg-fashion-500/10 text-fashion-500 border-fashion-500/30'
    case 'Jasa & Servis':
      return 'bg-wa-500/10 text-wa-500 border-wa-500/30'
    case 'Pertanian & Perkebunan':
      return 'bg-agro-500/10 text-agro-500 border-agro-500/30'
    default:
      return 'bg-cream-200 text-ink-900 border-cream-300'
  }
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

  const defaultMsg = `Halo ${umkmName}, saya menemukan lapak Anda di UMKM-Go. Apakah saat ini sedang buka dan menerima pesanan?`
  const text = encodeURIComponent(customMsg || defaultMsg)

  return `https://wa.me/${cleanPhone}?text=${text}`
}

// Alias lama
export const waLink = makeWhatsAppLink

export function instagramLink(handle) {
  if (!handle) return null
  const clean = String(handle).replace(/^@/, '').trim()
  return clean ? `https://instagram.com/${clean}` : null
}

export function withBase(url) {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  return url
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(String(iso).replace(' ', 'T'))
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
