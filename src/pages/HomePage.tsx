import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Bell, X, MapPin, Navigation, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActivityTag, PartnerCardSkeleton, PartnerCard, FeaturedPartnerCard } from '@/components/PartnerCard';
import { Avatar } from '@/components/ui';
import { getPartners } from '@/lib/mock-data/partners';
import type { ActivityType } from '@/lib/types';

const PARTNERS = getPartners();

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad', 'Jaipur', 'Kochi', 'Kolkata', 'Ahmedabad'];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  // Location state
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCities = useMemo(() => {
    if (!locationQuery) return CITIES;
    const q = locationQuery.toLowerCase();
    return CITIES.filter(c => c.toLowerCase().includes(q));
  }, [locationQuery]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setLocationQuery('');
    setIsLocationOpen(false);
  };

  const handleUseCurrentLocation = () => {
    setSelectedCity('Mumbai');
    setLocationQuery('');
    setIsLocationOpen(false);
  };

  const featuredPartners = useMemo(() => {
    let partners = PARTNERS.filter(p => p.rating >= 4.8 && p.isVerified);
    if (selectedActivity) {
      partners = partners.filter(p => p.activities.includes(selectedActivity));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      partners = partners.filter(p =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    return partners.slice(0, 4);
  }, [selectedActivity, searchQuery]);

  const filteredOnlinePartners = useMemo(() => {
    let partners = PARTNERS.filter(p => p.isOnline);
    if (selectedActivity) {
      partners = partners.filter(p => p.activities.includes(selectedActivity));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      partners = partners.filter(p =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    return partners.sort((a, b) => b.rating - a.rating);
  }, [selectedActivity, searchQuery]);

  const allCompanions = useMemo(() => {
    let partners = [...PARTNERS];
    if (selectedActivity) {
      partners = partners.filter(p => p.activities.includes(selectedActivity));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      partners = partners.filter(p =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    const onlineIds = new Set(filteredOnlinePartners.map(p => p.id));
    const offlinePartners = partners
      .filter(p => !onlineIds.has(p.id))
      .sort((a, b) => b.rating - a.rating);
    const onlinePartners = partners
      .filter(p => onlineIds.has(p.id))
      .sort((a, b) => b.rating - a.rating);
    return [...offlinePartners, ...onlinePartners];
  }, [selectedActivity, searchQuery, filteredOnlinePartners]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 bg-canvas z-50 border-b border-hairline-mid shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-sm">🤝</span>
            </div>
            <span className="font-bold text-white font-display">Companion</span>
          </div>

          {/* Location Search */}
          <div ref={locationRef} className="relative">
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-1.5 bg-canvas-soft rounded-full px-3 py-1.5 text-sm text-body hover:bg-surface-pressed transition-colors max-w-[160px]"
              aria-label="Select location"
            >
              <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0" />
              <span className="truncate">{selectedCity}</span>
              <ChevronRight className={`w-3 h-3 text-body transition-transform duration-200 ${isLocationOpen ? 'rotate-90' : ''}`} />
            </button>

            {isLocationOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-canvas-soft rounded-2xl shadow-xl border border-hairline-mid overflow-hidden z-50 animate-scale-in">
                {/* Search Input */}
                <div className="p-3 border-b border-hairline-mid">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Search city..."
                      className="w-full rounded-xl bg-canvas-softer py-2.5 pl-9 pr-8 text-sm text-ink border-0 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-body"
                      autoFocus
                    />
                    {locationQuery && (
                      <button
                        onClick={() => setLocationQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-pressed rounded-full"
                        aria-label="Clear"
                      >
                        <X className="w-3.5 h-3.5 text-body" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Current Location Option */}
                <div className="border-b border-hairline-mid">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-pressed transition-colors"
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">Use current location</span>
                      <span className="block text-[10px] text-body">Using GPS</span>
                    </div>
                  </button>
                </div>

                {/* City List */}
                <div className="max-h-52 overflow-y-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-pressed transition-colors text-left ${
                          selectedCity === city ? 'bg-white/20' : ''
                        }`}
                        type="button"
                      >
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedCity === city ? 'text-white' : 'text-body'}`} />
                        <span className={`text-sm ${selectedCity === city ? 'font-semibold text-white' : 'text-ink'}`}>
                          {city}
                        </span>
                        {selectedCity === city && (
                          <span className="ml-auto text-white text-xs font-medium">✓</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-body">No cities found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notification + Avatar */}
          <div className="flex items-center gap-2">
            {/* Notification */}
            <div ref={notifRef} className="relative">
              <button
                className="relative p-2 hover:bg-surface-pressed rounded-full transition-colors"
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-5 h-5 text-ink" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-canvas-soft rounded-2xl shadow-xl border border-hairline-mid overflow-hidden z-50 animate-scale-in">
                  <div className="px-4 pt-4 pb-2 border-b border-hairline-mid">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="w-12 h-12 rounded-full bg-surface-pressed flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-body" />
                    </div>
                    <p className="text-sm font-medium text-body">No notifications</p>
                    <p className="text-xs text-mute mt-0.5">You're all caught up!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar → Profile */}
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

      <div className="px-4 pt-4 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or activity..."
            className="w-full rounded-full bg-canvas-soft py-3 pl-12 pr-12 text-sm text-ink border-0 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-body"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-11 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-pressed rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-body" />
            </button>
          )}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 hover:bg-surface-pressed rounded-full transition-colors"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-4 h-4 text-body" />
          </button>
        </div>

        {/* Activity Quick Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
          {(['mall', 'coffee', 'movies', 'outdoor'] as ActivityType[]).map((activity) => (
            <div key={activity} className="snap-mandatory">
              <ActivityTag
                activity={activity}
                selected={selectedActivity === activity}
                onClick={() => setSelectedActivity(selectedActivity === activity ? null : activity)}
                size="md"
              />
            </div>
          ))}
        </div>

        {/* Featured Today */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Featured today</h2>
            <button className="text-white text-sm font-medium hover:underline">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px]">
                  <div className="aspect-square bg-surface-pressed animate-shimmer rounded-xl" />
                </div>
              ))
            ) : featuredPartners.length > 0 ? (
              featuredPartners.map((partner) => (
                <FeaturedPartnerCard key={partner.id} partner={partner} />
              ))
            ) : (
              <p className="text-sm text-body py-4">No featured companions match your filter</p>
            )}
          </div>
        </section>

        {/* Available Now */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-white">Available now 🟢</h2>
            <span className="bg-white/20 text-white text-xs font-medium rounded-full px-2 py-0.5">
              {filteredOnlinePartners.length}
            </span>
          </div>
          {filteredOnlinePartners.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <PartnerCardSkeleton key={i} />)
              ) : (
                filteredOnlinePartners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-body text-sm">No companions currently online for this activity</p>
            </div>
          )}
        </section>

        {/* All Companions */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">All companions</h2>
          {allCompanions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <PartnerCardSkeleton key={i} />)
              ) : (
                allCompanions.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-body text-sm">No companions match your search</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedActivity(null); }}
                className="text-white text-sm font-medium mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
