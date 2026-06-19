import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bell, MapPin, Navigation, Locate, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import MapView, { CITY_COORDS } from '@/components/MapView';
import DraggableBottomSheet from '@/components/DraggableBottomSheet';
import CompanionSearchForm from '@/components/CompanionSearchForm';
import { getPartners } from '@/lib/mock-data/partners';

const PARTNERS = getPartners();

type LocationStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

function findNearestCity(lat: number, lng: number): string {
  let nearest = 'Mumbai';
  let minDist = Infinity;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const d = Math.sqrt((coords.lat - lat) ** 2 + (coords.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  return nearest;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Location permission flow
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = useCallback(() => {
    setLocationStatus('requesting');

    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        const city = findNearestCity(latitude, longitude);
        setSelectedCity(city);
        setLocationStatus('granted');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('unavailable');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const selectedPartner = useMemo(
    () => PARTNERS.find(p => p.id === selectedPartnerId) ?? null,
    [selectedPartnerId]
  );

  // ── Location Permission Screen ──
  if (locationStatus === 'requesting' || locationStatus === 'denied' || locationStatus === 'unavailable') {
    return (
      <div className="h-screen w-screen bg-canvas flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Animated map icon */}
        <div className="relative mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-canvas-softer flex items-center justify-center">
            {locationStatus === 'requesting' ? (
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
            ) : (
              <Locate className="w-8 h-8 sm:w-10 sm:h-10 text-mute" />
            )}
          </div>
          {locationStatus === 'requesting' && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-white text-center mb-2">
          {locationStatus === 'requesting'
            ? 'Finding you…'
            : 'Location access needed'}
        </h1>

        <p className="text-sm text-body text-center max-w-[280px] sm:max-w-[320px] mb-6 sm:mb-8">
          {locationStatus === 'requesting'
            ? 'We need your location to show companions near you'
            : locationStatus === 'denied'
              ? 'Location permission was denied. We need it to show nearby companions on the map.'
              : 'Geolocation is not supported by your browser. Please use a modern browser.'}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[280px] sm:max-w-[320px]">
          {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
            <>
              <button
                onClick={requestLocation}
                className="w-full py-3 sm:py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {locationStatus === 'denied' ? 'Enable location' : 'Try again'}
              </button>

              <button
                onClick={() => setLocationStatus('granted')}
                className="w-full py-3 sm:py-3.5 bg-canvas-softer text-body text-sm font-medium rounded-xl hover:bg-surface-pressed transition-colors"
              >
                Continue without location
              </button>
            </>
          )}

          {locationStatus === 'requesting' && (
            <button
              onClick={() => setLocationStatus('granted')}
              className="w-full py-3 sm:py-3.5 bg-canvas-softer text-body text-sm font-medium rounded-xl hover:bg-surface-pressed transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        {locationStatus === 'denied' && (
          <div className="mt-4 sm:mt-6 flex items-start gap-2 bg-canvas-soft rounded-xl p-3 max-w-[280px] sm:max-w-[320px]">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-mute leading-relaxed">
              You can enable location in your browser's address bar → Site settings → Location → Allow
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Main Map UI ──
  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden relative">
      {/* ── Floating Header ── */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3 sm:px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <div className="flex items-center justify-between h-11 sm:h-12 bg-canvas/70 backdrop-blur-xl rounded-2xl px-2.5 sm:px-3 border border-hairline-mid/50">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-[10px] sm:text-xs">🤝</span>
            </div>
            <span className="font-bold text-white text-xs sm:text-sm font-display hidden xs:inline">Companion</span>
          </div>

          {/* City pill */}
          <button
            onClick={requestLocation}
            className="flex items-center gap-1 sm:gap-1.5 bg-canvas-softer rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-body hover:bg-surface-pressed transition-colors"
            aria-label="Update location"
          >
            {userCoords ? (
              <Locate className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
            ) : (
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white flex-shrink-0" />
            )}
            <span className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px]">{selectedCity}</span>
          </button>

          {/* Notification + Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative">
              <button
                className="relative p-1 sm:p-1.5 hover:bg-surface-pressed rounded-full transition-colors"
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-ink" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-canvas-soft rounded-2xl shadow-xl border border-hairline-mid overflow-hidden z-50">
                  <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b border-hairline-mid">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                  </div>
                  <div className="flex flex-col items-center justify-center py-5 sm:py-6 px-3 sm:px-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-pressed flex items-center justify-center mb-2">
                      <Bell className="w-4 h-4 text-body" />
                    </div>
                    <p className="text-sm font-medium text-body">No notifications</p>
                    <p className="text-xs text-mute mt-0.5">You're all caught up!</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="hover:ring-2 hover:ring-white/30 rounded-full transition-all"
              aria-label="Open profile"
            >
              <Avatar src="https://randomuser.me/api/portraits/men/75.jpg" alt="Arjun Sharma" size="sm" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Full-screen Map ── */}
      <div className="absolute inset-0 z-0">
        <MapView
          selectedCity={selectedCity}
          partners={PARTNERS}
          selectedPartnerId={selectedPartnerId}
          onSelectPartner={setSelectedPartnerId}
          userCoords={userCoords}
        />
      </div>

      {/* ── Selected Partner Route Card ── */}
      {selectedPartner && (
        <div className="absolute bottom-[52%] sm:bottom-[48%] left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 z-20 animate-slide-up">
          <div className="bg-canvas-soft rounded-2xl border border-hairline-mid p-3 sm:p-4 shadow-2xl shadow-black/60">
            {/* Route visualization */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-canvas-soft" />
                <div className="w-0.5 h-4 sm:h-6 bg-hairline-mid" />
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-mute">Your location</p>
                  <p className="text-xs sm:text-sm text-white font-medium">{selectedCity}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-mute">Meetup point</p>
                  <p className="text-xs sm:text-sm text-white font-medium">{selectedPartner.name}'s area</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mute mb-1" />
                <span className="text-[10px] sm:text-xs text-mute">~15 min</span>
              </div>
            </div>

            {/* Partner info */}
            <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-hairline-mid">
              <img
                src={selectedPartner.avatar}
                alt={selectedPartner.name}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">{selectedPartner.name}</span>
                  {selectedPartner.isVerified && (
                    <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-400 px-1 sm:px-1.5 py-0.5 rounded-full font-medium">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-[10px] sm:text-xs">★</span>
                  <span className="text-[10px] sm:text-xs text-body">{selectedPartner.rating}</span>
                  <span className="text-[10px] sm:text-xs text-mute">· {selectedPartner.reviewCount} reviews</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/partner/${selectedPartner.id}`)}
                className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-black text-xs sm:text-sm font-bold rounded-xl hover:bg-white/90 active:scale-95 transition-all"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Draggable Bottom Sheet ── */}
      <DraggableBottomSheet
        snapPoints={[15, 50, 90]}
        defaultSnap={1}
        header={
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-white">
              {selectedPartner ? `${selectedPartner.name} selected` : 'Find a companion'}
            </p>
            {selectedPartner && (
              <button
                onClick={() => setSelectedPartnerId(null)}
                className="text-[10px] sm:text-xs text-mute hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        }
      >
        <CompanionSearchForm
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          onSelectPartner={setSelectedPartnerId}
          selectedPartnerId={selectedPartnerId}
        />
      </DraggableBottomSheet>
    </div>
  );
}
