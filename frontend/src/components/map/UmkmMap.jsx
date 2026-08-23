import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { categoryColor, makeWhatsAppLink } from '../../lib/format';
import 'leaflet/dist/leaflet.css';

export const CATEGORY_PIN_COLOR = {
  'Kuliner': '#D1432B',
  'Kerajinan Tangan': '#D1772F',
  'Fashion': '#824FA5',
  'Jasa & Servis': '#1F8A5B',
  'Pertanian & Perkebunan': '#78893F',
};

function pinColor(categoryName) {
  return CATEGORY_PIN_COLOR[categoryName] || categoryColor(categoryName);
}

/**
 * Modern kios/tenda stall pin SVG dengan aksen outline putih dan drop shadow lebih tajam.
 */
export function makeStallPinHtml(color, selected = false, label) {
  const scale = selected ? 1.2 : 1;
  const width = Math.round(40 * scale);
  const height = Math.round(54 * scale);

  return `
    <div class="stall-pin-wrapper ${selected ? 'selected' : ''}" style="width: ${width}px; height: ${height}px;">
      <svg width="${width}" height="${height}" viewBox="0 0 40 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* white outer halo */}
        <path d="M3 15L5.5 5.2C6 4 7.1 3.2 8.3 3.2H31.7c1.2 0 2.3 0.8 2.8 2L37 15H3Z" fill="#ffffff" stroke="rgba(21,25,20,0.08)" stroke-width="1"/>
        {/* Roof canopy */}
        <path d="M4 15L6.4 6.1C6.8 5 7.7 4.2 8.8 4.2H31.2c1.1 0 2.1 0.8 2.4 1.9L36 15H4Z" fill="${color}" stroke="#151914" stroke-width="1.3" stroke-linejoin="round"/>
        {/* scallop edge */}
        <path d="M4 15c0 2.2 1.8 3.2 3.3 1.7 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0c1.5 1.5 3.3 0.5 3.3-1.7" fill="${color}" stroke="#151914" stroke-width="1.1"/>
        {/* canopy vertical seams (more subtle) */}
        <path d="M9.2 4.5L7.8 15M16 4.2L16 15M20 4.2L20 15M24 4.2L24 15M30.8 4.5L32.2 15" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.0" stroke-linecap="round"/>
        {/* building body */}
        <rect x="6.5" y="16.5" width="27" height="19" rx="2.5" fill="#FBF7EE" stroke="#151914" stroke-width="1.3"/>
        {/* window / display */}
        <rect x="9.5" y="20" width="21" height="10.5" rx="1.5" fill="${color}" fill-opacity="0.18"/>
        <rect x="9.5" y="20" width="21" height="10.5" rx="1.5" stroke="${color}" stroke-width="1.1"/>
        {/* counter */}
        <rect x="12" y="27" width="16" height="3.5" rx="0.8" fill="#1F334F"/>
        {/* pole tip */}
        <path d="M20 36L15.5 47H24.5L20 36Z" fill="#151914" stroke="#151914" stroke-width="0.8" stroke-linejoin="round"/>
      </svg>
      ${
        label
          ? `<div style="position:absolute; bottom:-22px; left:50%; transform:translateX(-50%); white-space:nowrap; background:#151914; color:#F1B23A; font-size:10px; font-weight:700; font-family:'JetBrains Mono', monospace; padding:3px 8px; border-radius:999px; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 12px rgba(21,25,20,0.25);">${label}</div>`
          : ''
      }
      <div class="stall-pin-anchor ${selected ? 'selected' : ''}"></div>
    </div>
  `;
}

