import { useReducer, useCallback, useEffect } from 'react';
import { X, ChevronLeft, MapPin, Clock, Shield, CreditCard, Check } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatDate, formatTime, getActivityInfo, getNextDays, getTimeSlots, generateRefId } from '@/lib/utils';
import type { Partner, BookingDraft, ActivityType } from '@/lib/types';

interface BookingSheetProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: BookingDraft) => void;
}

interface FormState {
  step: number;
  activity: ActivityType | null;
  date: string;
  startTime: string;
  duration: number;
  meetingPoint: string;
  isSubmitting: boolean;
  isConfirmed: boolean;
  bookingRef: string;
}

type FormAction =
  | { type: 'SET_ACTIVITY'; payload: ActivityType }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_MEETING_POINT'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'CONFIRM' }
  | { type: 'CONFIRMED'; payload: string }
  | { type: 'RESET' };

const initialState: FormState = {
  step: 1,
  activity: null,
  date: '',
  startTime: '',
  duration: 0,
  meetingPoint: '',
  isSubmitting: false,
  isConfirmed: false,
  bookingRef: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_ACTIVITY': return { ...state, activity: action.payload };
    case 'SET_DATE': return { ...state, date: action.payload };
    case 'SET_TIME': return { ...state, startTime: action.payload };
    case 'SET_DURATION': return { ...state, duration: action.payload };
    case 'SET_MEETING_POINT': return { ...state, meetingPoint: action.payload };
    case 'NEXT_STEP': return { ...state, step: Math.min(state.step + 1, 3) };
    case 'PREV_STEP': return { ...state, step: Math.max(state.step - 1, 1) };
    case 'CONFIRM': return { ...state, isSubmitting: true };
    case 'CONFIRMED': return { ...state, isSubmitting: false, isConfirmed: true, bookingRef: action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

const SUGGESTIONS = ['Mall entrance', 'Coffee shop', 'Metro station'];

export default function BookingSheet({ partner, isOpen, onClose, onConfirm }: BookingSheetProps) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const nextDays = getNextDays(7);
  const timeSlots = getTimeSlots();

  const isStep1Valid = state.activity && state.date && state.startTime;
  const isStep2Valid = state.duration > 0 && state.meetingPoint.length > 3;

  const subtotal = partner.hourlyRate * state.duration;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => dispatch({ type: 'RESET' }), 300);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    dispatch({ type: 'CONFIRM' });
    setTimeout(() => {
      const ref = generateRefId();
      dispatch({ type: 'CONFIRMED', payload: ref });
      onConfirm({
        partnerId: partner.id,
        activity: state.activity!,
        date: state.date,
        startTime: state.startTime,
        duration: state.duration,
        meetingPoint: state.meetingPoint,
        totalAmount: total,
      });
    }, 1500);
  }, [partner.id, state.activity, state.date, state.startTime, state.duration, state.meetingPoint, total, onConfirm]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:max-w-md md:mx-auto md:top-1/2 md:-translate-y-1/2 bg-canvas-soft rounded-t-3xl md:rounded-3xl animate-slide-up md:animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-canvas-soft z-10 px-5 pt-4 pb-2 border-b border-hairline-mid">
          <div className="flex items-center justify-between">
            {state.step > 1 && !state.isConfirmed ? (
              <button onClick={() => dispatch({ type: 'PREV_STEP' })} className="p-2 -ml-2 rounded-full hover:bg-canvas-softer" aria-label="Go back">
                <ChevronLeft className="w-5 h-5 text-body" />
              </button>
            ) : (
              <div className="w-9" />
            )}
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    s < state.step ? 'w-6 bg-white/40' :
                    s === state.step ? 'w-8 bg-white' :
                    'w-4 bg-hairline-mid'
                  )}
                />
              ))}
            </div>
            <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-canvas-softer" aria-label="Close">
              <X className="w-5 h-5 text-body" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          {/* Step 1 */}
          {state.step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-ink">When & what?</h2>
              
              {/* Activity Selector */}
              <div>
                <label className="text-sm font-medium text-body mb-2 block">Activity</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(getActivityInfo) as ActivityType[]).map((activity) => {
                    const info = getActivityInfo(activity);
                    const available = partner.activities.includes(activity);
                    return (
                      <button
                        key={activity}
                        onClick={() => available && dispatch({ type: 'SET_ACTIVITY', payload: activity })}
                        disabled={!available}
                        className={cn(
                          'rounded-2xl p-4 min-h-[80px] flex flex-col items-center justify-center gap-1 transition-all duration-200 border-2',
                          state.activity === activity
                            ? 'bg-white text-black border-white'
                            : available
                              ? 'bg-canvas-softer text-body border-hairline-mid hover:border-white'
                              : 'bg-canvas-softer text-mute border-hairline-mid cursor-not-allowed opacity-50'
                        )}
                        type="button"
                      >
                        <span className="text-2xl">{info.icon}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector */}
              <div>
                <label className="text-sm font-medium text-body mb-2 block">Date</label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {nextDays.map((d) => (
                    <button
                      key={d.fullDate}
                      onClick={() => dispatch({ type: 'SET_DATE', payload: d.fullDate })}
                      className={cn(
                        'flex-shrink-0 rounded-xl px-3 py-2 flex flex-col items-center min-w-[56px] transition-all duration-200 border-2',
                        state.date === d.fullDate
                          ? 'bg-white text-black border-white'
                          : 'bg-canvas-softer text-body border-hairline-mid hover:border-white'
                      )}
                      type="button"
                    >
                      <span className="text-[10px] font-medium">{d.dayName}</span>
                      <span className="text-lg font-bold">{d.dateNum}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-sm font-medium text-body mb-2 block">Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => dispatch({ type: 'SET_TIME', payload: time })}
                      className={cn(
                        'rounded-xl py-2 text-xs font-medium transition-all duration-200 border-2',
                        state.startTime === time
                          ? 'bg-white text-black border-white'
                          : 'bg-canvas-softer text-body border-hairline-mid hover:border-white'
                      )}
                      type="button"
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                disabled={!isStep1Valid}
                onClick={() => dispatch({ type: 'NEXT_STEP' })}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {state.step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-ink">How long & where?</h2>

              {/* Duration Selector */}
              <div>
                <label className="text-sm font-medium text-body mb-2 block">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((d) => (
                    <button
                      key={d}
                      onClick={() => dispatch({ type: 'SET_DURATION', payload: d })}
                      className={cn(
                        'rounded-2xl p-3 flex flex-col items-center gap-0.5 transition-all duration-200 border-2',
                        state.duration === d
                          ? 'bg-canvas-softer border-white text-ink'
                          : 'bg-canvas-softer border-hairline-mid text-body hover:border-white'
                      )}
                      type="button"
                    >
                      <span className="text-sm font-bold">{d}hr{d > 1 ? 's' : ''}</span>
                      <span className="text-xs text-body">{formatCurrency(partner.hourlyRate * d)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meeting Point */}
              <div>
                <label htmlFor="meetingPoint" className="text-sm font-medium text-body mb-1.5 block">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Where to meet?
                </label>
                <input
                  id="meetingPoint"
                  type="text"
                  value={state.meetingPoint}
                  onChange={(e) => dispatch({ type: 'SET_MEETING_POINT', payload: e.target.value })}
                  placeholder="e.g. Inorbit Mall Gate 3, Mumbai"
                  className="w-full rounded-xl border-2 border-hairline-mid bg-canvas-softer px-4 py-3 text-sm text-ink transition-colors duration-200 placeholder:text-mute focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10"
                />
                <div className="flex gap-2 mt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => dispatch({ type: 'SET_MEETING_POINT', payload: s })}
                      className="bg-canvas-softer rounded-full px-3 py-1 text-xs text-body hover:bg-white hover:text-black transition-colors"
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                disabled={!isStep2Valid}
                onClick={() => dispatch({ type: 'NEXT_STEP' })}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 3 */}
          {state.step === 3 && !state.isConfirmed && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-ink">Confirm booking</h2>
              
              <div className="bg-canvas-softer rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={partner.avatar} alt={partner.name} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{partner.name}</span>
                      {partner.isVerified && <Badge variant="primary" className="text-[10px]">✓ Verified</Badge>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-body">
                    <span>{getActivityInfo(state.activity!).icon}</span>
                    <span>{getActivityInfo(state.activity!).label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(state.date)} • {formatTime(state.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body">
                    <span className="text-sm">⏱</span>
                    <span>{state.duration} hour{state.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body">
                    <MapPin className="w-4 h-4" />
                    <span>{state.meetingPoint}</span>
                  </div>
                </div>

                <div className="border-t border-hairline-mid pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-body">
                    <span>Partner fee: {formatCurrency(partner.hourlyRate)} × {state.duration}hrs</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span>Platform fee (10%)</span>
                    <span>{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Total</span>
                    <span className="text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-body">
                <CreditCard className="w-4 h-4" />
                <span>Payment collected after session</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-body">
                <Shield className="w-4 h-4" />
                <span>Your safety is our priority. SOS button available during session.</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-2xl font-bold"
                isLoading={state.isSubmitting}
                onClick={handleConfirm}
              >
                Confirm Booking
              </Button>
            </div>
          )}

          {/* Success State */}
          {state.isConfirmed && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center animate-scale-in">
                <Check className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-xl font-bold text-ink">Booking Confirmed!</h2>
              <p className="text-body">{partner.name} has been notified</p>
              <p className="text-xs text-mute">Booking ref: #{state.bookingRef}</p>
              <Button
                variant="primary"
                size="lg"
                className="rounded-2xl mt-4"
                onClick={handleClose}
              >
                View Bookings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
