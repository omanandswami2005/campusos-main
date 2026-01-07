import { useEffect, useMemo, useState } from 'react';
import type { PrintJob, PrintShop } from '@campus-os/types';
import { HttpClient, PrintingClient } from '@campus-os/api-client';
import { Button } from '@campus-os/ui';

const apiBase = import.meta.env.VITE_PRINTING_API ?? 'http://localhost:4100';

export const PrintingView = () => {
  const client = useMemo(() => new PrintingClient(new HttpClient({ baseUrl: apiBase })), [apiBase]);
  const [shops, setShops] = useState<PrintShop[]>([]);
  const [job, setJob] = useState<PrintJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await client.listShops();
        setShops(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load shops');
      }
    };
    load();
  }, [client]);

  const createDemoJob = async (shopId: string) => {
    try {
      setError(null);
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
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">
        Demo view calling the printing service. Configure VITE_PRINTING_API to point to the service
        URL.
      </p>
      {error && <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="space-y-2">
        {shops.map((shop) => (
          <div key={shop.id} className="rounded border bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{shop.name}</div>
                <div className="text-xs text-gray-600">{shop.location}</div>
              </div>
              <span className="text-[11px] uppercase text-gray-500">{shop.isActive ? 'Open' : 'Closed'}</span>
            </div>
            <div className="mt-1 text-xs text-gray-700">
              BW: {shop.pricePerPageBW}¢ · Color: {shop.pricePerPageColor}¢
            </div>
            <Button className="mt-2 w-full" onClick={() => createDemoJob(shop.id)}>
              Create demo job
            </Button>
          </div>
        ))}
        {!shops.length && <div className="text-xs text-gray-600">No shops available.</div>}
      </div>
      {job && (
        <div className="rounded border bg-green-50 p-3 text-xs text-green-800">
          <div className="font-semibold">Job created</div>
          <div>ID: {job.id}</div>
          <div>Status: {job.status}</div>
          <div>OTP: {job.otp}</div>
          <div>Total: {job.totalCents} cents</div>
        </div>
      )}
    </div>
  );
};
