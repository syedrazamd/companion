import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Star, MapPin, Check, Phone, MessageCircle, Calendar } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { getPartnerById } from '@/lib/mock-data/partners';
import { getReviewsByPartnerId } from '@/lib/mock-data/reviews';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import ScheduleMeetingModal from '@/components/ScheduleMeetingModal';
import { appToast } from '@/lib/toast';
import type { ActivityType } from '@/lib/types';

// ── Payment Modal ────────────────────────────────────────────
function PaymentModal({
  amount,
  isOpen,
  onClose,
  onConfirm,
}: {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');

  if (!isOpen) return null;

  const methods = [
    { id: 'cash', icon: '💵', label: 'Cash', desc: 'Pay after session' },
    { id: 'upi', icon: '📱', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
    { id: 'netbanking', icon: '🏦', label: 'Net Banking', desc: 'All major banks' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full animate-scale-in z-10">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Payment</h2>
        <p className="text-sm text-slate-500 mb-4">Select your payment method</p>

        <div className="bg-violet-50 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">Total Amount</span>
          <span className="text-lg font-bold text-violet-600">{formatCurrency(amount)}</span>
        </div>

        <div className="space-y-2 mb-5">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMethod(m.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                selectedMethod === m.id
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-slate-200 bg-white hover:border-violet-300'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="text-left flex-1">
                <span className={`text-sm font-semibold ${selectedMethod === m.id ? 'text-violet-700' : 'text-slate-700'}`}>
                  {m.label}
                </span>
                <span className="text-xs text-slate-400 block">{m.desc}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === m.id ? 'border-violet-600' : 'border-slate-300'
              }`}>
                {selectedMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />}
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl font-bold"
          onClick={onConfirm}
        >
          Confirm Payment
        </Button>
      </div>
    </div>
  );
}

// ── Partner Page ──────────────────────────────────────────────
export default function PartnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Schedule meeting state
  const [isScheduled, setIsScheduled] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledData, setScheduledData] = useState<{ activity: ActivityType; time: string; duration: number } | null>(null);

  // Payment state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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

  const selectedDuration = scheduledData?.duration || 1;
  const subtotal = partner ? partner.hourlyRate * selectedDuration : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  const handleScheduledSuccess = useCallback((data: { activity: ActivityType; time: string; duration: number }) => {
    setIsScheduled(true);
    setScheduledData(data);
    setIsScheduleModalOpen(false);
    appToast.success('Meeting scheduled! Proceed to payment 💜');
  }, []);

  const handlePaymentConfirm = useCallback(() => {
    setIsPaymentOpen(false);
    setIsScheduled(false);
    appToast.success('Payment confirmed! Booking complete 🎉');
  }, []);

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Partner not found</h2>
        <Button variant="primary" onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  const allImages = [partner.avatar, ...partner.images];

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Photo Gallery */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
          <img
            src={allImages[mainImageIdx]}
            alt={`${partner.name} - photo ${mainImageIdx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Share profile"
          onClick={() => appToast.info('Share link copied!')}
        >
          <Share2 className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex gap-1 px-4 py-2 overflow-x-auto hide-scrollbar bg-white">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIdx(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === mainImageIdx ? 'border-violet-600' : 'border-transparent opacity-70'
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
      <div className="bg-white rounded-t-3xl -mt-2 relative z-10 px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${partner.isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
              <span className={`text-xs ${partner.isOnline ? 'text-green-600' : 'text-slate-400'}`}>
                {partner.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => appToast.info(`Chat with ${partner.name} will open once you have an active booking!`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
              aria-label={`Chat with ${partner.name}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => appToast.info(`Calling ${partner.name} will be available after booking!`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
              aria-label={`Call ${partner.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{partner.location}</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(partner.rating) ? 'fill-violet-600 text-violet-600' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="font-semibold text-sm">{partner.rating}</span>
          <button
            onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-violet-600 text-sm hover:underline"
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

        <div className="border-t border-slate-100 mt-4 pt-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-600">{partner.age} years</span>
            {partner.activities.map((a) => {
              const info = getActivityInfo(a);
              return (
                <span key={a} className="bg-violet-50 rounded-full px-3 py-1 text-xs text-violet-700">
                  {info.icon} {info.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">About {partner.name}</h2>
        <p className={`text-slate-600 text-sm leading-relaxed ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
          {partner.bio}
        </p>
        <button
          onClick={() => setIsBioExpanded(!isBioExpanded)}
          className="text-violet-600 text-sm font-medium mt-1 hover:underline"
        >
          {isBioExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>

      {/* Activities Section */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Activities offered</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['mall', 'coffee', 'movies', 'outdoor'] as ActivityType[]).map((activity) => {
            const info = getActivityInfo(activity);
            const available = partner.activities.includes(activity);
            return (
              <div
                key={activity}
                className={`rounded-2xl p-4 flex flex-col items-center gap-1 border-2 transition-all ${
                  available
                    ? 'border-violet-200 bg-violet-50'
                    : 'border-slate-100 bg-slate-50 opacity-50'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className={`text-sm font-semibold ${available ? 'text-violet-700' : 'text-slate-500'}`}>
                  {info.label}
                </span>
                <span className="text-xs text-slate-500">{info.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Section — rate only, no duration */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Pricing</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-violet-600">{formatCurrency(partner.hourlyRate)}</span>
          <span className="text-slate-500">/hour</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Platform fee included • Paid after session</p>
      </div>

      {/* Schedule Meeting CTA */}
      <div className="px-5 py-4 bg-slate-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Schedule Meeting</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pick activity, time & duration</p>
          </div>
          {isScheduled && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2.5 py-1">✓ Scheduled</span>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl font-bold"
          onClick={() => setIsScheduleModalOpen(true)}
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          Schedule Meeting
        </Button>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Reviews ({reviews.length})</h2>

        {reviews.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {ratingBreakdown.map((count, i) => {
              const stars = 5 - i;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right">{stars}★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
            <div key={review.id} className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar src={review.userAvatar} alt={review.userName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">{review.userName}</span>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3 h-3 ${s < review.rating ? 'fill-violet-600 text-violet-600' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
        {reviews.length > 3 && !showAllReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-violet-600 text-sm font-medium mt-3 hover:underline w-full text-center"
          >
            Load more reviews
          </button>
        )}
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-20" />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-16 lg:left-20 bg-white border-t border-slate-200 py-3 px-5 z-40 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-violet-600">{formatCurrency(total)}</span>
            <span className="text-slate-500 text-sm"> total</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="rounded-full px-6 font-bold"
            disabled={!isScheduled}
            onClick={() => setIsPaymentOpen(true)}
          >
            Continue Payment
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        amount={total}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
      />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        partner={partner}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={handleScheduledSuccess}
      />
    </div>
  );
}
