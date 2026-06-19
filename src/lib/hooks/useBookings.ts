import { useState, useCallback } from 'react';
import { MOCK_BOOKINGS, addBookingToStore as addToStore, cancelBookingInStore as cancelInStore } from '@/lib/mock-data/bookings';
import type { Booking, BookingDraft, Partner } from '@/lib/types';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(() => [...MOCK_BOOKINGS]);

  const addBooking = useCallback((draft: BookingDraft, partner: Partner) => {
    const newBooking = addToStore(draft, partner);
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  }, []);

  const cancelBooking = useCallback((id: string) => {
    cancelInStore(id);
    setBookings(prev => prev.map(b => 
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    ));
  }, []);

  return { bookings, addBooking, cancelBooking };
}
