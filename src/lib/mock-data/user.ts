import type { UserProfile } from '@/lib/types';

export const MOCK_USER: UserProfile = {
  id: 'user-001',
  name: 'Arjun Sharma',
  avatar: 'https://i.pravatar.cc/150?img=55',
  phone: '+91 98765 43210',
  isVerified: true,
  stats: {
    totalBookings: 12,
    totalSpent: 8400,
    favoriteActivity: 'coffee',
    memberSince: '2024-01',
  },
};

// TODO: replace with Supabase query
export function getUser(): UserProfile {
  return MOCK_USER;
}
