import { useState, useMemo } from 'react';
import { Search, MapPin, Home, Clock, Users, Coffee, Film, ShoppingBag, Trees, Star, Shield, Locate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatCurrency, getActivityInfo, distanceKm } from '@/lib/utils';
import { getPartners } from '@/lib/mock-data/partners';
import type { ActivityType } from '@/lib/types';

const PARTNERS = getPartners();

const MAX_DISTANCE_KM = 50;

const ACTIVITIES: { type: ActivityType; icon: typeof Coffee; label: string }[] = [
  { type: 'coffee', icon: Coffee, label: 'Coffee' },
  { type: 'movies', icon: Film, label: 'Movies' },
  { type: 'mall', icon: ShoppingBag, label: 'Shopping' },
  { type: 'outdoor', icon: Trees, label: 'Outdoor' },
];

const DURATIONS = [
  { value: 1, label: '1h' },
  { value: 2, label: '2h' },
  { value: 3, label: '3h' },
  { value: 4, label: '4h' },
];

const GENDERS = [
  { value: 'all', label: 'Anyone' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
];

interface CompanionSearchFormProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSelectPartner: (id: string | null) => void;
  selectedPartnerId: string | null;
  userCoords?: { lat: number; lng: number } | null;
}

export default function CompanionSearchForm({
  selectedCity,
  onCityChange,
  onSelectPartner,
  selectedPartnerId,
  userCoords,
}: CompanionSearchFormProps) {
  const navigate = useNavigate();
  const [meetupType, setMeetupType] = useState<'home' | 'location'>('location');
  const [meetupAddress, setMeetupAddress] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState(2);
  const [gender, setGender] = useState('all');
  const [showResults, setShowResults] = useState(false);

  const filteredPartners = useMemo(() => {
    let results = PARTNERS.filter(p => p.isOnline);

    // Proximity filter: only partners within MAX_DISTANCE_KM of user
    if (userCoords) {
      results = results.filter(p => {
        if (!p.coords) return false;
        return distanceKm(userCoords, p.coords) <= MAX_DISTANCE_KM;
      });
    }

    if (selectedActivity) {
      results = results.filter(p => p.activities.includes(selectedActivity));
    }

    if (gender !== 'all') {
      results = results.filter(p => p.gender === gender);
    }

    // Sort by distance (nearest first)
    if (userCoords) {
      results = [...results].sort((a, b) => {
        if (!a.coords || !b.coords) return 0;
        return distanceKm(userCoords, a.coords) - distanceKm(userCoords, b.coords);
      });
    }

    return results;
  }, [userCoords, selectedActivity, gender]);

  const handleSearch = () => {
    setShowResults(true);
  };

  const handlePartnerClick = (partnerId: string) => {
    onSelectPartner(partnerId);
  };

  const handleBookNow = (partnerId: string) => {
    navigate(`/partner/${partnerId}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-mute" />
        <h2 className="text-base sm:text-lg font-semibold text-white">Find a companion</h2>
      </div>

      {/* Your Location */}
      <div className="flex items-center gap-2 bg-canvas-softer rounded-full px-3 py-1.5 sm:py-2 border border-hairline-mid">
        <Locate className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-body truncate">
          {userCoords ? `Near ${selectedCity}` : 'Location not set'}
        </span>
        <span className="text-[10px] sm:text-xs text-mute ml-auto flex-shrink-0">
          {userCoords ? `within ${MAX_DISTANCE_KM}km` : ''}
        </span>
      </div>

      {/* Meetup Point */}
      <div>
        <label className="text-[10px] sm:text-xs font-medium text-mute uppercase tracking-wider mb-1.5 sm:mb-2 block">
          Meetup Point
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMeetupType('home')}
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex-1',
              meetupType === 'home'
                ? 'bg-white text-black'
                : 'bg-canvas-softer text-body hover:bg-surface-pressed'
            )}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            At my place
          </button>
          <button
            onClick={() => setMeetupType('location')}
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex-1',
              meetupType === 'location'
                ? 'bg-white text-black'
                : 'bg-canvas-softer text-body hover:bg-surface-pressed'
            )}
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            At a location
          </button>
        </div>
        {meetupType === 'location' && (
          <div className="mt-2 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-mute" />
            <input
              type="text"
              placeholder={`Meetup location near ${selectedCity}…`}
              value={meetupAddress}
              onChange={e => setMeetupAddress(e.target.value)}
              className="w-full bg-canvas-softer border border-hairline-mid rounded-xl py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white placeholder:text-mute focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Activity */}
      <div>
        <label className="text-[10px] sm:text-xs font-medium text-mute uppercase tracking-wider mb-1.5 sm:mb-2 block">
          Activity
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {ACTIVITIES.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setSelectedActivity(selectedActivity === type ? null : type)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                selectedActivity === type
                  ? 'bg-white text-black'
                  : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration & Gender Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-[10px] sm:text-xs font-medium text-mute uppercase tracking-wider mb-1.5 sm:mb-2 block">
            Duration
          </label>
          <div className="flex gap-1 sm:gap-1.5">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={cn(
                  'flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                  duration === d.value
                    ? 'bg-white text-black'
                    : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
                )}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] sm:text-xs font-medium text-mute uppercase tracking-wider mb-1.5 sm:mb-2 block">
            Gender
          </label>
          <div className="flex gap-1 sm:gap-1.5">
            {GENDERS.map(g => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={cn(
                  'px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                  gender === g.value
                    ? 'bg-white text-black'
                    : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full py-3 sm:py-3.5 bg-white text-black text-sm sm:text-base font-semibold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        Search Companions
      </button>

      {/* Results */}
      {showResults && (
        <div className="mt-1 sm:mt-2 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-body">
              {filteredPartners.length} companion{filteredPartners.length !== 1 ? 's' : ''} found
            </p>
            {selectedActivity && (
              <span className="text-[10px] sm:text-xs bg-canvas-softer text-body px-2 py-0.5 sm:py-1 rounded-full">
                {getActivityInfo(selectedActivity).label}
              </span>
            )}
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-mute mx-auto mb-2" />
              <p className="text-body text-xs sm:text-sm">No companions match your filters</p>
              <p className="text-mute text-[10px] sm:text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filteredPartners.map(partner => {
              const isSelected = selectedPartnerId === partner.id;
              return (
                <button
                  key={partner.id}
                  onClick={() => handlePartnerClick(partner.id)}
                  className={cn(
                    'w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 text-left',
                    isSelected
                      ? 'bg-white/10 border border-white/30'
                      : 'bg-canvas-softer border border-transparent hover:bg-surface-pressed'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-canvas-soft" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-white truncate">{partner.name}</span>
                      {partner.isVerified && <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] sm:text-xs text-body">{partner.rating}</span>
                      <span className="text-[10px] sm:text-xs text-mute">· {partner.reviewCount} reviews</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-[10px] sm:text-xs font-semibold text-white">{formatCurrency(partner.hourlyRate)}/hr</span>
                      {userCoords && partner.coords ? (
                        <span className="text-[10px] sm:text-xs text-mute">
                          · {distanceKm(userCoords, partner.coords).toFixed(1)} km away
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-mute">· {partner.location}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(partner.id);
                    }}
                    className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-[10px] sm:text-xs font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all"
                  >
                    Book
                  </button>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}