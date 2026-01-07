export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  collegeId: string;
}

export interface PromotionalOffer {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  startDate: string; // ISO
  endDate: string; // ISO
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  collegeId: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  priceCents: number;
}

export interface Order {
  id: string;
  userId: string;
  collegeId: string;
  items: OrderItem[];
  deliveryLocation: string;
  paymentMethod: 'online' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  appliedOffer?: string; // offer code
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  otp?: string; // 4-digit OTP for delivery verification
  otpExpiresAt?: string; // ISO
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface MessMenu {
  id: string;
  collegeId: string;
  week: string; // ISO week identifier
  meals: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  }[];
  published: boolean;
}

export interface MessVotingPoll {
  id: string;
  collegeId: string;
  title: string;
  options: string[];
  votes: Record<string, number>; // option -> count
  active: boolean;
  startDate: string; // ISO
  endDate: string; // ISO
}

export interface MessRedemption {
  id: string;
  userId: string;
  collegeId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  timestamp: string; // ISO
}

export interface FoodWastage {
  id: string;
  collegeId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'canteen';
  weightGrams: number;
  date: string; // ISO date (no time)
  notes?: string;
}
