import type { MenuItem, Order, PromotionalOffer, MessVotingPoll } from '@campus-os/types';
import { HttpClient } from './http';

export interface CreateOrderInput {
  userId: string;
  collegeId: string;
  deliveryLocation: string;
  paymentMethod: Order['paymentMethod'];
  appliedOffer?: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; collegeId: string; role: string };
}

export interface CreatePollInput {
  title: string;
  options: string[];
}

export interface VoteInput {
  pollId: string;
  option: string;
}

export class CanteenClient {
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const init: RequestInit = { method };
    if (this.token) {
      (init.headers as Record<string, string>) = { Authorization: `Bearer ${this.token}` };
    }
    if (method !== 'GET' && body) {
      if (!init.headers) init.headers = {};
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const res = await fetch(new URL(path, this.http['opts'].baseUrl), init);
    if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }

  login(input: LoginInput) {
    return this.request<LoginResponse>('POST', '/login', input);
  }

  listMenu(collegeId?: string) {
    const query = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
    return this.http.get<MenuItem[]>(`/menu${query}`);
  }

  listOffers(collegeId?: string) {
    const query = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
    return this.http.get<PromotionalOffer[]>(`/offers${query}`);
  }

  createOrder(input: CreateOrderInput) {
    return this.request<Order>('POST', '/orders', input);
  }

  getOrder(id: string) {
    return this.request<Order>('GET', `/orders/${id}`);
  }

  updateStatus(orderId: string, nextStatus: Order['status'], otp?: string) {
    return this.request<Order>('POST', `/orders/${orderId}/status`, { nextStatus, otp });
  }

  listOrders(collegeId?: string) {
    const query = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
    return this.request<Order[]>(`GET`, `/orders${query}`);
  }

  listPolls(collegeId?: string) {
    const query = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
    return this.http.get<MessVotingPoll[]>(`/polls${query}`);
  }

  createPoll(input: CreatePollInput) {
    return this.request<MessVotingPoll>('POST', '/polls', input);
  }

  vote(input: VoteInput) {
    return this.request<MessVotingPoll>('POST', '/vote', input);
  }
}
