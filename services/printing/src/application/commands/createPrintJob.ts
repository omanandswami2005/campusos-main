import { randomUUID } from 'node:crypto';
import { memory } from '../state/memory';
import type { PrintJob, PrintJobConfig } from '@campus-os/types';

export interface CreatePrintJobInput {
  userId: string;
  collegeId: string;
  shopId: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  config: PrintJobConfig;
  paymentMethod: 'upi' | 'wallet';
}

export const createPrintJob = async (input: CreatePrintJobInput): Promise<PrintJob> => {
  const shop = memory.shops.get(input.shopId);
  if (!shop) throw new Error('Invalid shopId');
  const id = randomUUID();
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const pricePerPage = input.config.color ? shop.pricePerPageColor : shop.pricePerPageBW;
  const totalCents = input.pages * pricePerPage * input.config.copies;

  const now = new Date().toISOString();
  const job: PrintJob = {
    id,
    userId: input.userId,
    collegeId: input.collegeId,
    shopId: input.shopId,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    config: input.config,
    pages: input.pages,
    totalCents,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'pending',
    otp,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
  };
  memory.jobs.set(id, job);
  return job;
};
