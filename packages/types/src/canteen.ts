export interface MenuItem {
  id: string;
  name: string;
  priceCents: number;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  pickupTime: string; // ISO
  status: 'pending' | 'confirmed' | 'ready' | 'picked-up' | 'cancelled';
  totalCents: number;
}
