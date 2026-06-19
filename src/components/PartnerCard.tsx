import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';
import { Badge, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import BookingSheet from '@/components/BookingSheet';
import type { Partner, ActivityType } from '@/lib/types';
import { useBookings } from '@/lib/hooks/useBookings';
import { appToast } from '@/lib/toast';

// PartnerCard Component — compact, matches Featured card proportions
interface PartnerCardProps {
  partner: Partner;
}

export const PartnerCard = React.memo(function PartnerCard({ partner }: PartnerCardProps) {
  const navigate = useNavigate();
  const { addBooking } = useBookings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleClick = () => {
    navigate(`/partner/${partner.id}`);
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookingOpen(true);
  };

  const handleBookingConfirm = (draft: { activity: ActivityType; date: string; time: string; duration: number; meetingPoint: string }) => {
    const subtotal = partner.hourlyRate * draft.duration;
    const platformFee = Math.round(subtotal * 0.1);
    const total = subtotal + platformFee;
    
    addBooking({
      partner,
      activity: draft.activity,
      date: draft.date,
      time: draft.time,
      duration: draft.duration,
      meetingPoint: draft.meetingPoint,
      totalAmount: total,
      status: 'confirmed',
    });
    
    setIsBookingOpen(false);
    appToast.success('Booking confirmed! View in Bookings tab 🎉');
    navigate('/bookings');
  };

  return (
    <>
      <div
        className="group bg-canvas-soft rounded-xl border border-hairline-mid overflow-hidden transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-1 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={partner.images[0] || partner.avatar}
            alt={partner.name}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            {partner.isOnline ? (
              <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                🟢 Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-body">
                ⚫ Offline
              </span>
            )}
          </div>
          {partner.isVerified && (
            <div className="absolute top-2 right-2">
              <Badge variant="primary" className="bg-white text-black text-[10px] rounded-full">
                ✓ Verified
              </Badge>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm truncate text-ink">{partner.name}</h3>
            <span className="text-body text-xs">{partner.age}y</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-white text-white" />
            <span className="text-xs font-medium text-ink">{partner.rating}</span>
            <span className="text-[10px] text-body">({partner.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white font-bold text-xs">{formatCurrency(partner.hourlyRate)}/hr</span>
            <button
              onClick={handleScheduleClick}
              className="flex items-center gap-1 bg-white text-black rounded-full text-[10px] px-2.5 py-1 font-semibold hover:bg-white/90 transition-colors min-h-[28px]"
              aria-label={`Schedule meeting with ${partner.name}`}
            >
              <Calendar className="w-3 h-3" />
              Schedule
            </button>
          </div>
        </div>
      </div>

      <BookingSheet
        partner={partner}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleBookingConfirm}
      />
    </>
  );
});

// FeaturedPartnerCard Component
interface FeaturedPartnerCardProps {
  partner: Partner;
}

export const FeaturedPartnerCard = React.memo(function FeaturedPartnerCard({ partner }: FeaturedPartnerCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 w-[160px] bg-canvas-soft rounded-xl border border-hairline-mid overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={() => navigate(`/partner/${partner.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/partner/${partner.id}`); }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={partner.images[0] || partner.avatar}
          alt={partner.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {partner.isVerified && (
          <div className="absolute top-2 right-2">
            <Badge variant="primary" className="bg-white text-black text-[10px] rounded-full">
              ✓
            </Badge>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-sm truncate text-ink">{partner.name}</h3>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 fill-white text-white" />
          <span className="text-xs font-medium text-ink">{partner.rating}</span>
        </div>
        <span className="text-white font-bold text-xs mt-1 block">{formatCurrency(partner.hourlyRate)}/hr</span>
      </div>
    </div>
  );
});

// PartnerCardSkeleton Component
export function PartnerCardSkeleton() {
  return (
    <div className="bg-canvas-soft rounded-xl border border-hairline-mid overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-6" />
        </div>
        <Skeleton className="h-3 w-12" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// PartnerProfileSkeleton Component
export function PartnerProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="bg-canvas-soft rounded-t-3xl -mt-6 relative z-10 px-5 pt-6 pb-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// BookingCardSkeleton Component
export function BookingCardSkeleton() {
  return (
    <div className="bg-canvas-soft rounded-xl border border-hairline-mid shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

// Activity Tag
interface ActivityTagProps {
  activity: ActivityType;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function ActivityTag({ activity, selected, onClick, size = 'sm' }: ActivityTagProps) {
  const info = getActivityInfo(activity);
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-200',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm',
        selected
          ? 'bg-white text-black border-white'
          : 'bg-canvas-soft text-body border-hairline-mid hover:border-white',
        onClick && 'cursor-pointer'
      )}
      type="button"
    >
      {info.icon} {info.label}
    </button>
  );
}
