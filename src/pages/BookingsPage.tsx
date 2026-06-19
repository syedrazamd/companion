import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { EmptyState, ReviewModal } from '@/components/Shared';
import { useBookings } from '@/lib/hooks/useBookings';
import { formatDate, formatTime, getActivityInfo } from '@/lib/utils';
import { appToast } from '@/lib/toast';
import type { Booking, Partner, BookingStatus } from '@/lib/types';

type TabKey = 'upcoming' | 'active' | 'past';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
];

// BookingCard component
interface BookingCardProps {
  booking: Booking;
  onReview: (partner: Partner) => void;
  onCancel: (bookingId: string) => void;
}

function BookingCard({ booking, onReview, onCancel }: BookingCardProps) {
  const navigate = useNavigate();
  const partner = booking.partner;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const statusConfig: Record<string, { variant: 'warning' | 'info' | 'success' | 'default' | 'danger'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'info', label: 'Confirmed' },
    active: { variant: 'success', label: 'Active' },
    completed: { variant: 'default', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
  };
  const config = statusConfig[booking.status] || statusConfig.pending;
  const activityInfo = getActivityInfo(booking.activity);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    onCancel(booking.id);
    setShowCancelConfirm(false);
  };

  return (
    <>
      <div className="bg-canvas-soft rounded-2xl border border-hairline-mid p-4 mb-3">
        <div className="flex items-center gap-3 mb-2">
          {partner && <Avatar src={partner.avatar} alt={partner.name} size="md" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm truncate">{partner?.name || 'Unknown'}</span>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <span className="text-xs text-body">{activityInfo.icon} {activityInfo.label}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-body mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(booking.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(booking.startTime)}
          </span>
          <span className="flex items-center gap-1">
            ⏱ {booking.duration}hr{booking.duration > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-body mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{booking.meetingPoint}</span>
        </div>

        {booking.cancelReason && (
          <div className="flex items-start gap-1 text-xs text-body mb-2">
            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>{booking.cancelReason}</span>
          </div>
        )}

        <div className="border-t border-hairline-mid pt-2 flex items-center justify-between">
          <span className="text-xs text-mute">#{booking.id.replace('b-', 'REF').toUpperCase()}</span>
          <div className="flex items-center gap-2">
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
              <>
                <button
                  onClick={handleCancelClick}
                  className="text-red-500 text-xs font-medium hover:underline cursor-pointer"
                  type="button"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" onClick={() => navigate(`/partner/${booking.partnerId}`)}>View</Button>
              </>
            )}
            {booking.status === 'active' && (
              <>
                <button className="text-red-500 text-xs font-semibold bg-red-900/30 rounded-full px-3 py-1 hover:bg-red-900/50 transition-colors">🆘 SOS</button>
                <span className="text-green-400 text-xs font-medium">In progress...</span>
              </>
            )}
            {booking.status === 'completed' && partner && (
              <>
                <Button variant="outline" size="sm" onClick={() => onReview(partner)}>Leave Review</Button>
                <Button variant="primary" size="sm" onClick={() => navigate(`/partner/${booking.partnerId}`)}>Book Again</Button>
              </>
            )}
            {booking.status === 'cancelled' && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/partner/${booking.partnerId}`)}>Rebook</Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-canvas-soft rounded-3xl p-6 max-w-xs w-full animate-scale-in z-10 text-center border border-hairline-mid">
            <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-1">Cancel Booking?</h3>
            <p className="text-sm text-body mb-5">
              Your meeting with {partner?.name || 'this companion'} will be cancelled. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setShowCancelConfirm(false)}>
                Keep
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={confirmCancel}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [reviewPartner, setReviewPartner] = useState<Partner | null>(null);

  // Use the shared bookings hook for reactive state
  const { bookings, cancelBooking } = useBookings();

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    appToast.success('Booking cancelled');
  };

  const filteredBookings = useMemo(() => {
    switch (activeTab) {
      case 'upcoming': return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
      case 'active': return bookings.filter(b => b.status === 'active');
      case 'past': return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
      default: return [];
    }
  }, [activeTab, bookings]);

  const tabCounts = useMemo(() => ({
    upcoming: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    past: bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length,
  }), [bookings]);

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-6 pb-0">
        <h1 className="text-2xl font-bold text-ink">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 flex border-b border-hairline-mid">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-white text-ink'
                : 'border-transparent text-body hover:text-body'
            }`}
            type="button"
          >
            {tab.label} ({tabCounts[tab.key]})
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onReview={(p) => setReviewPartner(p)}
              onCancel={handleCancel}
            />
          ))
        ) : (
          <EmptyState
            icon={Calendar}
            heading={`No ${activeTab} bookings`}
            subtext={activeTab === 'upcoming' ? 'Explore companions and book your first activity!' : `You don't have any ${activeTab} bookings yet`}
            action={activeTab === 'upcoming' ? { label: 'Explore companions', href: '/explore' } : undefined}
            onAction={activeTab === 'upcoming' ? () => navigate('/explore') : undefined}
          />
        )}
      </div>

      {/* Review Modal */}
      {reviewPartner && (
        <ReviewModal
          partner={reviewPartner}
          isOpen={!!reviewPartner}
          onClose={() => setReviewPartner(null)}
        />
      )}
    </div>
  );
}
