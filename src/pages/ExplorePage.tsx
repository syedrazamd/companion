import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PartnerCard } from '@/components/PartnerCard';
import { EmptyState } from '@/components/Shared';
import FilterSheet from '@/components/FilterSheet';
import { usePartnerFilters } from '@/lib/hooks/usePartnerFilters';
import { getPartners } from '@/lib/mock-data/partners';
import { cn } from '@/utils/cn';
import type { SortOption } from '@/lib/types';

const PARTNERS = getPartners();

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Top rated' },
  { value: 'price_low', label: 'Price: Low to high' },
  { value: 'price_high', label: 'Price: High to low' },
  { value: 'newest', label: 'Newest' },
];

export default function ExplorePage() {
  const { filteredPartners, filters, setFilters, searchQuery, setSearchQuery, activeFilterCount, resetFilters } = usePartnerFilters(PARTNERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 bg-white z-50 shadow-sm px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or activity..."
            className="w-full rounded-full bg-slate-100 py-3 pl-12 pr-12 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-11 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Results Count + Sort */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-500">{filteredPartners.length} companions found</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border-2 transition-colors',
                activeFilterCount > 0
                  ? 'bg-violet-50 border-violet-300 text-violet-700'
                  : 'bg-white border-slate-200 text-slate-600'
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters{activeFilterCount > 0 ? ` • ${activeFilterCount}` : ''}
            </button>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
              className="text-xs border-2 border-slate-200 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:border-violet-600"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredPartners.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            heading="No companions found"
            subtext="Try adjusting your filters or search term"
            action={{ label: 'Clear all filters', href: '' }}
            onAction={resetFilters}
          />
        )}
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        filters={filters}
        onApply={setFilters}
        onClose={() => setIsFilterOpen(false)}
        isOpen={isFilterOpen}
      />
    </div>
  );
}
