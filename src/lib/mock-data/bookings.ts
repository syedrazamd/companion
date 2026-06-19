import type { Booking, BookingDraft, Partner } from '@/lib/types';
import { MOCK_PARTNERS } from './partners';

// Helper to generate relative dates
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b-001',
    userId: 'user-001',
    partnerId: 'p-001',
    partner: MOCK_PARTNERS.find(p => p.id === 'p-001'),
    activity: 'mall',
    date: daysFromNow(3),
    startTime: '14:00',
    duration: 2,
    totalAmount: 1760,
    status: 'confirmed',
    meetingPoint: 'Phoenix Marketcity, Kurla - Main Entrance',
  },
  {
    id: 'b-002',
    userId: 'user-001',
    partnerId: 'p-007',
    partner: MOCK_PARTNERS.find(p => p.id === 'p-007'),
    activity: 'coffee',
    date: daysFromNow(7),
    startTime: '11:00',
    duration: 1,
    totalAmount: 825,
    status: 'pending',
    meetingPoint: 'Starbucks, MG Road',
  },
  {
    id: 'b-003',
    userId: 'user-001',
    partnerId: 'p-002',
    partner: MOCK_PARTNERS.find(p => p.id === 'p-002'),
    activity: 'movies',
    date: daysFromNow(-5),
    startTime: '19:00',
    duration: 3,
    totalAmount: 1980,
    status: 'active',
    meetingPoint: 'PVR Saket, Gate 2',
  },
  {
    id: 'b-004',
    userId: 'user-001',
    partnerId: 'p-003',
    partner: MOCK_PARTNERS.find(p => p.id === 'p-003'),
    activity: 'outdoor',
    date: daysFromNow(-10),
    startTime: '07:00',
    duration: 2,
    totalAmount: 1540,
    status: 'completed',
    meetingPoint: 'Cubbon Park, Bandstand',
  },
  {
    id: 'b-005',
    userId: 'user-001',
    partnerId: 'p-005',
    partner: MOCK_PARTNERS.find(p => p.id === 'p-005'),
    activity: 'coffee',
    date: daysFromNow(-15),
    startTime: '16:00',
    duration: 1,
    totalAmount: 605,
    status: 'cancelled',
    cancelReason: 'Partner was unavailable due to emergency',
    meetingPoint: 'Filter Coffee House, Mylapore',
  },
];

// Shared booking state for the demo app
let sharedBookings: Booking[] = [...MOCK_BOOKINGS];

export function getUserBookings(): Booking[] {
  return [...sharedBookings];
}

export function addBookingToStore(draft: BookingDraft, partner: Partner): Booking {
  const id = `b-${Date.now()}`;
  const newBooking: Booking = {
    ...draft,
    id,
    userId: 'user-001',
    partnerId: partner.id,
    partner,
    status: 'confirmed',
  };
  sharedBookings = [newBooking, ...sharedBookings];
  return newBooking;
}

export function cancelBookingInStore(id: string): void {
  sharedBookings = sharedBookings.map(b => 
    b.id === id ? { ...b, status: 'cancelled' as const } : b
  );
}
