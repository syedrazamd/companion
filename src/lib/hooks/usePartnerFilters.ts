import { useState, useMemo, useCallback } from 'react';
import type { Partner, FilterState, GeoCoords } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/types';
import { distanceKm } from '@/lib/utils';

export function usePartnerFilters(partners: Partner[], userCoords?: GeoCoords | null) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPartners = useMemo(() => {
    return partners
      .filter(p => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const nameMatch = p.name.toLowerCase().includes(q);
          const activityMatch = p.activities.some(a => a.includes(q));
          const locationMatch = p.location.toLowerCase().includes(q);
          if (!nameMatch && !activityMatch && !locationMatch) return false;
        }
        if (filters.activity && !p.activities.includes(filters.activity)) return false;
        if (filters.gender && p.gender !== filters.gender) return false;
        if (p.rating < filters.minRating) return false;
        if (p.hourlyRate > filters.maxPrice) return false;
        if (filters.verifiedOnly && !p.isVerified) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
        if (filters.sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
        if (filters.sortBy === 'nearest' && userCoords) {
          if (!a.coords || !b.coords) return 0;
          return distanceKm(userCoords, a.coords) - distanceKm(userCoords, b.coords);
        }
        return 0;
      });
  }, [partners, filters, searchQuery, userCoords]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.activity !== null) count++;
    if (filters.gender !== null) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxPrice < 2000) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  return { filteredPartners, filters, setFilters, searchQuery, setSearchQuery, activeFilterCount, resetFilters };
}
