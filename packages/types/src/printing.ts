export interface PrintJob {
  id: string;
  userId: string;
  fileName: string;
  pages: number;
  color: boolean;
  status: 'queued' | 'printing' | 'done' | 'error';
}
