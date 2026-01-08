'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';

const PRINTING_API = process.env.NEXT_PUBLIC_PRINTING_API || 'http://localhost:4100';

interface PrintJob {
  id: string;
  fileName: string;
  shopName?: string;
  shopId: string;
  pages: number;
  copies: number;
  config: {
    color?: boolean;
    doubleSided?: boolean;
    paperSize?: string;
  };
  status: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  otp?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  processing: { label: 'Printing', color: 'bg-blue-100 text-blue-800', icon: '🖨️' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: '✅' },
  collected: { label: 'Collected', color: 'bg-gray-100 text-gray-800', icon: '📦' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

// Demo data
const demoJobs: PrintJob[] = [
  {
    id: 'job-1',
    fileName: 'Assignment_CS301.pdf',
    shopName: 'North Campus Print',
    shopId: 'shop-1',
    pages: 12,
    copies: 1,
    config: { color: false, doubleSided: true, paperSize: 'A4' },
    status: 'ready',
    totalPrice: 600,
    createdAt: '2026-01-08T14:30:00Z',
    otp: '4521',
  },
  {
    id: 'job-2',
    fileName: 'Project_Report.pdf',
    shopName: 'South Campus Print',
    shopId: 'shop-2',
    pages: 25,
    copies: 2,
    config: { color: true, doubleSided: false, paperSize: 'A4' },
    status: 'processing',
    totalPrice: 12500,
    createdAt: '2026-01-08T15:45:00Z',
  },
  {
    id: 'job-3',
    fileName: 'Resume_2026.pdf',
    shopName: 'North Campus Print',
    shopId: 'shop-1',
    pages: 2,
    copies: 5,
    config: { color: true, doubleSided: false, paperSize: 'A4' },
    status: 'collected',
    totalPrice: 2500,
    createdAt: '2026-01-07T10:00:00Z',
  },
];

export default function MyPrintJobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PRINTING_API}/jobs?userId=user-123`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setJobs(data.data || data || []);

      // Use demo data if no jobs returned
      if ((data.data || data || []).length === 0) {
        setJobs(demoJobs);
      }
    } catch {
      // Use demo data on error
      setJobs(demoJobs);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await fetch(`${PRINTING_API}/jobs/${jobId}`, { method: 'DELETE' });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' as const } : j))
      );
    } catch {
      setError('Failed to cancel job');
    }
  };

  const activeJobs = jobs.filter((j) => ['pending', 'processing', 'ready'].includes(j.status));
  const pastJobs = jobs.filter((j) => ['collected', 'cancelled'].includes(j.status));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Print Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your printing orders</p>
          </div>
          <Link href="/printing">
            <Button>+ New Print</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Active Jobs ({activeJobs.length})
                </h2>
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <div className={`h-1 ${statusConfig[job.status].color.split(' ')[0]}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={statusConfig[job.status].color}>
                                {statusConfig[job.status].icon} {statusConfig[job.status].label}
                              </Badge>
                              {job.status === 'ready' && job.otp && (
                                <Badge className="bg-indigo-100 text-indigo-800 font-mono text-lg px-3">
                                  OTP: {job.otp}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              📄 {job.fileName}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>🏪 {job.shopName}</span>
                              <span>
                                📃 {job.pages} pages × {job.copies} copies
                              </span>
                              <span>{job.config.color ? '🎨 Color' : '⬛ B&W'}</span>
                              <span>💰 ₹{(job.totalPrice / 100).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {job.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleCancel(job.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Jobs */}
            {pastJobs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-500">Past Jobs</h2>
                <div className="space-y-3">
                  {pastJobs.map((job) => (
                    <Card key={job.id} className="opacity-70">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge className={statusConfig[job.status].color}>
                              {statusConfig[job.status].icon}
                            </Badge>
                            <div>
                              <div className="font-medium">{job.fileName}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(job.createdAt).toLocaleDateString()} • {job.shopName}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{(job.totalPrice / 100).toFixed(2)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {jobs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">🖨️</div>
                  <h3 className="text-xl font-semibold mb-2">No print jobs yet</h3>
                  <p className="text-gray-500 mb-4">Submit your first print job!</p>
                  <Link href="/printing">
                    <Button>Find Print Shop</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
