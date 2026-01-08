// Initial in-memory state with seed data
// This file is now used by db.ts as the fallback store

import type { MenuItem, Order, PromotionalOffer, MessVotingPoll } from '@campus-os/types';

export interface User {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: 'student' | 'staff' | 'admin';
}

type MemoryState = {
  menu: MenuItem[];
  offers: PromotionalOffer[];
  orders: Map<string, Order>;
  users: Map<string, User & { password: string }>;
  polls: Map<string, MessVotingPoll>;
  userVotes: Map<string, { userId: string; pollId: string; option: string }>;
};

export const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-prod';

// Seed data
const menuSeed: MenuItem[] = [
  {
    id: 'item-coffee',
    name: 'Coffee',
    description: 'Hot brewed coffee',
    priceCents: 2500, // ₹25
    category: 'beverages',
    available: true,
    imageUrl: '',
    collegeId: 'college-a',
  },
  {
    id: 'item-samosa',
    name: 'Samosa',
    description: 'Crispy potato samosa',
    priceCents: 1500, // ₹15
    category: 'snacks',
    available: true,
    imageUrl: '',
    collegeId: 'college-a',
  },
  {
    id: 'item-sandwich',
    name: 'Veg Sandwich',
    description: 'Toasted sandwich with veggies',
    priceCents: 4000, // ₹40
    category: 'snacks',
    available: true,
    imageUrl: '',
    collegeId: 'college-a',
  },
  {
    id: 'item-dosa',
    name: 'Masala Dosa',
    description: 'Crispy dosa with potato filling',
    priceCents: 6000, // ₹60
    category: 'meals',
    available: true,
    imageUrl: '',
    collegeId: 'college-a',
  },
  {
    id: 'item-biryani',
    name: 'Veg Biryani',
    description: 'Aromatic rice with vegetables',
    priceCents: 12000, // ₹120
    category: 'meals',
    available: true,
    imageUrl: '',
    collegeId: 'college-a',
  },
];

const offerSeed: PromotionalOffer[] = [
  {
    id: 'offer10',
    code: 'SAVE10',
    description: '10% off above ₹100',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 10000, // ₹100
    startDate: new Date(Date.now() - 3600_000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
    usageLimit: 1000,
    usedCount: 0,
    active: true,
    collegeId: 'college-a',
  },
];

const userSeed: (User & { password: string })[] = [
  {
    id: 'user-demo',
    name: 'Demo Student',
    email: 'demo@college.edu',
    collegeId: 'college-a',
    role: 'student',
    password: 'demo123',
  },
];

export const memory: MemoryState = {
  menu: menuSeed,
  offers: offerSeed,
  orders: new Map(),
  users: new Map(userSeed.map((u) => [u.email, u] as const)),
  polls: new Map(),
  userVotes: new Map(),
};

// Export null prisma for compatibility if any file still imports it
export const prisma: any = null;
