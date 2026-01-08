import { useState } from 'react';

interface PrintShop {
  id: string;
  name: string;
  location: string;
  pricePerPageBW: number;
  pricePerPageColor: number;
  isOpen: boolean;
}

interface PrintJob {
  id: string;
  fileName: string;
  shopName: string;
  status: 'pending' | 'processing' | 'ready' | 'collected';
  otp?: string;
  totalPrice: number;
}

const demoShops: PrintShop[] = [
  {
    id: 's1',
    name: 'North Campus Print',
    location: 'Library',
    pricePerPageBW: 50,
    pricePerPageColor: 250,
    isOpen: true,
  },
  {
    id: 's2',
    name: 'South Campus Print',
    location: 'Student Center',
    pricePerPageBW: 60,
    pricePerPageColor: 280,
    isOpen: true,
  },
  {
    id: 's3',
    name: 'Engineering Block',
    location: 'Near Cafeteria',
    pricePerPageBW: 40,
    pricePerPageColor: 200,
    isOpen: false,
  },
];

const demoJobs: PrintJob[] = [
  {
    id: 'j1',
    fileName: 'Assignment.pdf',
    shopName: 'North Campus',
    status: 'ready',
    otp: '4521',
    totalPrice: 600,
  },
  {
    id: 'j2',
    fileName: 'Report.pdf',
    shopName: 'South Campus',
    status: 'processing',
    totalPrice: 1200,
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: '🖨️ Printing', color: 'bg-blue-100 text-blue-800' },
  ready: { label: '✅ Ready', color: 'bg-green-100 text-green-800' },
  collected: { label: '📦 Done', color: 'bg-gray-100 text-gray-600' },
};

interface PrintingMobileViewProps {
  onBack: () => void;
}

export function PrintingMobileView({ onBack }: PrintingMobileViewProps) {
  const [shops] = useState<PrintShop[]>(demoShops);
  const [jobs] = useState<PrintJob[]>(demoJobs);
  const [view, setView] = useState<'shops' | 'jobs' | 'print'>('shops');
  const [selectedShop, setSelectedShop] = useState<PrintShop | null>(null);
  const [fileName, setFileName] = useState('');
  const [pages, setPages] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => {
      setView('jobs');
      setSuccess(false);
      setSelectedShop(null);
    }, 1500);
  };

  // Print Form
  if (view === 'print' && selectedShop) {
    return (
      <div className="pb-20">
        <button onClick={() => setView('shops')} className="mb-4 text-indigo-500">
          ← Back
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold mb-4">🖨️ Print at {selectedShop.name}</h2>

          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-semibold text-green-600">Job Submitted!</div>
              <div className="text-sm text-gray-500">Check "My Jobs" for status</div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">File Name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Document.pdf"
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Pages</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated</span>
                    <span className="font-bold text-indigo-600">
                      ₹{((selectedShop.pricePerPageBW * pages) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4 py-3 bg-indigo-500 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Print Job'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Jobs List
  if (view === 'jobs') {
    return (
      <div className="pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2">
              ← Back
            </button>
            <h1 className="text-xl font-bold">My Print Jobs</h1>
          </div>
          <button onClick={() => setView('shops')} className="text-indigo-500 text-sm">
            + New
          </button>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${statusConfig[job.status].color}`}
                >
                  {statusConfig[job.status].label}
                </span>
                {job.otp && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-mono font-bold">
                    OTP: {job.otp}
                  </span>
                )}
              </div>
              <div className="font-semibold">📄 {job.fileName}</div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>🏪 {job.shopName}</span>
                <span>₹{(job.totalPrice / 100).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Shops List (default)
  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2">
            ← Back
          </button>
          <h1 className="text-xl font-bold">Print Shops</h1>
        </div>
        <button onClick={() => setView('jobs')} className="text-indigo-500 text-sm">
          My Jobs
        </button>
      </div>

      <div className="space-y-3">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{shop.name}</div>
                <div className="text-sm text-gray-500">📍 {shop.location}</div>
              </div>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {shop.isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>
            <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span>B&W: ₹{(shop.pricePerPageBW / 100).toFixed(2)}</span>
              <span>Color: ₹{(shop.pricePerPageColor / 100).toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setSelectedShop(shop);
                setView('print');
              }}
              disabled={!shop.isOpen}
              className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Print Here
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
