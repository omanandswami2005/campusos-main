import type { PrintJob, PrintShop } from '@campus-os/types';

// Simple in-memory store with seeded shops for demo usage.
export const memory: { shops: Map<string, PrintShop>; jobs: Map<string, PrintJob> } = {
  shops: new Map<string, PrintShop>(),
  jobs: new Map<string, PrintJob>(),
};

memory.shops.set('shop-1', {
  id: 'shop-1',
  name: 'North Campus Print',
  location: 'Library Ground Floor',
  collegeId: 'college-a',
  isActive: true,
  lat: 12.9716,
  lng: 77.5946,
  pricePerPageBW: 50,
  pricePerPageColor: 250,
  resourceStatus: { bwAvailable: true, colorAvailable: true, a3Available: true, a4Available: true },
});

memory.shops.set('shop-2', {
  id: 'shop-2',
  name: 'South Campus Print',
  location: 'Student Center',
  collegeId: 'college-a',
  isActive: true,
  lat: 12.9352,
  lng: 77.6245,
  pricePerPageBW: 60,
  pricePerPageColor: 280,
  resourceStatus: {
    bwAvailable: true,
    colorAvailable: false,
    a3Available: false,
    a4Available: true,
  },
});
