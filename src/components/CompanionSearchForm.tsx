import { useState, useMemo } from 'react';
import { Search, MapPin, Home, Clock, Users, Coffee, Film, ShoppingBag, Trees, SlidersHorizontal, Star, Shield, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import { getPartners } from '@/lib/mock-data/partners';
import type { Partner, ActivityType } from '@/lib/types';

const PARTNERS = getPartners();

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai',
  'Hyderabad', 'Jaipur', 'Kochi', 'Kolkata', 'Ahmedabad',
];

const ACTIVITIES: { type: ActivityType; icon: typeof Coffee; label: string }[] = [
  { type: 'coffee', icon: Coffee, label: 'Coffee' },
  { type: 'movies', icon: Film, label: 'Movies' },
  { type: 'mall', icon: ShoppingBag, label: 'Shopping' },
  { type: 'outdoor', icon: Trees, label: 'Outdoor' },
];

const DURATIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
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
}

export default function CompanionSearchForm({
  selectedCity,
  onCityChange,
  onSelectPartner,
  selectedPartnerId,
}: CompanionSearchFormProps) {
  const navigate = useNavigate();
  const [meetupType, setMeetupType] = useState<'home' | 'location'>('location');
  const [meetupAddress, setMeetupAddress] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState(2);
  const [gender, setGender] = useState('all');
  const [showResults, setShowResults] = useState(false);

  const filteredPartners = useMemo(() => {
    let results = PARTNERS.filter(p => p.isOnline && p.location === selectedCity);

    if (selectedActivity) {
      results = results.filter(p => p.activities.includes(selectedActivity));
    }

    if (gender !== 'all') {
      results = results.filter(p => p.gender === gender);
    }

    return results;
  }, [selectedCity, selectedActivity, gender]);

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
    <div className="flex flex-col gap-4">
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-mute" />
        <h2 className="text-lg font-semibold text-white">Find a companion</h2>
      </div>

      {/* City Selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {INDIAN_CITIES.map(city => (
          <button
            key={city}
            onClick={() => {
              onCityChange(city);
              setShowResults(false);
              onSelectPartner(null);
            }}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              selectedCity === city
                ? 'bg-white text-black'
                : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
            )}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Meetup Point */}
      <div>
        <label className="text-xs font-medium text-mute uppercase tracking-wider mb-2 block">
          Meetup Point
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMeetupType('home')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1',
              meetupType === 'home'
                ? 'bg-white text-black'
                : 'bg-canvas-softer text-body hover:bg-surface-pressed'
            )}
          >
            <Home className="w-4 h-4" />
            At my place
          </button>
          <button
            onClick={() => setMeetupType('location')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1',
              meetupType === 'location'
                ? 'bg-white text-black'
                : 'bg-canvas-softer text-body hover:bg-surface-pressed'
            )}
          >
            <MapPin className="w-4 h-4" />
            At a location
          </button>
        </div>
        {meetupType === 'location' && (
          <div className="mt-2 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="text"
              placeholder={`Enter meetup location in ${selectedCity}...`}
              value={meetupAddress}
              onChange={e => setMeetupAddress(e.target.value)}
              className="w-full bg-canvas-softer border border-hairline-mid rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-mute focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Activity */}
      <div>
        <label className="text-xs font-medium text-mute uppercase tracking-wider mb-2 block">
          Activity
        </label>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {ACTIVITIES.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setSelectedActivity(selectedActivity === type ? null : type)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0',
                selectedActivity === type
                  ? 'bg-white text-black'
                  : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration & Gender Row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-mute uppercase tracking-wider mb-2 block">
            Duration
          </label>
          <div className="flex gap-1.5">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  duration === d.value
                    ? 'bg-white text-black'
                    : 'bg-canvas-softer text-body hover:bg-surface-pressed hover:text-white'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                {d.value}h
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-mute uppercase tracking-wider mb-2 block">
            Gender
          </label>
          <div className="flex gap-1.5">
            {GENDERS.map(g => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
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
        className="w-full py-3.5 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search Companions
      </button>

      {/* Results */}
      {showResults && (
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-body">
              {filteredPartners.length} companion{filteredPartners.length !== 1 ? 's' : ''} found
            </p>
            {selectedActivity && (
              <span className="text-xs bg-canvas-softer text-body px-2 py-1 rounded-full">
                {getActivityInfo(selectedActivity).label}
              </span>
            )}
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-mute mx-auto mb-2" />
              <p className="text-body text-sm">No companions match your filters</p>
              <p className="text-mute text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filteredPartners.map(partner => {
              const isSelected = selectedPartnerId === partner.id;
              return (
                <button
                  key={partner.id}
                  onClick={() => handlePartnerClick(partner.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left',
                    isSelected
                      ? 'bg-white/10 border border-white/30'
                      : 'bg-canvas-softer border border-transparent hover:bg-surface-pressed'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-canvas-soft" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">{partner.name}</span>
                      {partner.isVerified && <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-body">{partner.rating}</span>
                      <span className="text-xs text-mute">· {partner.reviewCount} reviews</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-white">{formatCurrency(partner.hourlyRate)}/hr</span>
                      <span className="text-xs text-mute">· {partner.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(partner.id);
                    }}
                    className="flex-shrink-0 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all"
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