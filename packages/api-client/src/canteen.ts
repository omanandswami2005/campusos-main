import type { MenuItem, Order } from '@campus-os/types';
import { HttpClient } from './http';

export class CanteenClient {
  constructor(private http: HttpClient) {}
  listMenu() {
    return this.http.get<MenuItem[]>('/canteen/menu');
  }
  createOrder(input: Pick<Order, 'items' | 'pickupTime'> & { userId: string }) {
    return this.http.post<Order>('/canteen/orders', input);
  }
}
