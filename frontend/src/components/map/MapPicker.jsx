import UmkmMap from './UmkmMap'
import { useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { LocateButton } from './UmkmMap'

function RecordLocationFix({ onRecord, coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, Math.max(map.getZoom(), 15))
      onRecord?.(coords)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords])
  return null
}

function CaptureCurrentLocation({ onRecord }) {
  const map = useMap()
  const capture = () => {
    map.locate({ setView: true, maxZoom: 16 }).once('locationfound', (e) => {
      onRecord([e.latlng.lat, e.latlng.lng])
    })
  }
  return (
    <button
      type="button"
      onClick={capture}
      className="btn btn-outline px-3 py-2 text-xs shadow-sm"
    >
      Pakai lokasi saya
    </button>
  )
}

export default function MapPicker({ value, onChange }) {
  const coords = Array.isArray(value) && value.length === 2 ? value : null
  return (
    <div className="relative overflow-hidden">
      <UmkmMap
        center={coords || [-7.9666, 112.6326]}
        zoom={coords ? 14 : 11}
        onPick={(latlng) => onChange([latlng.lat, latlng.lng])}
        selected={coords}
        className="h-72 w-full"
      >
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <CaptureCurrentLocation onRecord={(c) => onChange(c)} />
          <LocateButton />
        </div>
        {!coords && (
          <p className="absolute bottom-3 left-3 z-[1000] rounded-full bg-ink-900/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            Klik peta untuk menandai lokasi
          </p>
        )}
        {coords && <RecordLocationFix coords={coords} />}
      </UmkmMap>
    </div>
  )
}