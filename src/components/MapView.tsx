import { useState, useMemo, useRef, useCallback } from 'react';
import { MapPin, Navigation, Star, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/lib/utils';
import { getPartners } from '@/lib/mock-data/partners';
import type { Partner, ActivityType } from '@/lib/types';

const PARTNERS = getPartners();

// Simulated map coordinates for Indian cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

// Generate pseudo-random offset for partner positions on map
function getPartnerPosition(partnerId: string, city: string) {
  const base = CITY_COORDS[city] || CITY_COORDS['Mumbai'];
  const hash = partnerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) * 0.002;
  const lngOffset = (((hash * 7) % 100) - 50) * 0.002;
  return { lat: base.lat + latOffset, lng: base.lng + lngOffset };
}

interface MapViewProps {
  selectedCity: string;
  partners: Partner[];
  selectedPartnerId: string | null;
  onSelectPartner: (id: string | null) => void;
}

export default function MapView({ selectedCity, partners, selectedPartnerId, onSelectPartner }: MapViewProps) {
  const cityCoords = CITY_COORDS[selectedCity] || CITY_COORDS['Mumbai'];

  const onlinePartners = useMemo(
    () => partners.filter(p => p.isOnline && p.location === selectedCity),
    [partners, selectedCity]
  );

  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 bg-canvas-softer">
        {/* Grid lines to simulate map */}
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

        {/* City label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-canvas/80 backdrop-blur-sm rounded-full px-4 py-1.5 border border-hairline-mid">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-semibold text-white">{selectedCity}</span>
          </div>
        </div>

        {/* Center pin for selected city */}
        <div
          className="absolute transition-all duration-700"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 animate-ping absolute inset-0" />
            <MapPin className="w-8 h-8 text-white fill-white/30 relative" />
          </div>
        </div>

        {/* Partner pins scattered around */}
        {onlinePartners.map((partner, idx) => {
          const pos = getPartnerPosition(partner.id, selectedCity);
          // Spread partners in a circle around center
          const angle = (idx / Math.max(onlinePartners.length, 1)) * Math.PI * 2;
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
                    'w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden',
                    isSelected
                      ? 'border-white shadow-lg shadow-white/30'
                      : 'border-canvas-soft hover:border-white/60'
                  )}
                >
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Online dot */}
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

        {/* No partners online message */}
        {onlinePartners.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-canvas/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-hairline-mid">
              <p className="text-body text-sm">No companions online in {selectedCity}</p>
              <p className="text-mute text-xs mt-1">Try a different city</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </div>
  );
}