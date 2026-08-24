import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronUp,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Store,
  X,
} from 'lucide-react'
import UmkmMap from '../components/map/UmkmMap'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import CategoryTabs, { LocateButton } from '../components/ui/CategoryTabs'
import { listCategories } from '../lib/api'
import { fetchAllUmkms } from '../lib/cities'
import { categoryColor, formatDistance, formatDuration, formatPhoneWhatsApp, makeWhatsAppLink } from '../lib/format'

export default function MapPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedUmkm, setSelectedUmkm] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [mapSearch, setMapSearch] = useState('')
  const [userLoc, setUserLoc] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [routeTo, setRouteTo] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

  useEffect(() => {
    Promise.all([fetchAllUmkms(), listCategories()])
      .then(([umkms, cats]) => {
        setItems(umkms)
        setCategories(cats)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'all' && String(item.category?.id ?? item.category_id) !== String(activeCategory))
        return false
      if (mapSearch.trim()) {
        const q = mapSearch.toLowerCase()
        if (
          !`${item.name} ${item.description} ${item.city}`.toLowerCase().includes(q)
        )
          return false
      }
      return item.latitude != null && item.longitude != null
    })
  }, [items, activeCategory, mapSearch])

  const currentCenter = selectedUmkm
    ? [Number(selectedUmkm.latitude), Number(selectedUmkm.longitude)]
    : userLoc
      ? userLoc
      : filteredItems[0]
        ? [Number(filteredItems[0].latitude), Number(filteredItems[0].longitude)]
        : [-2.5489, 118.0149]

  const handleLocate = () => {
    setLocLoading(true)
    if (!navigator.geolocation) {
      setLocLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude])
        setSelectedUmkm(null)
        setLocLoading(false)
      },
      () => setLocLoading(false),
      { timeout: 8000, enableHighAccuracy: true },
    )
  }

  const openDetail = (umkm) => navigate(`/umkms/${umkm.slug}`)

  const selectUmkm = (umkm) => {
    setSelectedUmkm(umkm)
    // Rute lama tidak relevan kalau targetnya berubah
    const sameTarget =
      umkm && routeTo && Number(umkm.latitude) === routeTo[0] && Number(umkm.longitude) === routeTo[1]
    if (!sameTarget) {
      setRouteTo(null)
      setRouteInfo(null)
    }
  }

  // Rute in-app: pakai lokasi user yang sudah ada, kalau belum minta dulu (presisi tinggi)
  const handleDirections = async (umkm) => {
    const target = [Number(umkm.latitude), Number(umkm.longitude)]
    if (userLoc) {
      setRouteInfo(null)
      setRouteTo(target)
      return
    }
    if (!navigator.geolocation) return
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude])
        setRouteInfo(null)
        setRouteTo(target)
        setLocLoading(false)
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  if (loading)
    return (
      <div className="mx-auto grid h-[calc(100vh-64px)] min-h-[560px] max-w-[1920px] place-items-center bg-cream-50">
        <Spinner label="Memuat petaâ€¦" />
      </div>
    )

  if (items.filter((u) => u.latitude != null).length === 0)
    return (
      <div className="container-site py-16">
        <EmptyState
          title="Belum ada pin di peta"
          description="Data lapak belum punya koordinat. Isi latitude & longitude lewat form daftar lapak."
          action={
            <Link to="/explore" className="btn btn-outline px-4 py-2 text-xs sm:text-sm">
              Lihat direktori dulu
            </Link>
          }
        />
      </div>
    )

  const selectedCatColor = selectedUmkm ? categoryColor(selectedUmkm.category?.name) : null

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] min-h-[560px] max-w-[1920px] flex-col bg-cream-50">
      {/* Top filter bar */}
      <div className="z-20 shrink-0 border-b border-ink-900/5 bg-white/90 px-3 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Cari kios di peta..."
              className="w-full rounded-lg border border-ink-900/10 bg-cream-50/60 py-2 pl-9 pr-3 text-xs text-ink-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>

          {/* Tab bar kategori - chip berwarna, scroll horizontal dengan fade */}
          <div className="relative ml-auto min-w-0 sm:flex-none">
            <CategoryTabs
              categories={categories.map((cat) => ({
                id: String(cat.id),
                label: cat.name.split(' ')[0],
                color: categoryColor(cat.name),
                count: items.filter((i) => i.category?.name === cat.name).length,
              }))}
              activeId={String(activeCategory)}
              allCount={items.filter((u) => u.latitude != null).length}
              onSelect={(id) => setActiveCategory(id)}
              actions={<LocateButton loading={locLoading} onClick={handleLocate} />}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative h-full flex-1">
          <UmkmMap
            items={filteredItems}
            selectedUmkm={selectedUmkm}
            onSelectUmkm={(umkm) => {
              selectUmkm(umkm)
              setMobileSheetExpanded(true)
            }}
            center={currentCenter}
            zoom={selectedUmkm ? 15 : 12}
            userLocation={userLoc}
            showCategoryLegend
            routeFrom={routeTo ? userLoc : null}
            routeTo={routeTo}
            onRouteInfo={setRouteInfo}
            className="h-full w-full !rounded-none !border-0"
          />
          {routeInfo?.distanceM != null && selectedUmkm && (
            <div className="absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-lg border border-map-500/30 bg-white px-3 py-1.5 text-caption font-bold shadow-md">
              <Navigation className="size-3.5 text-map-600" />
              <span>
                {formatDistance(routeInfo.distanceM)} Â· {formatDuration(routeInfo.durationS)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setRouteTo(null)
                  setRouteInfo(null)
                }}
                aria-label="Hapus rute"
                className="cursor-pointer rounded p-0.5 text-ink-400 hover:bg-cream-100 hover:text-ink-900"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {routeInfo?.error && (
            <div className="absolute left-4 top-4 z-[400] max-w-[240px] rounded-lg border border-accent-400/40 bg-white px-3 py-1.5 text-caption text-ink-700 shadow-md">
              Rute tidak bisa dihitung. Coba lagi atau geser pin lokasi Anda.
            </div>
          )}
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-caption font-semibold shadow-md">
            <Store className="size-3.5 text-accent-500" />
            <span>
              <strong>{filteredItems.length}</strong> kios
            </span>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="z-10 hidden w-[380px] shrink-0 flex-col overflow-hidden border-l border-ink-900/5 bg-white shadow-xl md:flex">
          {selectedUmkm ? (
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-ink-900/5 p-5">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="category-badge text-white !text-caption" style={{ backgroundColor: selectedCatColor }}>
                      {selectedUmkm.category?.name}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold leading-tight text-ink-900">
                    {selectedUmkm.name}
                  </h3>
                  <p className="mt-0.5 tabular-nums text-caption text-ink-500">
                    {selectedUmkm.city}, {selectedUmkm.province}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUmkm(null)}
                  aria-label="Tutup detail"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-cream-50 hover:text-ink-900"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="custom-scroll flex-1 space-y-4 overflow-y-auto bg-cream-50/30 p-5">
                {selectedUmkm.image_cover && (
                  <div className="aspect-[16/9] relative overflow-hidden rounded-xl border border-ink-900/10 shadow-sm">
                    <img
                      src={selectedUmkm.image_cover}
                      alt={`Foto ${selectedUmkm.name}`}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                )}

                <p className="text-sm leading-relaxed text-ink-700">{selectedUmkm.description}</p>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-ink-900/5 bg-white p-3 text-caption">
                  <span className="text-ink-500">Kota</span>
                  <span className="truncate text-right font-bold text-ink-900">{selectedUmkm.city}</span>
                  <span className="text-ink-500">WhatsApp</span>
                  <span className="text-right font-bold tabular-nums text-ink-900">
                    {formatPhoneWhatsApp(selectedUmkm.phone_whatsapp)}
                  </span>
                  <span className="text-ink-500">Bergabung</span>
                  <span className="text-right text-ink-900">
                    {new Date(String(selectedUmkm.created_at).replace(' ', 'T')).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-xs text-ink-700">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent-500" />
                  <span>{selectedUmkm.address || 'Alamat belum dicantumkan.'}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-ink-900/5 bg-white p-4">
                <a
                  href={makeWhatsAppLink(selectedUmkm.phone_whatsapp, selectedUmkm.name, `Halo ${selectedUmkm.name}, saya melihat lapak Anda di peta UMKM-GO.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa w-full justify-center rounded-xl !py-3 !text-sm font-bold"
                >
                  <MessageCircle className="size-4" />
                  Hubungi via WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(selectedUmkm)}
                    className="btn btn-outline rounded-lg !py-2 !text-xs"
                  >
                    Profil lengkap
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirections(selectedUmkm)}
                    className="btn btn-outline rounded-lg !py-2 !text-xs"
                  >
                    <Navigation className={`size-3.5 ${locLoading ? 'animate-pulse text-map-600' : 'text-accent-500'}`} />
                    {routeTo ? 'Rute aktif' : 'Petunjuk arah'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="custom-scroll flex flex-1 flex-col overflow-y-auto p-4">
              <div className="mb-4">
                <span className="label-caption">Terdekat</span>
                <h3 className="font-display text-base font-bold text-ink-900">
                  {filteredItems.length} kios di area ini
                </h3>
                <p className="mt-0.5 text-caption text-ink-500">
                  Klik kios di daftar atau pin di peta untuk melihat detail.
                </p>
              </div>
              <div className="space-y-2.5">
                {filteredItems.map((item) => {
                  const col = categoryColor(item.category?.name)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectUmkm(item)}
                      className="flex w-full gap-3 rounded-xl border border-ink-900/5 bg-white p-3 text-left transition-all hover:border-ink-900/15 hover:bg-cream-50/80"
                    >
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-ink-900/5 bg-cream-100">
                        {item.image_cover ? (
                          <img src={item.image_cover} alt={`Foto ${item.name}`} loading="lazy" className="size-full object-cover" />
                        ) : (
                          <span className="grid size-full place-items-center" style={{ backgroundColor: `${col}14` }}>
                            <Store className="size-5" style={{ color: col }} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="category-badge !py-0 text-white !text-caption" style={{ backgroundColor: col }}>
                            {item.category?.name}
                          </span>
                        </div>
                        <h4 className="font-display truncate text-xs font-bold leading-tight text-ink-900">
                          {item.name}
                        </h4>
                        <span className="mt-0.5 block truncate text-caption text-ink-500">
                          {item.city}, {item.province}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Mobile bottom sheet */}
        {selectedUmkm && (
          <div
            className={`absolute inset-x-0 bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t border-ink-900/10 bg-white shadow-2xl transition-all duration-300 md:hidden ${
              mobileSheetExpanded ? '' : 'max-h-[220px]'
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
              className="flex shrink-0 cursor-pointer items-center justify-between bg-white p-3"
            >
              <div aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-200" />
              <div className="mt-1.5 flex min-w-0 flex-1 items-center gap-2 pr-2">
                <span className="category-badge shrink-0 text-white !text-caption" style={{ backgroundColor: selectedCatColor }}>
                  {selectedUmkm.category?.name}
                </span>
                <h4 className="font-display truncate text-sm font-bold leading-tight text-ink-900">
                  {selectedUmkm.name}
                </h4>
              </div>
              <div className="mt-1.5 flex shrink-0 items-center gap-1.5">
                <ChevronUp className={`size-4 text-ink-400 transition-transform ${mobileSheetExpanded ? 'rotate-180' : ''}`} />
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Tutup"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedUmkm(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedUmkm(null)}
                  className="p-1 text-ink-400"
                >
                  <X className="size-4" />
                </span>
              </div>
            </button>

            <div className="custom-scroll flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex items-start gap-3">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-ink-900/10 bg-cream-100">
                  {selectedUmkm.image_cover && (
                    <img src={selectedUmkm.image_cover} alt={`Foto ${selectedUmkm.name}`} loading="lazy" className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-700">{selectedUmkm.description}</p>
                  <div className="mt-2 flex items-center justify-between tabular-nums text-caption">
                    <span className="truncate font-bold text-ink-900">{selectedUmkm.city}</span>
                    <span className="font-bold tabular-nums text-wa-600">
                      {formatPhoneWhatsApp(selectedUmkm.phone_whatsapp)}
                    </span>
                  </div>
                </div>
              </div>

              {mobileSheetExpanded && (
                <div className="space-y-3 border-t border-ink-900/5 pt-2">
                  <div className="flex items-start gap-2 text-caption text-ink-700">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent-500" />
                    <span>{selectedUmkm.address || 'Alamat belum dicantumkan.'}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDirections(selectedUmkm)}
                  className={`btn justify-center rounded-lg !py-2.5 !text-xs font-bold ${
                    routeTo ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  <Navigation className={`size-4 ${locLoading ? 'animate-pulse text-map-600' : 'text-map-600'}`} />
                  Rute
                </button>
                <a
                  href={makeWhatsAppLink(selectedUmkm.phone_whatsapp, selectedUmkm.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa justify-center rounded-lg !py-2.5 !text-xs font-bold"
                >
                  <MessageCircle className="size-4" />
                  Chat WA
                </a>
                <button
                  type="button"
                  onClick={() => openDetail(selectedUmkm)}
                  className="btn btn-outline justify-center rounded-lg !py-2.5 !text-xs font-bold"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
