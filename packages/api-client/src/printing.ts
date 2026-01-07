import type { PrintJob, PrintJobStatus, PrintShop } from '@campus-os/types';
import { HttpClient } from './http';

export interface CreatePrintJobInput {
  userId: string;
  collegeId: string;
  shopId: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  config: PrintJob['config'];
  paymentMethod: PrintJob['paymentMethod'];
}

export class PrintingClient {
  constructor(private http: HttpClient) {}

  listShops(collegeId?: string) {
    const query = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
    return this.http.get<PrintShop[]>(`/shops${query}`);
  }

  createJob(input: CreatePrintJobInput) {
    return this.http.post<PrintJob>('/jobs', input);
  }

  getJobStatus(jobId: string) {
    return this.http.get<PrintJobStatus>(`/jobs/${jobId}`);
  }
}
