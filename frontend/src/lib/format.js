export function waLink(phone) {
  if (!phone) return null
  const clean = String(phone).replace(/[^\d]/g, '')
  const normalized = clean.startsWith('0') ? '62' + clean.slice(1) : clean
  return `https://wa.me/${normalized}`
}

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
  const d = new Date(iso.replace(' ', 'T'))
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const CATEGORY_COLOR = {
  'Kuliner': 'bg-brand-600',
  'Kerajinan Tangan': 'bg-amber-600',
  'Fashion': 'bg-rose-600',
  'Pertanian & Perkebunan': 'bg-emerald-600',
  'Jasa & Servis': 'bg-sky-600',
}

export function categoryColor(name) {
  return CATEGORY_COLOR[name] || 'bg-ink-700'
}