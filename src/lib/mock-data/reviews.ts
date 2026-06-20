import type { Review } from '@/lib/types';

export const MOCK_REVIEWS: Review[] = [
  { id: 'r-001', partnerId: 'p-001', userId: 'u-002', userName: 'Rahul Verma', userAvatar: 'https://i.pravatar.cc/50?img=30', rating: 5, comment: 'Priya is amazing! She knew exactly which stores to visit and helped me find great deals. Best shopping companion ever!', date: '2024-11-15' },
  { id: 'r-002', partnerId: 'p-001', userId: 'u-003', userName: 'Sonia Kapoor', userAvatar: 'https://i.pravatar.cc/50?img=31', rating: 5, comment: 'Had a wonderful coffee date with Priya. Great conversation and she recommended the best café in Bandra!', date: '2024-11-10' },
  { id: 'r-003', partnerId: 'p-001', userId: 'u-004', userName: 'Amit Shah', userAvatar: 'https://i.pravatar.cc/50?img=32', rating: 4, comment: 'Very friendly and punctual. Would definitely book again for mall trips.', date: '2024-10-28' },
  { id: 'r-004', partnerId: 'p-002', userId: 'u-005', userName: 'Neha Patel', userAvatar: 'https://i.pravatar.cc/50?img=33', rating: 5, comment: 'Arjun is the perfect movie buddy! He knows so much about cinema and made the whole experience fun.', date: '2024-11-12' },
  { id: 'r-005', partnerId: 'p-002', userId: 'u-006', userName: 'Vikash Kumar', userAvatar: 'https://i.pravatar.cc/50?img=34', rating: 4, comment: 'Great company for exploring Delhi. Very knowledgeable about the city.', date: '2024-10-20' },
  { id: 'r-006', partnerId: 'p-003', userId: 'u-007', userName: 'Pooja Rao', userAvatar: 'https://i.pravatar.cc/50?img=35', rating: 5, comment: 'Kavya knows Bengaluru like the back of her hand! Amazing café recommendations.', date: '2024-11-08' },
  { id: 'r-007', partnerId: 'p-003', userId: 'u-008', userName: 'Ravi Teja', userAvatar: 'https://i.pravatar.cc/50?img=36', rating: 4, comment: 'Nice outdoor walk at Cubbon Park. Good conversation and very friendly.', date: '2024-10-15' },
  { id: 'r-008', partnerId: 'p-004', userId: 'u-009', userName: 'Shruti Deshmukh', userAvatar: 'https://i.pravatar.cc/50?img=37', rating: 5, comment: 'Rohan is incredibly fit and motivating! Great for outdoor activities.', date: '2024-11-05' },
  { id: 'r-009', partnerId: 'p-005', userId: 'u-010', userName: 'Deepak Krishnan', userAvatar: 'https://i.pravatar.cc/50?img=38', rating: 4, comment: 'Ananya made Chennai feel like home. Great taste in movies and food!', date: '2024-10-30' },
  { id: 'r-010', partnerId: 'p-005', userId: 'u-011', userName: 'Lakshmi Iyer', userAvatar: 'https://i.pravatar.cc/50?img=39', rating: 5, comment: 'Best filter coffee tour ever! Ananya knows all the hidden gems in Mylapore.', date: '2024-10-12' },
  { id: 'r-011', partnerId: 'p-006', userId: 'u-012', userName: 'Preeti Joshi', userAvatar: 'https://i.pravatar.cc/50?img=40', rating: 4, comment: 'Fun movie outing with Vikram. Very energetic and enthusiastic!', date: '2024-11-01' },
  { id: 'r-012', partnerId: 'p-007', userId: 'u-013', userName: 'Aravind Menon', userAvatar: 'https://i.pravatar.cc/50?img=41', rating: 5, comment: 'Meera is absolutely wonderful! Made our Kochi trip so special with her local knowledge.', date: '2024-11-14' },
  { id: 'r-013', partnerId: 'p-007', userId: 'u-014', userName: 'Geeta Pillai', userAvatar: 'https://i.pravatar.cc/50?img=42', rating: 5, comment: 'The best companion I\'ve booked so far. Warm, friendly, and so easy to talk to.', date: '2024-11-02' },
  { id: 'r-014', partnerId: 'p-007', userId: 'u-015', userName: 'Sunil Nair', userAvatar: 'https://i.pravatar.cc/50?img=43', rating: 5, comment: 'Meera turned a simple café visit into an unforgettable experience!', date: '2024-10-25' },
  { id: 'r-015', partnerId: 'p-008', userId: 'u-016', userName: 'Sridhar Rao', userAvatar: 'https://i.pravatar.cc/50?img=44', rating: 4, comment: 'Aditya\'s movie knowledge is impressive. Great pick for cinema lovers.', date: '2024-10-18' },
  { id: 'r-016', partnerId: 'p-009', userId: 'u-017', userName: 'Tanvi Agarwal', userAvatar: 'https://i.pravatar.cc/50?img=45', rating: 5, comment: 'Sneha is so energetic and fun! Made shopping in Indiranagar a blast.', date: '2024-11-13' },
  { id: 'r-017', partnerId: 'p-009', userId: 'u-018', userName: 'Manish Reddy', userAvatar: 'https://i.pravatar.cc/50?img=46', rating: 5, comment: 'Best budget companion in Bengaluru. Super friendly and punctual!', date: '2024-11-07' },
  { id: 'r-018', partnerId: 'p-010', userId: 'u-019', userName: 'Vivek Chopra', userAvatar: 'https://i.pravatar.cc/50?img=47', rating: 5, comment: 'Karan is the definition of class. Perfect for upscale events and luxury shopping.', date: '2024-11-11' },
  { id: 'r-019', partnerId: 'p-010', userId: 'u-020', userName: 'Anita Bhatia', userAvatar: 'https://i.pravatar.cc/50?img=48', rating: 4, comment: 'Premium experience indeed. Very professional and well-mannered.', date: '2024-10-22' },
  { id: 'r-020', partnerId: 'p-011', userId: 'u-021', userName: 'Kunal Sharma', userAvatar: 'https://i.pravatar.cc/50?img=49', rating: 5, comment: 'Divya showed us the most beautiful spots in Jaipur. Heritage walk was magical!', date: '2024-11-09' },
];

// TODO: replace with Supabase query
export function getReviewsByPartnerId(partnerId: string): Review[] {
  return MOCK_REVIEWS.filter(r => r.partnerId === partnerId);
}