export function UmkmMap({
  items,
  selectedUmkm,
  onSelectUmkm,
  center = [-2.5489, 118.0149],
  zoom = 13,
  interactive = true,
  className = 'w-full h-full min-h-[350px]',
  userLocation,
  showCategoryLegend = false,
  onMapClick,
  selectableLocation = false,
  pickedLocation,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pickedMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive ? 'center' : false,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on('click', (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true, duration: 0.4 });
    }
  }, [center?.[0], center?.[1], zoom]);

  const renderStallMarkers = () => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();

    items.forEach((umkm) => {
      if (umkm.latitude == null || umkm.longitude == null) return;
      const isSelected = selectedUmkm?.id === umkm.id;
      const catColor = pinColor(umkm.category?.name);

      const customIcon = L.divIcon({
        className: 'custom-stall-icon',
        html: makeStallPinHtml(catColor, isSelected),
        iconSize: [isSelected ? 48 : 40, isSelected ? 64 : 54],
        iconAnchor: [isSelected ? 24 : 20, isSelected ? 54 : 54],
        popupAnchor: [0, isSelected ? -60 : -56],
      });

      const marker = L.marker([Number(umkm.latitude), Number(umkm.longitude)], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 10,
        title: umkm.name,
      });

      const waLink = makeWhatsAppLink(
        umkm.phone_whatsapp,
        umkm.name,
        `Halo ${umkm.name}, saya melihat lapak Anda di peta UMKM-Go.`
      );

      const popupHtml = `
        <div style="font-family:'Inter',sans-serif; width:240px; padding:14px; background:#fff;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <span style="font-size:10px; font-family:'JetBrains Mono',monospace; font-weight:700; color:#fff; background:${catColor}; padding:3px 7px; border-radius:4px; letter-spacing:0.06em; text-transform:uppercase;">
              ${umkm.category?.name ?? ''}
            </span>
          </div>
          <h4 style="font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:14px; color:#151914; margin:2px 0 6px 0; line-height:1.25; letter-spacing:-0.01em;">
            ${umkm.name}
          </h4>
          <p style="font-size:11px; color:#5C6256; margin:0 0 10px 0; line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${umkm.description ?? ''}
          </p>
          <div style="display:flex; align-items:center; justify-content:flex-end; border-top:1px solid #E4D9C1; padding-top:8px; margin-top:4px;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:#fff; background:#1F8A5B; padding:5px 10px; border-radius:8px; text-decoration:none; box-shadow:0 2px 6px -1px rgba(22,110,72,0.4);">
              WhatsApp
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -12], autoPanPadding: [60, 60] });

      marker.on('click', () => {
        if (onSelectUmkm) onSelectUmkm(umkm);
      });

      markersLayer.addLayer(marker);
    });
  };

  useEffect(() => { renderStallMarkers(); }, [items, selectedUmkm, onSelectUmkm]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectableLocation) return;
    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }
    if (pickedLocation) {
      const pickerIcon = L.divIcon({
        className: 'picker-icon',
        html: makeStallPinHtml('#E39B17', true, 'BARU'),
        iconSize: [48, 64],
        iconAnchor: [24, 54],
      });
      pickedMarkerRef.current = L.marker(pickedLocation, {
        icon: pickerIcon,
        zIndexOffset: 1500,
        draggable: true,
      }).addTo(map);
      pickedMarkerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (onMapClick) onMapClick(lat, lng);
      });
    }
  }, [pickedLocation, selectableLocation, onMapClick]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-loc-icon',
        html: `
          <div style="position:relative; width:22px; height:22px;">
            <div style="position:absolute; inset:0; background:#1F334F; opacity:0.2; border-radius:9999px; animation:ping-user 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute; top:3px; left:3px; width:16px; height:16px; background:#1F334F; border:3px solid #ffffff; border-radius:9999px; box-shadow:0 2px 6px rgba(21,25,20,0.3);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      userMarkerRef.current = L.marker(userLocation, {
        icon: userIcon,
        zIndexOffset: 999,
        title: 'Posisi Anda',
      }).addTo(map);
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedUmkm && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedUmkm.latitude, selectedUmkm.longitude],
        Math.max(mapInstanceRef.current.getZoom(), 15),
        { duration: 0.5 }
      );
    }
  }, [selectedUmkm]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-ink-900/10 shadow-sm">
      <div ref={mapContainerRef} className={className} />

      {showCategoryLegend && (
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-ink-900/10 rounded-xl p-3 shadow-lg text-[11px] hidden sm:block">
          <span className="label-caption block mb-2">Warna Kios</span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cabai-500 ring-2 ring-white shadow-sm" />
              <span className="text-ink-700 font-medium">Kuliner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-kerajinan-500 ring-2 ring-white shadow-sm" />
              <span className="text-ink-700 font-medium">Kerajinan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-fashion-500 ring-2 ring-white shadow-sm" />
              <span className="text-ink-700 font-medium">Fashion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-wa-500 ring-2 ring-white shadow-sm" />
              <span className="text-ink-700 font-medium">Jasa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-agro-500 ring-2 ring-white shadow-sm" />
              <span className="text-ink-700 font-medium">Pertanian</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UmkmMap;

