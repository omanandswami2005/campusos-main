'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PrintJob, PrintShop } from '@campus-os/types';
import { HttpClient, PrintingClient } from '@campus-os/api-client';
import { AppShell, Button } from '@campus-os/ui';

const apiBase = process.env.NEXT_PUBLIC_PRINTING_API ?? 'http://localhost:4100';

export default function PrintingPage() {
  const client = useMemo(() => new PrintingClient(new HttpClient({ baseUrl: apiBase })), [apiBase]);
  const [shops, setShops] = useState<PrintShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<PrintJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await client.listShops();
        setShops(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load shops');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [client]);

  const createDemoJob = async (shopId: string) => {
    setError(null);
    try {
      const created = await client.createJob({
        userId: 'demo-user',
        collegeId: 'college-a',
        shopId,
        fileName: 'demo.pdf',
        fileUrl: 'https://example.com/demo.pdf',
        pages: 4,
        config: { color: false, doubleSided: true, copies: 1, paperSize: 'a4' },
        paymentMethod: 'upi'
      });
      setJob(created);
    } catch (e: any) {
      setError(e?.message || 'Failed to create job');
    }
  };

  return (
    <AppShell header={<div className="font-semibold">Printing</div>}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Lists print shops from the printing service and lets you create a demo print job using the
          shared API client. Configure the service URL via NEXT_PUBLIC_PRINTING_API.
        </p>
        {error && <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div>Loading shops…</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {shops.map((shop) => (
              <div key={shop.id} className="rounded border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{shop.name}</div>
                    <div className="text-sm text-gray-600">{shop.location}</div>
                  </div>
                  <span className="text-xs uppercase text-gray-500">{shop.isActive ? 'Open' : 'Closed'}</span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  BW: {shop.pricePerPageBW}¢ · Color: {shop.pricePerPageColor}¢
                </div>
                <Button className="mt-3" onClick={() => createDemoJob(shop.id)}>
                  Create demo job
                </Button>
              </div>
            ))}
            {!shops.length && <div className="text-sm text-gray-600">No shops available.</div>}
          </div>
        )}

        {job && (
          <div className="rounded border bg-green-50 p-4 text-sm text-green-800">
            <div className="font-semibold">Job created</div>
            <div>ID: {job.id}</div>
            <div>Status: {job.status}</div>
            <div>OTP: {job.otp}</div>
            <div>Total: {job.totalCents} cents</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
