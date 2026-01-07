'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Input } from '@campus-os/ui';
import { Label } from '@campus-os/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';
import { HttpClient } from '@campus-os/api-client';
import { PrintingClient } from '@campus-os/api-client';
import type { PrintShop } from '@campus-os/types';

const httpClient = new HttpClient({ baseUrl: 'http://localhost:4100' });
const printingClient = new PrintingClient(httpClient);

export default function PrintingPage() {
  const [shops, setShops] = useState<PrintShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [copies, setCopies] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const data = await printingClient.listShops();
        setShops(data);
      } catch (err) {
        console.error('Failed to load shops', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handlePrint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await printingClient.createJob({
        userId: 'user-123', // Demo user
        collegeId: 'college-a',
        shopId: selectedShop,
        fileName: 'Document.pdf',
        fileUrl: fileUrl,
        pages: 10, // Mock page count
        config: { color: false, doubleSided: true, paperSize: 'A4' },
        paymentMethod: 'upi',
      });
      setSuccess('Print job submitted successfully!');
      setFileUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit print job');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Print Shops</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{shop.name}</CardTitle>
                  <Badge variant={shop.resourceStatus.paper ? 'default' : 'destructive'}>
                    {shop.resourceStatus.paper ? 'Open' : 'Out of Paper'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">📍 {shop.location}</p>
                <div className="flex gap-4 text-sm">
                  <span>B&W: ₹{shop.pricePerPageBW}</span>
                  <span>Color: ₹{shop.pricePerPageColor}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedShop(shop.id);
                        setSuccess('');
                        setError('');
                      }}
                    >
                      Print Here
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Print at {shop.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePrint} className="space-y-4 mt-4">
                      {success && (
                        <Alert className="bg-green-50 text-green-800">
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label>File URL (Demo)</Label>
                        <Input
                          placeholder="https://example.com/doc.pdf"
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          required
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
  );
}
