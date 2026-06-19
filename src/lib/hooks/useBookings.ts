import { useState, useCallback, useEffect } from 'react';
import {
  getUserBookings,
  addBookingToStore as addToStore,
  cancelBookingInStore as cancelInStore,
  subscribeToBookings,
} from '@/lib/mock-data/bookings';
import type { Booking, BookingDraft, Partner } from '@/lib/types';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(() => getUserBookings());

  useEffect(() => {
    return subscribeToBookings(() => setBookings(getUserBookings()));
  }, []);

  const addBooking = useCallback((draft: BookingDraft, partner: Partner) => {
    return addToStore(draft, partner);
  }, []);

  const cancelBooking = useCallback((id: string) => {
    cancelInStore(id);
  }, []);

  return { bookings, addBooking, cancelBooking };
}
