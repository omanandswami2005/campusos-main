'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Input } from '@campus-os/ui';
import { Label } from '@campus-os/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';

const PRINTING_API = process.env.NEXT_PUBLIC_PRINTING_API || 'http://localhost:4100';

interface PrintShop {
  id: string;
  name: string;
  location: string;
  collegeId: string;
  isActive: boolean;
  pricePerPageBW: number;
  pricePerPageColor: number;
  resourceStatus: {
    bwAvailable?: boolean;
    colorAvailable?: boolean;
    a4Available?: boolean;
    paper?: boolean;
  };
}

// Demo shops (fallback)
const demoShops: PrintShop[] = [
  {
    id: 'shop-1',
    name: 'North Campus Print',
    location: 'Library Ground Floor',
    collegeId: 'college-a',
    isActive: true,
    pricePerPageBW: 50,
    pricePerPageColor: 250,
    resourceStatus: { bwAvailable: true, colorAvailable: true, a4Available: true, paper: true },
  },
  {
    id: 'shop-2',
    name: 'South Campus Print',
    location: 'Student Center',
    collegeId: 'college-a',
    isActive: true,
    pricePerPageBW: 60,
    pricePerPageColor: 280,
    resourceStatus: { bwAvailable: true, colorAvailable: false, a4Available: true, paper: true },
  },
  {
    id: 'shop-3',
    name: 'Engineering Block Print',
    location: 'Near Cafeteria',
    collegeId: 'college-a',
    isActive: true,
    pricePerPageBW: 40,
    pricePerPageColor: 200,
    resourceStatus: { bwAvailable: true, colorAvailable: true, a4Available: true, paper: true },
  },
];

export default function PrintingPage() {
  const [shops, setShops] = useState<PrintShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<PrintShop | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [pages, setPages] = useState(10);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [doubleSided, setDoubleSided] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch(`${PRINTING_API}/shops`);
      const data = await res.json();
      const shopList = data.data || data || [];
      setShops(shopList.length > 0 ? shopList : demoShops);
    } catch {
      setShops(demoShops);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedShop) return 0;
    const pricePerPage = isColor ? selectedShop.pricePerPageColor : selectedShop.pricePerPageBW;
    const effectivePages = doubleSided ? Math.ceil(pages / 2) : pages;
    return pricePerPage * effectivePages * copies;
  };

  const handlePrint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${PRINTING_API}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          collegeId: 'college-a',
          shopId: selectedShop.id,
          fileName: fileName || 'Document.pdf',
          fileUrl: fileUrl,
          pages: pages,
          copies: copies,
          config: { color: isColor, doubleSided, paperSize: 'A4' },
          paymentMethod: 'upi',
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSuccess('🎉 Print job submitted! Check "My Jobs" for status.');
      setFileUrl('');
      setFileName('');
      setTimeout(() => setDialogOpen(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit print job');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">🖨️ Print Services</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Find a print shop and submit your documents
            </p>
          </div>
          <Link href="/printing/jobs">
            <Button variant="outline" className="flex items-center gap-2">
              📋 My Print Jobs
            </Button>
          </Link>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-56" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card
                key={shop.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{shop.name}</CardTitle>
                    <Badge
                      variant={
                        shop.resourceStatus.paper || shop.resourceStatus.bwAvailable
                          ? 'default'
                          : 'destructive'
                      }
                      className={
                        shop.resourceStatus.paper || shop.resourceStatus.bwAvailable
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {shop.resourceStatus.paper || shop.resourceStatus.bwAvailable
                        ? '🟢 Open'
                        : '🔴 Closed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    📍 {shop.location}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500">B&W</div>
                      <div className="font-semibold">
                        ₹{(shop.pricePerPageBW / 100).toFixed(2)}/page
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500">Color</div>
                      <div className="font-semibold">
                        ₹{(shop.pricePerPageColor / 100).toFixed(2)}/page
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {shop.resourceStatus.bwAvailable && <Badge variant="outline">B&W ✓</Badge>}
                    {shop.resourceStatus.colorAvailable && <Badge variant="outline">Color ✓</Badge>}
                    {shop.resourceStatus.a4Available && <Badge variant="outline">A4 ✓</Badge>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog
                    open={dialogOpen && selectedShop?.id === shop.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) {
                        setSelectedShop(shop);
                        setSuccess('');
                        setError('');
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full group-hover:bg-indigo-600 transition-colors"
                        onClick={() => setSelectedShop(shop)}
                      >
                        Print Here
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>🖨️ Print at {shop.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePrint} className="space-y-4 mt-4">
                        {success && (
                          <Alert className="bg-green-50 text-green-800 border-green-200">
                            <AlertDescription>{success}</AlertDescription>
                          </Alert>
                        )}
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label>File Name</Label>
                          <Input
                            placeholder="e.g., Assignment.pdf"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>File URL (or upload)</Label>
                          <Input
                            placeholder="https://example.com/doc.pdf"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Pages</Label>
                            <Input
                              type="number"
                              min="1"
                              value={pages}
                              onChange={(e) => setPages(Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Copies</Label>
                            <Input
                              type="number"
                              min="1"
                              value={copies}
                              onChange={(e) => setCopies(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isColor}
                              onChange={(e) => setIsColor(e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span>Color Print</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doubleSided}
                              onChange={(e) => setDoubleSided(e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span>Double-sided</span>
                          </label>
                        </div>

                        {/* Price Preview */}
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Estimated Total
                            </span>
                            <span className="text-2xl font-bold text-indigo-600">
                              ₹{(calculatePrice() / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={uploading}>
                          {uploading ? 'Submitting...' : 'Submit Print Job'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
