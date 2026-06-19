import { ACTIVITY_META } from '@/lib/types';
import type { ActivityType } from '@/lib/types';

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getActivityInfo(activity: ActivityType) {
  return ACTIVITY_META[activity];
}

export function generateRefId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getNextDays(count: number): { dayName: string; dateNum: number; fullDate: string; isToday: boolean }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    result.push({
      dayName: i === 0 ? 'Today' : days[d.getDay()],
      dateNum: d.getDate(),
      fullDate: d.toISOString().split('T')[0],
      isToday: i === 0,
    });
  }
  return result;
}

export function getTimeSlots(): string[] {
  return ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
}

/** Haversine distance in km between two lat/lng points */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

/**
 * Reverse geocode using the free OpenStreetMap Nominatim API.
 * Returns a short location string (e.g. "Bandra, Mumbai").
 * Falls back to "Lat, Lng" on error.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    const addr = data.address;
    // Build a short, readable location string
    const parts: string[] = [];
    if (addr.suburb) parts.push(addr.suburb);
    if (addr.city_district || addr.city || addr.town || addr.village) {
      parts.push(addr.city_district || addr.city || addr.town || addr.village);
    } else if (addr.state_district) {
      parts.push(addr.state_district);
    }
    if (parts.length === 0 && addr.state) parts.push(addr.state);
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
