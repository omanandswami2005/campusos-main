export interface PrintShop {
  id: string;
  name: string;
  location: string;
  collegeId: string;
  isActive: boolean; // Open/Closed status
  lat?: number;
  lng?: number;
  pricePerPageBW: number; // cents
  pricePerPageColor: number; // cents
  resourceStatus: {
    bwAvailable: boolean;
    colorAvailable: boolean;
    a3Available: boolean;
    a4Available: boolean;
  };
}

export interface PrintJobConfig {
  color: boolean;
  doubleSided: boolean;
  copies: number;
  paperSize: 'a4' | 'a3';
}

export interface PrintJob {
  id: string;
  userId: string;
  collegeId: string;
  shopId: string;
  fileName: string;
  fileUrl: string; // Encrypted blob URL
  config: PrintJobConfig;
  pages: number;
  totalCents: number;
  paymentMethod: 'upi' | 'wallet';
  paymentStatus: 'pending' | 'completed' | 'failed';
  otp: string; // 4-digit collection OTP
  status: 'queued' | 'printing' | 'ready' | 'picked-up' | 'error';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface PrintJobStatus {
  jobId: string;
  status: PrintJob['status'];
  estimatedReadyTime?: string; // ISO
}
