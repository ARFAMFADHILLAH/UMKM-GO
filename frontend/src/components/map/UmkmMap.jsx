import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { categoryColor, makeWhatsAppLink } from '../../lib/format';
import 'leaflet/dist/leaflet.css';

export const CATEGORY_PIN_COLOR = {
  'Kuliner': '#FF4D4D',
  'Kerajinan Tangan': '#FF7A00',
  'Fashion': '#9B51E0',
  'Jasa & Servis': '#3E7BFA',
  'Pertanian & Perkebunan': '#5CB85C',
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
        <path d="M3 15L5.5 5.2C6 4 7.1 3.2 8.3 3.2H31.7c1.2 0 2.3 0.8 2.8 2L37 15H3Z" fill="#ffffff" stroke="rgba(16,12,42,0.08)" stroke-width="1"/>
        {/* Roof canopy */}
        <path d="M4 15L6.4 6.1C6.8 5 7.7 4.2 8.8 4.2H31.2c1.1 0 2.1 0.8 2.4 1.9L36 15H4Z" fill="${color}" stroke="#100C2A" stroke-width="1.3" stroke-linejoin="round"/>
        {/* scallop edge */}
        <path d="M4 15c0 2.2 1.8 3.2 3.3 1.7 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0 1.5 1.5 3.9 1.5 5.4 0c1.5 1.5 3.3 0.5 3.3-1.7" fill="${color}" stroke="#100C2A" stroke-width="1.1"/>
        {/* canopy vertical seams (more subtle) */}
        <path d="M9.2 4.5L7.8 15M16 4.2L16 15M20 4.2L20 15M24 4.2L24 15M30.8 4.5L32.2 15" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.0" stroke-linecap="round"/>
        {/* building body */}
        <rect x="6.5" y="16.5" width="27" height="19" rx="2.5" fill="#FFFFFF" stroke="#100C2A" stroke-width="1.3"/>
        {/* window / display */}
        <rect x="9.5" y="20" width="21" height="10.5" rx="1.5" fill="${color}" fill-opacity="0.18"/>
        <rect x="9.5" y="20" width="21" height="10.5" rx="1.5" stroke="${color}" stroke-width="1.1"/>
        {/* counter */}
        <rect x="12" y="27" width="16" height="3.5" rx="0.8" fill="#100C2A"/>
        {/* tail - menunjuk ke titik koordinat */}
        <path d="M17 36H23L20 50Z" fill="#100C2A" stroke="#100C2A" stroke-width="0.8" stroke-linejoin="round"/>
      </svg>
      ${
        label
          ? `<div style="position:absolute; bottom:-22px; left:50%; transform:translateX(-50%); white-space:nowrap; background:#100C2A; color:#FFC300; font-size:10px; font-weight:700; font-family:'Poppins',sans-serif; padding:3px 8px; border-radius:999px; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 12px rgba(16,12,42,0.25);">${label}</div>`
          : ''
      }
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
  routeFrom,
  routeTo,
  onRouteInfo,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pickedMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

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
    routeLayerRef.current = L.layerGroup().addTo(map);
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
        iconSize: [isSelected ? 48 : 40, isSelected ? 65 : 54],
        // Ujung bawah pin = titik koordinat (tanpa offset CSS tambahan)
        iconAnchor: [isSelected ? 24 : 20, isSelected ? 65 : 54],
        popupAnchor: [0, isSelected ? -68 : -58],
      });

      const marker = L.marker([Number(umkm.latitude), Number(umkm.longitude)], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 10,
        title: umkm.name,
      });

      const waLink = makeWhatsAppLink(
        umkm.phone_whatsapp,
        umkm.name,
        `Halo ${umkm.name}, saya melihat lapak Anda di peta LOKALINK.`
      );

      const popupHtml = `
        <div style="font-family:'Switzer',sans-serif; width:240px; padding:14px; background:#fff;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <span style="font-size:10px; font-family:'Poppins',sans-serif; font-weight:700; color:#fff; background:${catColor}; padding:3px 7px; border-radius:4px; letter-spacing:0.06em; text-transform:uppercase;">
              ${umkm.category?.name ?? ''}
            </span>
          </div>
          <h4 style="font-family:'Poppins',sans-serif; font-weight:700; font-size:14px; color:#100C2A; margin:2px 0 6px 0; line-height:1.25; letter-spacing:-0.01em;">
            ${umkm.name}
          </h4>
          <p style="font-size:11px; color:#55506E; margin:0 0 10px 0; line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${umkm.description ?? ''}
          </p>
          <div style="display:flex; align-items:center; justify-content:flex-end; border-top:1px solid #E7E9EF; padding-top:8px; margin-top:4px;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:#fff; background:#25A56A; padding:5px 10px; border-radius:8px; text-decoration:none; box-shadow:0 2px 6px -1px rgba(37,165,106,0.4);">
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
        html: makeStallPinHtml('#FFC300', true, 'BARU'),
        iconSize: [48, 65],
        iconAnchor: [24, 65],
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
            <div style="position:absolute; inset:0; background:#00B4D8; opacity:0.2; border-radius:9999px; animation:ping-user 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute; top:3px; left:3px; width:16px; height:16px; background:#00B4D8; border:3px solid #ffffff; border-radius:9999px; box-shadow:0 2px 6px rgba(16,12,42,0.3);"></div>
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

  // Rute dalam aplikasi via OSRM (open source, tanpa API key)
  // Deps pakai nilai primitif (lat/lng), BUKAN referensi array - kalau parent
  // membuat ulang array tiap render, efek tidak ikut terpicu (mencegah loop
  // fetch + fitBounds yang bikin zoom in/out berulang).
  const fromLat = Array.isArray(routeFrom) ? routeFrom[0] : null;
  const fromLng = Array.isArray(routeFrom) ? routeFrom[1] : null;
  const toLat = Array.isArray(routeTo) ? routeTo[0] : null;
  const toLng = Array.isArray(routeTo) ? routeTo[1] : null;

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const hasFrom = Number.isFinite(fromLat) && Number.isFinite(fromLng);
    const hasTo = Number.isFinite(toLat) && Number.isFinite(toLng);
    if (!hasFrom || !hasTo) return;

    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const route = json?.routes?.[0];
        if (!route?.geometry) {
          onRouteInfo?.({ error: true });
          return;
        }
        const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        L.polyline(latlngs, {
          color: '#0092B2',
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
        }).addTo(layer);
        L.polyline(latlngs, {
          color: '#00B4D8',
          weight: 4.5,
          opacity: 1,
          lineCap: 'round',
        }).addTo(layer);
        L.circleMarker([fromLat, fromLng], {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: '#00B4D8',
          fillOpacity: 1,
        }).addTo(layer);
        map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
        onRouteInfo?.({
          distanceM: route.distance,
          durationS: route.duration,
        });
      })
      .catch(() => {
        if (!cancelled) onRouteInfo?.({ error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [fromLat, fromLng, toLat, toLng, onRouteInfo]);

  return (
    <div className="relative isolate w-full h-full overflow-hidden rounded-2xl border border-ink-900/10 shadow-sm">
      <div ref={mapContainerRef} className={className} />

      {showCategoryLegend && (
        <div className="absolute top-3 left-3 z-400 bg-white/95 backdrop-blur-md border border-ink-900/10 rounded-xl p-3 shadow-lg text-caption hidden sm:block">
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
              <span className="w-2.5 h-2.5 rounded-full bg-jasa-500 ring-2 ring-white shadow-sm" />
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