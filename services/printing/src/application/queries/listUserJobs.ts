import { memory } from '../state/memory.js';
import type { PrintJob } from '@campus-os/types';

export const listUserJobs = async (userId: string): Promise<PrintJob[]> => {
  const allJobs = Array.from(memory.jobs.values());
  return allJobs
    .filter((job) => job.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
