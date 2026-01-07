import type { PrintJobStatus } from '@campus-os/types';
import { memory } from '../state/memory';

export const getJobStatus = async (jobId: string): Promise<PrintJobStatus | null> => {
  const job = memory.jobs.get(jobId);
  if (!job) return null;
  return {
    jobId: job.id,
    status: job.status,
    estimatedReadyTime: job.status === 'queued' || job.status === 'printing'
      ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
      : undefined
  };
};
