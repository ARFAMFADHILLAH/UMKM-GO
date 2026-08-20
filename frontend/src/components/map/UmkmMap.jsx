import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Crosshair } from 'lucide-react'

const PIN_SVG = `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">
  <path d="M15 1C8.1 1 4 7.5 4 14c0 9.5 11 25 11 25s11-15.5 11-25C26 7.5 21.9 1 15 1Z" fill="var(--pin-c, #c74f28)" stroke="white" stroke-width="1.5"/>
  <circle cx="15" cy="14" r="5" fill="white"/>
</svg>`

function makePin(selected = false) {
  return L.divIcon({
    className: '',
    html: `<span style="display:grid;place-items:center;width:30px;height:40px;filter:drop-shadow(0 4px 6px rgb(33 26 20 / 0.35)) scale(${
      selected ? 1.25 : 1
    });transition:transform .15s ease">${PIN_SVG}</span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -42],
  })
}

function FitController({ coords, pins, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (pins?.length) {
      const bounds = L.latLngBounds(pins.map((p) => [Number(p.latitude), Number(p.longitude)]))
      map.fitBounds(bounds.pad(0.18))
    } else if (coords) {
      map.flyTo([coords[0], coords[1]], zoom)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, pins, zoom])
  return null
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick?.(e.latlng),
  })
  return null
}

export function LocateButton({ className = '' }) {
  const map = useMap()
  const [busy, setBusy] = useState(false)
  const locate = () => {
    setBusy(true)
    map
      .locate({ setView: true, maxZoom: 15 })
      .once('locationfound', () => setBusy(false))
      .once('locationerror', () => setBusy(false))
  }
  return (
    <button
      type="button"
      onClick={locate}
      className={`btn btn-outline px-3 py-2 text-xs shadow-sm ${className}`}
    >
      <Crosshair className="size-4 text-brand-600" />
      {busy ? 'Mencari…' : 'Lokasi saya'}
    </button>
  )
}

export default function UmkmMap({
  center = [-2.5489, 118.0149],
  zoom = 9,
  pins = [],
  onPick,
  selected,
  children,
  className = 'h-[420px] w-full',
}) {
  const hasPins = pins.length > 0
  return (
    <MapContainer
      center={hasPins ? [Number(pins[0].latitude), Number(pins[0].longitude)] : center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={`z-0 rounded-2xl shadow-[var(--shadow-card)] ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitController coords={center} pins={pins} zoom={zoom} />

      {onPick && <ClickHandler onPick={onPick} />}

      {hasPins &&
        pins.map((p) => (
          <Marker key={p.id} position={[Number(p.latitude), Number(p.longitude)]} icon={makePin(false)}>
            <Popup className="rounded-xl">
              <div className="min-w-44 font-sans">
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                  {p.category?.name}
                </p>
                <p className="mt-0.5 font-display text-sm font-semibold text-ink-900">{p.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                  {p.city}, {p.province}
                </p>
                <Link
                  to={`/umkms/${p.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
                >
                  Lihat detail →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

      {selected && (
        <Marker position={selected} icon={makePin(true)} />
      )}

      {children}
    </MapContainer>
  )
}