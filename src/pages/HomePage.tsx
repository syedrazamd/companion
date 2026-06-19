import { useState, useMemo } from 'react';
import { Bell, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import MapView from '@/components/MapView';
import DraggableBottomSheet from '@/components/DraggableBottomSheet';
import CompanionSearchForm from '@/components/CompanionSearchForm';
import { getPartners } from '@/lib/mock-data/partners';

const PARTNERS = getPartners();

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const selectedPartner = useMemo(
    () => PARTNERS.find(p => p.id === selectedPartnerId) ?? null,
    [selectedPartnerId]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden relative">
      {/* ── Floating Header (over map) ── */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <div className="flex items-center justify-between h-12 bg-canvas/70 backdrop-blur-xl rounded-2xl px-3 border border-hairline-mid/50">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-xs">🤝</span>
            </div>
            <span className="font-bold text-white text-sm font-display">Companion</span>
          </div>

          {/* City pill */}
          <button
            onClick={() => setSelectedCity(selectedCity === 'Mumbai' ? 'Delhi' : 'Mumbai')}
            className="flex items-center gap-1.5 bg-canvas-softer rounded-full px-3 py-1.5 text-sm text-body hover:bg-surface-pressed transition-colors"
            aria-label="Select location"
          >
            <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0" />
            <span className="truncate max-w-[80px]">{selectedCity}</span>
          </button>

          {/* Notification + Avatar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="relative p-1.5 hover:bg-surface-pressed rounded-full transition-colors"
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-4.5 h-4.5 text-ink" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-canvas-soft rounded-2xl shadow-xl border border-hairline-mid overflow-hidden z-50">
                  <div className="px-4 pt-4 pb-2 border-b border-hairline-mid">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="w-10 h-10 rounded-full bg-surface-pressed flex items-center justify-center mb-2">
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
        />
      </div>

      {/* ── Selected Partner Route Card (Uber-style) ── */}
      {selectedPartner && (
        <div className="absolute bottom-[52%] left-4 right-4 z-20 animate-slide-up">
          <div className="bg-canvas-soft rounded-2xl border border-hairline-mid p-4 shadow-2xl shadow-black/60">
            {/* Route visualization */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-canvas-soft" />
                <div className="w-0.5 h-6 bg-hairline-mid" />
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-mute">Your location</p>
                  <p className="text-sm text-white font-medium">{selectedCity}</p>
                </div>
                <div>
                  <p className="text-xs text-mute">Meetup point</p>
                  <p className="text-sm text-white font-medium">{selectedPartner.name}'s area</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Navigation className="w-4 h-4 text-mute mb-1" />
                <span className="text-xs text-mute">~15 min</span>
              </div>
            </div>

            {/* Partner info */}
            <div className="flex items-center gap-3 pt-3 border-t border-hairline-mid">
              <img
                src={selectedPartner.avatar}
                alt={selectedPartner.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white truncate">{selectedPartner.name}</span>
                  {selectedPartner.isVerified && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-body">{selectedPartner.rating}</span>
                  <span className="text-xs text-mute">· {selectedPartner.reviewCount} reviews</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/partner/${selectedPartner.id}`)}
                className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 active:scale-95 transition-all"
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
            <p className="text-sm font-semibold text-white">
              {selectedPartner ? `${selectedPartner.name} selected` : 'Find a companion'}
            </p>
            {selectedPartner && (
              <button
                onClick={() => setSelectedPartnerId(null)}
                className="text-xs text-mute hover:text-white transition-colors"
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
