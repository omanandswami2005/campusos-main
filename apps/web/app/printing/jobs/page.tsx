'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { HttpClient } from '@campus-os/api-client';
import { PrintingClient } from '@campus-os/api-client';
import type { PrintJobStatus } from '@campus-os/types';

const httpClient = new HttpClient({ baseUrl: 'http://localhost:4100' });
const printingClient = new PrintingClient(httpClient);

// Mock job list since API client only has getJobStatus
// In a real app, we'd have listJobs()
const MOCK_JOBS = ['job-1', 'job-2', 'job-3'];

export default function JobStatusPage() {
  const [jobs, setJobs] = useState<PrintJobStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const promises = MOCK_JOBS.map((id) => printingClient.getJobStatus(id));
        const results = await Promise.all(promises);
        setJobs(results);
      } catch (err) {
        // Ignore individual errors for mock
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Poll every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Print Jobs</h1>

      {loading && jobs.length === 0 ? (
        <div className="text-center text-gray-500">Loading jobs...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <Card key={idx}>
              <CardContent className="flex justify-between items-center p-6">
                <div>
                  <div className="font-bold">Job #{job.jobId}</div>
                  <div className="text-sm text-gray-500">
                    {job.status === 'ready'
                      ? 'Ready for pickup'
                      : job.status === 'error'
                        ? 'Print failed'
                        : job.status === 'picked-up'
                          ? 'Picked Up'
                          : 'Printing in progress...'}
                  </div>
                </div>
                <Badge
                  variant={
                    job.status === 'ready'
                      ? 'default'
                      : job.status === 'error'
                        ? 'destructive'
                        : job.status === 'picked-up'
                          ? 'outline'
                          : 'secondary'
                  }
                >
                  {job.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 && (
            <div className="text-center p-10 bg-gray-50 rounded-lg text-gray-500">
              No active print jobs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
