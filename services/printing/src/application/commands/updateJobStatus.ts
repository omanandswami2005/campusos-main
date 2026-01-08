import { memory } from '../state/memory.js';
import type { PrintJob } from '@campus-os/types';

interface UpdateJobInput {
  jobId: string;
  status?: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
}

export const updateJobStatus = async (input: UpdateJobInput): Promise<PrintJob> => {
  const job = memory.jobs.get(input.jobId);

  if (!job) {
    throw new Error('Print job not found');
  }

  if (input.status) {
    job.status = input.status;
  }

  job.updatedAt = new Date().toISOString();

  if (input.status === 'collected' || input.status === 'cancelled') {
    job.completedAt = new Date().toISOString();
  }

  memory.jobs.set(input.jobId, job);
  return job;
};
