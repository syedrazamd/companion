import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, getActivityInfo } from '@/lib/utils';
import { appToast } from '@/lib/toast';
import type { Partner, ActivityType } from '@/lib/types';

interface ScheduleMeetingModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { activity: ActivityType; time: string; duration: number }) => void;
}

const ALL_TIMES = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

function formatHour(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h === 12) return '12 PM';
  if (h === 0) return '12 AM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

export default function ScheduleMeetingModal({ partner, isOpen, onClose, onSuccess }: ScheduleMeetingModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset on close
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedActivity(null);
      setSelectedTime('');
      setSelectedDuration(0);
      setIsScheduled(false);
    }, 300);
  };

  const canSchedule = selectedActivity && selectedTime && selectedDuration > 0;
  const total = partner.hourlyRate * selectedDuration;

  const handleSchedule = () => {
    setIsScheduled(true);
    appToast.success(`Meeting scheduled with ${partner.name}! 🎉`);
    onSuccess?.({ activity: selectedActivity!, time: selectedTime, duration: selectedDuration });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Schedule Meeting</h2>
            <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100" aria-label="Close">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">with {partner.name}</p>
        </div>

        {!isScheduled ? (
          <div className="px-5 py-4 space-y-5">
            {/* Activity */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Activity</h3>
              <p className="text-xs text-slate-400 mb-2">Choose an activity for this session</p>
              <div className="flex flex-wrap gap-2">
                {partner.activities.map((activity) => {
                  const info = getActivityInfo(activity);
                  return (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => setSelectedActivity(selectedActivity === activity ? null : activity)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border-2 transition-all duration-200',
                        selectedActivity === activity
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                      )}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Time</h3>
              <div className="grid grid-cols-4 gap-2">
                {ALL_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(selectedTime === time ? '' : time)}
                    className={cn(
                      'rounded-xl py-2 text-xs font-medium transition-all duration-200 border-2',
                      selectedTime === time
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-100 text-slate-700 border-slate-100 hover:border-violet-300'
                    )}
                  >
                    {formatHour(time)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Duration</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDuration(d)}
                    className={cn(
                      'flex-1 rounded-xl py-2.5 text-center text-sm font-medium transition-all duration-200 border-2',
                      selectedDuration === d
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
                    )}
                  >
                    {d}hr{d > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            {selectedDuration > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{partner.name} × {selectedDuration}hr{selectedDuration > 1 ? 's' : ''}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-1">
                  <span>Platform fee (10%)</span>
                  <span>{formatCurrency(Math.round(total * 0.1))}</span>
                </div>
                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-violet-600">{formatCurrency(total + Math.round(total * 0.1))}</span>
                </div>
              </div>
            )}

            {/* Schedule Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl font-bold"
              disabled={!canSchedule}
              onClick={handleSchedule}
            >
              Schedule
            </Button>
          </div>
        ) : (
          /* Success State */
          <div className="py-8 px-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center animate-scale-in mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Meeting Scheduled!</h2>
            <p className="text-sm text-slate-500 mb-4">{partner.name} has been notified</p>
            <div className="bg-slate-50 rounded-2xl p-4 w-full text-left space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Activity</span>
                <span className="font-medium">{getActivityInfo(selectedActivity!).icon} {getActivityInfo(selectedActivity!).label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Time</span>
                <span className="font-medium">{formatHour(selectedTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">{selectedDuration}hr{selectedDuration > 1 ? 's' : ''}</span>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full rounded-2xl" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
