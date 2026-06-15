export type ActivityType = 'mall' | 'coffee' | 'movies' | 'outdoor';

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export type SortOption = 'rating' | 'price_low' | 'price_high' | 'newest';

export interface Partner {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  activities: ActivityType[];
  location: string;
  isVerified: boolean;
  isOnline: boolean;
  images: string[];
  badges: string[];
  joinedDate?: string;
}

export interface Booking {
  id: string;
  userId: string;
  partnerId: string;
  partner?: Partner;
  activity: ActivityType;
  date: string;
  startTime: string;
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  meetingPoint: string;
  cancelReason?: string;
}

export interface Review {
  id: string;
  partnerId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  isVerified: boolean;
  stats: {
    totalBookings: number;
    totalSpent: number;
    favoriteActivity: ActivityType;
    memberSince: string;
  };
}

export interface FilterState {
  activity: ActivityType | null;
  minRating: number;
  maxPrice: number;
  gender: string | null;
  sortBy: SortOption;
  verifiedOnly: boolean;
}

export interface BookingDraft {
  partnerId: string;
  activity: ActivityType;
  date: string;
  startTime: string;
  duration: number;
  meetingPoint: string;
  totalAmount: number;
}

export const ACTIVITY_META: Record<ActivityType, { icon: string; label: string; description: string }> = {
  mall: { icon: '🛍', label: 'Mall', description: 'Shopping companion' },
  coffee: { icon: '☕', label: 'Coffee', description: 'Café dates' },
  movies: { icon: '🎬', label: 'Movies', description: 'Movie outings' },
  outdoor: { icon: '🌳', label: 'Outdoors', description: 'Parks & walks' },
};

export const DEFAULT_FILTERS: FilterState = {
  activity: null,
  minRating: 0,
  maxPrice: 2000,
  gender: null,
  sortBy: 'rating',
  verifiedOnly: false,
};
