import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Star, MapPin, Check, Phone, MessageCircle, Calendar } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { getPartnerById } from '@/lib/mock-data/partners';
import { getReviewsByPartnerId } from '@/lib/mock-data/reviews';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import BookingSheet from '@/components/BookingSheet';
import { appToast } from '@/lib/toast';
import type { ActivityType } from '@/lib/types';
import { useBookings } from '@/lib/hooks/useBookings';

// ── Partner Page ──────────────────────────────────────────────
export default function PartnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addBooking } = useBookings();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const partner = getPartnerById(id || '');

  const reviews = useMemo(() =>
    id ? getReviewsByPartnerId(id) : [],
    [id]
  );

  const ratingBreakdown = useMemo(() => {
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating - 1]++; });
    return breakdown.reverse();
  }, [reviews]);

  const handleBookingConfirm = useCallback((draft: { activity: ActivityType; date: string; time: string; duration: number; meetingPoint: string }) => {
    if (!partner) return;
    
    const subtotal = partner.hourlyRate * draft.duration;
    const platformFee = Math.round(subtotal * 0.1);
    const total = subtotal + platformFee;
    
    addBooking({
      partnerId: partner.id,
      activity: draft.activity,
      date: draft.date,
      startTime: draft.time,
      duration: draft.duration,
      meetingPoint: draft.meetingPoint,
      totalAmount: total,
    }, partner);
    
    setIsBookingOpen(false);
    appToast.success('Booking confirmed! View in Bookings tab 🎉');
    navigate('/bookings');
  }, [partner, addBooking, navigate]);

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-xl font-bold text-ink mb-2">Partner not found</h2>
        <Button variant="primary" onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  const allImages = [partner.avatar, ...partner.images];

  return (
    <div className="max-w-lg mx-auto bg-canvas min-h-screen">
      {/* Photo Gallery */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-canvas-softer">
          <img
            src={allImages[mainImageIdx]}
            alt={`${partner.name} - photo ${mainImageIdx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-canvas/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-canvas transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-canvas/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-canvas transition-colors"
          aria-label="Share profile"
          onClick={() => appToast.info('Share link copied!')}
        >
          <Share2 className="w-5 h-5 text-ink" />
        </button>
        <div className="flex gap-1 px-4 py-2 overflow-x-auto hide-scrollbar bg-canvas">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIdx(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === mainImageIdx ? 'border-white' : 'border-transparent opacity-70'
              }`}
              type="button"
              aria-label={`View photo ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-canvas rounded-t-3xl -mt-2 relative z-10 px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{partner.name}</h1>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${partner.isOnline ? 'bg-green-500' : 'bg-body'}`} />
              <span className={`text-xs ${partner.isOnline ? 'text-green-400' : 'text-body'}`}>
                {partner.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => appToast.info(`Chat with ${partner.name} will open once you have an active booking!`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-canvas-soft text-ink text-xs font-semibold hover:bg-canvas-softer transition-colors"
              aria-label={`Chat with ${partner.name}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => appToast.info(`Calling ${partner.name} will be available after booking!`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
              aria-label={`Call ${partner.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-body text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{partner.location}</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(partner.rating) ? 'fill-white text-white' : 'text-hairline-mid'}`} />
            ))}
          </div>
          <span className="font-semibold text-sm text-ink">{partner.rating}</span>
          <button
            onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white text-sm hover:underline"
          >
            ({partner.reviewCount} reviews)
          </button>
        </div>

        {partner.isVerified && (
          <div className="mt-2">
            <Badge variant="primary" className="gap-1">
              <Check className="w-3 h-3" /> Verified
            </Badge>
          </div>
        )}

        <div className="border-t border-hairline-mid mt-4 pt-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-canvas-soft rounded-full px-3 py-1 text-xs text-body">{partner.age} years</span>
            {partner.activities.map((a) => {
              const info = getActivityInfo(a);
              return (
                <span key={a} className="bg-canvas-soft rounded-full px-3 py-1 text-xs text-ink">
                  {info.icon} {info.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-ink mb-2">About {partner.name}</h2>
        <p className={`text-body text-sm leading-relaxed ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
          {partner.bio}
        </p>
        <button
          onClick={() => setIsBioExpanded(!isBioExpanded)}
          className="text-white text-sm font-medium mt-1 hover:underline"
        >
          {isBioExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>

      {/* Activities Section */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-ink mb-3">Activities offered</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['mall', 'coffee', 'movies', 'outdoor'] as ActivityType[]).map((activity) => {
            const info = getActivityInfo(activity);
            const available = partner.activities.includes(activity);
            return (
              <div
                key={activity}
                className={`rounded-2xl p-4 flex flex-col items-center gap-1 border-2 transition-all ${
                  available
                    ? 'border-hairline-mid bg-canvas-soft'
                    : 'border-hairline-mid bg-canvas-softer opacity-50'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className={`text-sm font-semibold ${available ? 'text-ink' : 'text-body'}`}>
                  {info.label}
                </span>
                <span className="text-xs text-body">{info.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Section — rate only, no duration */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-ink mb-3">Pricing</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{formatCurrency(partner.hourlyRate)}</span>
          <span className="text-body">/hour</span>
        </div>
        <p className="text-xs text-mute mt-1">Platform fee included • Paid after session</p>
      </div>

      {/* Schedule Meeting CTA */}
      <div className="px-5 py-4 bg-canvas-softer">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Schedule Meeting</h2>
            <p className="text-xs text-body mt-0.5">Pick activity, time & duration</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl font-bold"
          onClick={() => setIsBookingOpen(true)}
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          Schedule Meeting
        </Button>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="px-5 py-4">
        <h2 className="text-lg font-semibold text-ink mb-3">Reviews ({reviews.length})</h2>

        {reviews.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {ratingBreakdown.map((count, i) => {
              const stars = 5 - i;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right text-ink">{stars}★</span>
                  <div className="flex-1 h-2 bg-canvas-softer rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-body">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
            <div key={review.id} className="bg-canvas-softer rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar src={review.userAvatar} alt={review.userName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink truncate">{review.userName}</span>
                    <span className="text-xs text-body">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3 h-3 ${s < review.rating ? 'fill-white text-white' : 'text-hairline-mid'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-body leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
        {reviews.length > 3 && !showAllReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-white text-sm font-medium mt-3 hover:underline w-full text-center"
          >
            Load more reviews
          </button>
        )}
      </div>

      {/* Booking Sheet */}
      <BookingSheet
        partner={partner}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={(booking) => handleBookingConfirm({ ...booking, time: booking.startTime })}
      />
    </div>
  );
}
