# Printing Service

Campus OS Print Service - Find print shops, submit documents, and track your print jobs.

## Features

- 🏪 **Print Shop Directory** - Browse available print shops with pricing
- 📄 **Job Submission** - Submit documents with color/double-sided options
- 📋 **Job Tracking** - Track status (pending → processing → ready → collected)
- 🔢 **OTP Collection** - Get OTP when job is ready for pickup
- 💰 **Price Calculator** - Real-time price estimation

## Running the Service

```bash
pnpm dev:printing
# or
pnpm --filter @campus-os/service-printing dev
```

The service runs on **http://localhost:4100**

## API Endpoints

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/health`       | Health check         |
| GET    | `/shops`        | List all print shops |
| GET    | `/shops/:id`    | Get shop details     |
| POST   | `/jobs`         | Create print job     |
| GET    | `/jobs?userId=` | List user's jobs     |
| GET    | `/jobs/:id`     | Get job status       |
| PATCH  | `/jobs/:id`     | Update job status    |
| DELETE | `/jobs/:id`     | Cancel job           |

## Data Models

### PrintShop

```typescript
{
  id: string;
  name: string;
  location: string;
  collegeId: string;
  isActive: boolean;
  pricePerPageBW: number; // in paise
  pricePerPageColor: number;
  resourceStatus: {
    bwAvailable: boolean;
    colorAvailable: boolean;
    a4Available: boolean;
  }
}
```

### PrintJob

```typescript
{
  id: string;
  userId: string;
  shopId: string;
  fileName: string;
  fileUrl?: string;
  pages: number;
  copies: number;
  config: {
    color: boolean;
    doubleSided: boolean;
    paperSize: string;
  };
  status: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
  totalPrice: number;
  otp?: string;
  createdAt: string;
}
```

## Demo Data

The service includes 2 seeded print shops:

- North Campus Print (Library Ground Floor)
- South Campus Print (Student Center)

## Frontend Pages

- `/printing` - Browse shops and submit jobs
- `/printing/jobs` - Track your print jobs
