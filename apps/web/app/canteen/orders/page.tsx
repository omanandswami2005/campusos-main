'use client';

import { useState, useEffect } from 'react';
import { HttpClient } from '@campus-os/api-client';
import { CanteenClient } from '@campus-os/api-client';
import { DataTable } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';
import type { Order } from '@campus-os/types';
import type { Column } from '@campus-os/ui';

const httpClient = new HttpClient({ baseUrl: 'http://localhost:4000' });
const canteenClient = new CanteenClient(httpClient);

const columns: Column<Order>[] = [
  {
    key: 'id',
    header: 'Order ID',
    render: (order) => <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span>,
  },
  {
    key: 'items',
    header: 'Items',
    render: (order) => <span>{order.items.length} items</span>,
  },
  {
    key: 'totalAmount', // Use a unique key
    header: 'Total',
    render: (order) => <span>₹{(order.totalCents / 100).toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (order) => {
      const colors: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline' | null | undefined
      > = {
        pending: 'secondary',
        preparing: 'default',
        ready: 'default',
        completed: 'outline',
        cancelled: 'destructive',
      };
      return <Badge variant={colors[order.status] || 'secondary'}>{order.status}</Badge>;
    },
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (order) => <span>{new Date(order.createdAt).toLocaleDateString()}</span>,
  },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await canteenClient.listOrders();
        setOrders(data);
      } catch {
        setError('Failed to load orders. Please login first.');
        // In real app, we handle auth redirect
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Orders</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : (
        <DataTable columns={columns} data={orders} keyExtractor={(item) => item.id} />
      )}
    </div>
  );
}
