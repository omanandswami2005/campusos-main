'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { HttpClient } from '@campus-os/api-client';
import { CanteenClient } from '@campus-os/api-client';
import type { MenuItem } from '@campus-os/types';

const httpClient = new HttpClient({ baseUrl: 'http://localhost:4000' });
const canteenClient = new CanteenClient(httpClient);

export default function CanteenMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);

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
  const totalCost = Object.entries(cart)
    .reduce((sum, [id, qty]) => {
      const item = menu.find((m) => m.id === id);
      return sum + (item ? (item.priceCents / 100) * qty : 0);
    }, 0)
    .toFixed(2);

  return (
    <div className="container mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Canteen Menu</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {menu.map((item) => (
            <Card key={item.id} className="flex flex-col">
              {/* Image placeholder */}
              <div className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center text-4xl">
                🍔
              </div>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <Badge variant={item.available ? 'default' : 'secondary'}>
                    {item.available ? 'Available' : 'Sold Out'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mt-2">₹{(item.priceCents / 100).toFixed(2)}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{item.category}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                {cart[item.id] ? (
                  <div className="flex items-center gap-4 w-full justify-center">
                    <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                      -
                    </Button>
                    <span className="font-bold">{cart[item.id]}</span>
                    <Button variant="outline" size="sm" onClick={() => addToCart(item.id)}>
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
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

      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px]">
          <Card className="bg-black text-white shadow-2xl">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-lg">{totalItems} items</div>
                <div className="text-sm text-gray-400">Total: ₹{totalCost}</div>
              </div>
              <Button variant="secondary" onClick={() => alert('Checkout not implemented')}>
                Checkout →
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
