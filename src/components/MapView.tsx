import { useMemo, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { cn } from '@/utils/cn';
import { distanceKm } from '@/lib/utils';
import type { Partner } from '@/lib/types';

// Google Maps API key — set VITE_GOOGLE_MAPS_API_KEY in .env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
console.log('[MapView] Google Maps API key loaded:', GOOGLE_MAPS_API_KEY ? `✓ (${GOOGLE_MAPS_API_KEY.slice(0, 10)}...)` : '✗ MISSING — check .env and restart dev server');

interface MapViewProps {
  selectedCity: string;
  partners: Partner[];
  selectedPartnerId: string | null;
  onSelectPartner: (id: string | null) => void;
  userCoords?: { lat: number; lng: number } | null;
}

// ── Inner map component that uses useMap hook ──
function MapInner({
  selectedCity,
  partners,
  selectedPartnerId,
  onSelectPartner,
  userCoords,
}: MapViewProps) {
  const map = useMap();

  // Filter partners to those near the user (within 50km) — same logic as search form
  const nearbyPartners = useMemo(() => {
    if (!userCoords) return partners.filter(p => p.isOnline);
    return partners
      .filter(p => p.isOnline && p.coords)
      .filter(p => distanceKm(userCoords, p.coords) <= 50)
      .sort((a, b) => distanceKm(userCoords, a.coords) - distanceKm(userCoords, b.coords));
  }, [partners, userCoords]);

  // Fly to user location when available
  useEffect(() => {
    if (!map) return;
    if (userCoords) {
      map.panTo(userCoords);
      map.setZoom(13);
    }
  }, [map, userCoords]);

  return (
    <>
      {/* User location marker */}
      {userCoords && (
        <AdvancedMarker position={userCoords}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-10 h-10 rounded-full bg-blue-500/20 animate-ping" />
            <div className="absolute w-6 h-6 rounded-full bg-blue-500/30" />
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
          </div>
        </AdvancedMarker>
      )}

      {/* Location label */}
      <AdvancedMarker position={userCoords ?? { lat: 19.076, lng: 72.8777 }}>
        <div className="flex flex-col items-center">
          <div className="bg-canvas/80 backdrop-blur-sm rounded-full px-3 py-1 border border-hairline-mid shadow-lg">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-[11px] font-semibold text-white">{selectedCity}</span>
            </div>
          </div>
        </div>
      </AdvancedMarker>

      {/* Partner markers */}
      {nearbyPartners.map((partner) => {
        if (!partner.coords) return null;
        const isSelected = selectedPartnerId === partner.id;

        return (
          <AdvancedMarker
            key={partner.id}
            position={partner.coords}
            onClick={() => {
              onSelectPartner(isSelected ? null : partner.id);
            }}
          >
            <div
              className={cn(
                'relative transition-transform duration-200',
                isSelected ? 'scale-125 z-50' : 'hover:scale-110'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 overflow-hidden shadow-lg',
                  isSelected
                    ? 'border-white shadow-white/30'
                    : 'border-canvas-soft hover:border-white/60'
                )}
              >
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500 border-2 border-canvas" />
              {isSelected && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-canvas border border-hairline-mid rounded-full px-2.5 py-0.5 shadow-lg">
                  <span className="text-[10px] sm:text-xs font-semibold text-white">
                    {partner.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* No partners overlay */}
      {nearbyPartners.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center bg-canvas/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-hairline-mid pointer-events-auto">
            <p className="text-body text-sm">No companions near {selectedCity}</p>
            <p className="text-mute text-xs mt-1">Try expanding your search</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function MapView(props: MapViewProps) {
  const { userCoords } = props;
  const defaultCenter = userCoords ?? { lat: 19.076, lng: 72.8777 };

  // If no API key, show fallback with Google Maps link
  if (!GOOGLE_MAPS_API_KEY) {
    return <MapFallback {...props} />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="companion-app-map"
          gestureHandling="greedy"
          disableDefaultUI={true}
          colorScheme="DARK"
          className="w-full h-full"
          onClick={() => props.onSelectPartner(null)}
        >
          <MapInner {...props} />
        </Map>
      </APIProvider>

      {/* Bottom gradient fade for sheet blending */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </div>
  );
}

// ── Fallback: simulated map + Google Maps link ──
function MapFallback({ selectedCity, partners, selectedPartnerId, onSelectPartner, userCoords }: MapViewProps) {
  const center = userCoords ?? { lat: 19.076, lng: 72.8777 };

  const nearbyPartners = useMemo(() => {
    if (!userCoords) return partners.filter(p => p.isOnline);
    return partners
      .filter(p => p.isOnline && p.coords)
      .filter(p => distanceKm(userCoords, p.coords) <= 50);
  }, [partners, userCoords]);

  const googleMapsUrl = `https://www.google.com/maps/@${center.lat},${center.lng},13z`;

  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden">
      <div className="absolute inset-0 bg-canvas-softer">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-canvas/80 backdrop-blur-sm rounded-full px-4 py-1.5 border border-hairline-mid z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-semibold text-white">{selectedCity}</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 animate-ping absolute inset-0" />
            <MapPin className="w-8 h-8 text-white fill-white/30 relative" />
          </div>
        </div>

        {nearbyPartners.map((partner, idx) => {
          const angle = (idx / Math.max(nearbyPartners.length, 1)) * Math.PI * 2;
          const radius = 80 + (idx % 3) * 40;
          const x = 50 + Math.cos(angle) * (radius / 3);
          const y = 50 + Math.sin(angle) * (radius / 3);
          const isSelected = selectedPartnerId === partner.id;

          return (
            <button
              key={partner.id}
              onClick={() => onSelectPartner(isSelected ? null : partner.id)}
              className="absolute transition-all duration-300 hover:z-20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.3 : 1})`,
                zIndex: isSelected ? 10 : 1,
              }}
            >
              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 overflow-hidden',
                    isSelected
                      ? 'border-white shadow-lg shadow-white/30'
                      : 'border-canvas-soft hover:border-white/60'
                  )}
                >
                  <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-canvas" />
                {isSelected && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-canvas border border-hairline-mid rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-semibold text-white">{partner.name.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {nearbyPartners.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-canvas/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-hairline-mid">
              <p className="text-body text-sm">No companions near {selectedCity}</p>
              <p className="text-mute text-xs mt-1">Try expanding your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Open in Google Maps link */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-canvas/80 backdrop-blur-sm rounded-full px-3 py-2 border border-hairline-mid hover:bg-surface-pressed transition-colors"
      >
        <MapPin className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-medium text-white">Open in Maps</span>
      </a>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </div>
  );
}