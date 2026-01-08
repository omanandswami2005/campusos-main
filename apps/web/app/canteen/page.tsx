'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { HttpClient } from '@campus-os/api-client';
import { CanteenClient } from '@campus-os/api-client';
import type { MenuItem } from '@campus-os/types';
import { ThemeToggle } from '../providers/ThemeToggle';

const CANTEEN_API = process.env.NEXT_PUBLIC_CANTEEN_API || 'http://localhost:4000';
const PAYMENT_API = process.env.NEXT_PUBLIC_PAYMENT_API || 'http://localhost:4400';

const httpClient = new HttpClient({ baseUrl: CANTEEN_API });
const canteenClient = new CanteenClient(httpClient);

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CanteenMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await canteenClient.listMenu();
        setMenu(data);
      } catch (err) {
        console.error('Failed to load menu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

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
  const totalCost = (totalCents / 100).toFixed(2);

  const handleCheckout = useCallback(async () => {
    if (!totalCents || checkingOut) return;
    setCheckingOut(true);

    try {
      // 1. Create order ID
      const orderId = `order-${Date.now()}`;

      // 2. Create Razorpay payment order
      const paymentRes = await fetch(`${PAYMENT_API}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: totalCents,
          orderId,
          notes: { items: JSON.stringify(cart) },
        }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment order');
      }

      const paymentData = await paymentRes.json();
      const { razorpayOrderId, keyId } = paymentData.data;

      // 3. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: totalCents,
        currency: 'INR',
        name: 'Campus Canteen',
        description: `Order: ${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // 4. Verify payment
          const verifyRes = await fetch(`${PAYMENT_API}/payments/verify`, {
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
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Student',
          email: 'student@college.edu',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setCheckingOut(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  }, [totalCents, cart, checkingOut]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container mx-auto p-6 relative min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-950">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
            🍽️ Campus Canteen
          </h1>
          <ThemeToggle />
        </div>

        {orderSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
            <div className="font-bold">✅ Order Placed Successfully!</div>
            <div className="text-sm">Order ID: {orderSuccess}</div>
            <div className="text-sm mt-1">
              Your food will be ready soon. Show this at the counter.
            </div>
            <Button
              className="mt-2"
              variant="outline"
              size="sm"
              onClick={() => setOrderSuccess(null)}
            >
              Place Another Order
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>
            <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>
            <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-28">
            {menu.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-6xl">
                  {item.category === 'beverages'
                    ? '☕'
                    : item.category === 'snacks'
                      ? '🥪'
                      : item.category === 'meals'
                        ? '🍛'
                        : '🍔'}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant={item.available ? 'default' : 'secondary'}>
                      {item.available ? 'Available' : 'Sold Out'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <div className="text-2xl font-bold mt-2 text-orange-600">
                    ₹{(item.priceCents / 100).toFixed(0)}
                  </div>
                </CardHeader>
                <CardFooter className="mt-auto pt-0">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-4 w-full justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-10 w-10 rounded-full"
                      >
                        −
                      </Button>
                      <span className="font-bold text-xl w-8 text-center">{cart[item.id]}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        className="h-10 w-10 rounded-full"
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
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {totalItems > 0 && !orderSuccess && (
          <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-50">
            <Card className="bg-gradient-to-r from-gray-900 to-black text-white shadow-2xl border-0">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">
                    {totalItems} item{totalItems > 1 ? 's' : ''}
                  </div>
                  <div className="text-2xl font-bold text-orange-400">₹{totalCost}</div>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  {checkingOut ? 'Processing...' : 'Pay Now →'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
