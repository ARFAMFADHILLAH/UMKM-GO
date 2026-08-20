import { listUmkms } from './api'

const MAX_PAGES = 25

const umkmCache = new Map()

export async function fetchAllUmkms() {
  if (umkmCache.has('all')) return umkmCache.get('all')

  const promise = (async () => {
    const first = await listUmkms({ page: 1 })
    const totalPages = Math.min(first.last_page, MAX_PAGES)
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
        listUmkms({ page: i + 2 }),
      ),
    )
    return [first, ...rest].flatMap((r) => r.data)
  })().catch(() => [])

  umkmCache.set('all', promise)
  return promise
}

export async function gatherCities() {
  const all = await fetchAllUmkms()
  return [...new Set(all.map((u) => u.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'id'),
  )
}

export function invalidateUmkmCache() {
  umkmCache.clear()
}
