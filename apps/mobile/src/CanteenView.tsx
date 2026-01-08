import { useEffect, useMemo, useState, useCallback } from 'react';
import type { MenuItem, PromotionalOffer } from '@campus-os/types';
import { Button } from '@campus-os/ui';
import { CanteenClient, HttpClient } from '@campus-os/api-client';

const apiBase = import.meta.env.VITE_CANTEEN_API ?? 'http://localhost:4000';
const paymentBase = import.meta.env.VITE_PAYMENT_API ?? 'http://localhost:4400';
const collegeId = 'college-a';

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CanteenView = () => {
  const client = useMemo(() => new CanteenClient(new HttpClient({ baseUrl: apiBase })), []);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [m, o] = await Promise.all([
          client.listMenu(collegeId),
          client.listOffers(collegeId),
        ]);
        setMenu(m);
        setOffers(o);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      }
    };
    load();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [client]);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 0) next[id] -= 1;
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCents = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item ? item.priceCents * qty : 0);
  }, 0);

  const handleCheckout = useCallback(async () => {
    if (!totalCents || checkingOut) return;
    setCheckingOut(true);
    setError(null);

    try {
      const orderId = `order-${Date.now()}`;

      // Create Razorpay order
      const paymentRes = await fetch(`${paymentBase}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: totalCents,
          orderId,
          notes: { items: JSON.stringify(cart) },
        }),
      });

      if (!paymentRes.ok) throw new Error('Failed to create payment');

      const paymentData = await paymentRes.json();
      const { razorpayOrderId, keyId } = paymentData.data;

      // Open Razorpay
      const options = {
        key: keyId,
        amount: totalCents,
        currency: 'INR',
        name: 'Campus Canteen',
        description: `Order: ${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch(`${paymentBase}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.data?.verified) {
            setOrderSuccess(orderId);
            setCart({});
          } else {
            setError('Payment verification failed');
          }
        },
        prefill: { name: 'Student', email: 'student@campus.edu' },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setCheckingOut(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setError(e?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  }, [totalCents, cart, checkingOut]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-orange-600 dark:text-orange-400">🍽️ Canteen</h2>
        {totalItems > 0 && (
          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
            {totalItems} items
          </span>
        )}
      </div>

      {error && (
        <div className="rounded bg-red-100 dark:bg-red-900/30 px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {orderSuccess && (
        <div className="rounded bg-green-100 dark:bg-green-900/30 p-3 text-xs text-green-800 dark:text-green-400">
          <div className="font-semibold">✅ Order Placed!</div>
          <div>Order ID: {orderSuccess}</div>
          <Button className="mt-2" variant="outline" onClick={() => setOrderSuccess(null)}>
            Order Again
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {menu.map((item) => (
          <div
            key={item.id}
            className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm dark:text-white">{item.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{item.description}</div>
              </div>
              <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                ₹{(item.priceCents / 100).toFixed(0)}
              </div>
            </div>
            <div className="text-[10px] uppercase text-gray-500 dark:text-gray-500">
              {item.category}
            </div>

            {cart[item.id] ? (
              <div className="flex items-center gap-3 justify-center">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => removeFromCart(item.id)}
                >
                  −
                </Button>
                <span className="font-bold w-6 text-center dark:text-white">{cart[item.id]}</span>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => addToCart(item.id)}
                >
                  +
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!item.available}
                onClick={() => addToCart(item.id)}
              >
                Add
              </Button>
            )}
          </div>
        ))}
        {!menu.length && <div className="text-xs text-gray-500">No menu available.</div>}
      </div>

      {totalItems > 0 && !orderSuccess && (
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-black p-3 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white font-bold">
                {totalItems} item{totalItems > 1 ? 's' : ''}
              </div>
              <div className="text-orange-400 font-bold text-lg">
                ₹{(totalCents / 100).toFixed(0)}
              </div>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
