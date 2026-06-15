import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import type { FilterState, ActivityType } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/types';

interface FilterSheetProps {
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function FilterSheet({ filters, onApply, onClose, isOpen }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApply = useCallback(() => {
    onApply(localFilters);
    onClose();
  }, [localFilters, onApply, onClose]);

  const handleReset = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
  }, []);

  const activeCount = (
    (localFilters.activity !== null ? 1 : 0) +
    (localFilters.gender !== null ? 1 : 0) +
    (localFilters.minRating > 0 ? 1 : 0) +
    (localFilters.maxPrice < 2000 ? 1 : 0) +
    (localFilters.verifiedOnly ? 1 : 0)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 md:relative md:max-w-md md:mx-auto md:top-1/2 md:-translate-y-1/2 bg-white rounded-t-3xl md:rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Filters</h2>
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="text-violet-600 text-sm font-medium hover:underline" type="button">
                Reset all
              </button>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100" aria-label="Close">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Activity */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Activity</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(getActivityInfo) as ActivityType[]).map((activity) => {
                const info = getActivityInfo(activity);
                const selected = localFilters.activity === activity;
                return (
                  <button
                    key={activity}
                    onClick={() => setLocalFilters(prev => ({ ...prev, activity: selected ? null : activity }))}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border-2',
                      selected
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-100 text-slate-700 border-slate-100 hover:border-violet-300'
                    )}
                    type="button"
                  >
                    {info.icon} {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Gender preference</h3>
            <div className="flex gap-2">
              {['Any', 'Male', 'Female'].map((g) => {
                const value = g === 'Any' ? null : g;
                const selected = localFilters.gender === value;
                return (
                  <button
                    key={g}
                    onClick={() => setLocalFilters(prev => ({ ...prev, gender: selected ? null : value }))}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border-2',
                      selected
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-100 text-slate-700 border-slate-100 hover:border-violet-300'
                    )}
                    type="button"
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Minimum rating</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setLocalFilters(prev => ({ ...prev, minRating: star }))}
                  className="text-2xl transition-transform duration-200 active:scale-110"
                  type="button"
                  aria-label={`Set minimum rating to ${star}`}
                >
                  {star <= localFilters.minRating ? '★' : '☆'}
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">★ {localFilters.minRating}.0 & above</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Max hourly rate</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">₹0</span>
              <span className="text-sm font-medium text-violet-600">{formatCurrency(localFilters.maxPrice)}/hr</span>
              <span className="text-sm text-slate-500">₹2000</span>
            </div>
            <input
              type="range"
              min={0}
              max={2000}
              step={100}
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Verified Only */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Verified only</span>
              <button
                onClick={() => setLocalFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200 relative',
                  localFilters.verifiedOnly ? 'bg-violet-600' : 'bg-slate-300'
                )}
                type="button"
                role="switch"
                aria-checked={localFilters.verifiedOnly}
                aria-label="Show verified companions only"
              >
                <div className={cn(
                  'w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 absolute top-0.5',
                  localFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Show verified companions only</p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-2xl"
            onClick={handleApply}
          >
            Apply{activeCount > 0 ? ` (${activeCount} active)` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}


