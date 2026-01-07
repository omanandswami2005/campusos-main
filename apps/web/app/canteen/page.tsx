'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MenuItem, Order, PromotionalOffer, MessVotingPoll } from '@campus-os/types';
import { AppShell, Button } from '@campus-os/ui';
import { CanteenClient, HttpClient } from '@campus-os/api-client';

const apiBase = process.env.NEXT_PUBLIC_CANTEEN_API ?? 'http://localhost:4000';
const collegeId = 'college-a';

interface AuthUser {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

export default function CanteenPage() {
  const client = useMemo(() => new CanteenClient(new HttpClient({ baseUrl: apiBase })), [apiBase]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth state
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('demo@college.edu');
  const [password, setPassword] = useState('demo123');

  // Voting state
  const [polls, setPolls] = useState<MessVotingPoll[]>([]);
  const [userVote, setUserVote] = useState<Record<string, string>>({});

  // Load menu/offers on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, o] = await Promise.all([client.listMenu(collegeId), client.listOffers(collegeId)]);
        setMenu(m);
        setOffers(o);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [client]);

  // Load polls when auth succeeds
  useEffect(() => {
    if (!auth) return;
    const load = async () => {
      try {
        const data = await client.listPolls(collegeId);
        setPolls(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load polls');
      }
    };
    load();
  }, [auth, client]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await client.login({ email, password });
      client.setToken(result.token);
      setAuth(result);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  };

  const handleVote = async (pollId: string, option: string) => {
    try {
      setError(null);
      const updated = await client.vote({ pollId, option });
      setPolls(polls.map((p) => (p.id === pollId ? updated : p)));
      setUserVote({ ...userVote, [pollId]: option });
    } catch (e: any) {
      setError(e?.message || 'Vote failed');
    }
  };

  const placeOrder = async (item: MenuItem, offerCode?: string) => {
    setError(null);
    try {
      const created = await client.createOrder({
        userId: auth?.user.id || 'demo-user',
        collegeId,
        deliveryLocation: 'Hostel Block A',
        paymentMethod: 'online',
        appliedOffer: offerCode,
        items: [{ menuItemId: item.id, quantity: 1 }]
      });
      setOrder(created);
    } catch (e: any) {
      setError(e?.message || 'Failed to place order');
    }
  };

  return (
    <AppShell header={<div className="font-semibold">Canteen</div>}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Demo ordering flow: loads menu/offers from the canteen service, creates an order, and shows
          applied pricing. Configure NEXT_PUBLIC_CANTEEN_API to point at the service.
        </p>

        {/* Auth Section */}
        {!auth ? (
          <div className="rounded border bg-blue-50 p-4 space-y-3">
            <div className="font-semibold text-sm">Login to vote on mess menu</div>
            <p className="text-xs text-blue-800">
              Demo: demo@college.edu / demo123 or admin@college.edu / admin123
            </p>
            <form onSubmit={login} className="space-y-2 max-w-sm">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <Button className="w-full">Login</Button>
            </form>
          </div>
        ) : (
          <div className="rounded border bg-green-50 px-4 py-3 text-sm text-green-800">
            Logged in as {auth.user.name} ({auth.user.email})
          </div>
        )}

        {error && <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</div>}

        {/* Voting Section */}
        {auth && (
          <div className="rounded border bg-white p-4 space-y-3">
            <h2 className="font-semibold text-sm">Mess Menu Voting</h2>
            {polls.length === 0 ? (
              <div className="text-sm text-gray-600">No active polls.</div>
            ) : (
              polls.map((poll) => (
                <div key={poll.id} className="rounded border bg-gray-50 p-3 space-y-2">
                  <div className="font-semibold text-sm">{poll.title}</div>
                  <div className="space-y-1">
                    {poll.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleVote(poll.id, option)}
                        className={`w-full text-left px-3 py-2 rounded border text-sm transition ${
                          userVote[poll.id] === option
                            ? 'bg-blue-100 border-blue-600'
                            : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {option} ({poll.votes[option] || 0} votes)
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Menu Section */}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {menu.map((item) => (
              <div key={item.id} className="rounded border bg-white p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="text-sm font-semibold">₹{(item.priceCents / 100).toFixed(2)}</div>
                </div>
                <div className="text-xs text-gray-500 uppercase">{item.category}</div>
                <div className="flex gap-2">
                  <Button onClick={() => placeOrder(item)}>Order</Button>
                  {offers[0] && (
                    <Button variant="secondary" onClick={() => placeOrder(item, offers[0].code)}>
                      Apply {offers[0].code}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!menu.length && <div className="text-sm text-gray-600">No menu available.</div>}
          </div>
        )}

        {order && (
          <div className="rounded border bg-green-50 p-4 text-sm text-green-800 space-y-1">
            <div className="font-semibold">Order placed</div>
            <div>ID: {order.id}</div>
            <div>Status: {order.status}</div>
            <div>Subtotal: ₹{(order.subtotalCents / 100).toFixed(2)}</div>
            <div>Discount: ₹{(order.discountCents / 100).toFixed(2)}</div>
            <div>Total: ₹{(order.totalCents / 100).toFixed(2)}</div>
            {order.otp && <div>OTP: {order.otp}</div>}
          </div>
        )}
      </div>
    </AppShell>
  );
}
