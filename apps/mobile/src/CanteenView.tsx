import { useEffect, useMemo, useState } from 'react';
import type { MenuItem, Order, PromotionalOffer } from '@campus-os/types';
import { Button } from '@campus-os/ui';
import { CanteenClient, HttpClient } from '@campus-os/api-client';

const apiBase = import.meta.env.VITE_CANTEEN_API ?? 'http://localhost:4000';
const collegeId = 'college-a';

export const CanteenView = () => {
  const client = useMemo(() => new CanteenClient(new HttpClient({ baseUrl: apiBase })), [apiBase]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [m, o] = await Promise.all([client.listMenu(collegeId), client.listOffers(collegeId)]);
        setMenu(m);
        setOffers(o);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      }
    };
    load();
  }, [client]);

  const placeOrder = async (item: MenuItem, offerCode?: string) => {
    try {
      setError(null);
      const created = await client.createOrder({
        userId: 'demo-user',
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
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">
        Demo canteen ordering. Set VITE_CANTEEN_API to your canteen service URL.
      </p>
      {error && <div className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">{error}</div>}
      <div className="space-y-2">
        {menu.map((item) => (
          <div key={item.id} className="rounded border bg-white p-3 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
              <div className="text-sm font-semibold">₹{(item.priceCents / 100).toFixed(2)}</div>
            </div>
            <div className="text-[11px] uppercase text-gray-500">{item.category}</div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => placeOrder(item)}>Order</Button>
              {offers[0] && (
                <Button className="flex-1" variant="secondary" onClick={() => placeOrder(item, offers[0].code)}>
                  {offers[0].code}
                </Button>
              )}
            </div>
          </div>
        ))}
        {!menu.length && <div className="text-xs text-gray-600">No menu available.</div>}
      </div>
      {order && (
        <div className="rounded border bg-green-50 p-3 text-xs text-green-800 space-y-1">
          <div className="font-semibold">Order placed</div>
          <div>ID: {order.id}</div>
          <div>Status: {order.status}</div>
          <div>Total: ₹{(order.totalCents / 100).toFixed(2)}</div>
          {order.otp && <div>OTP: {order.otp}</div>}
        </div>
      )}
    </div>
  );
};
