'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';

const EVENTS_API = process.env.NEXT_PUBLIC_EVENTS_API || 'http://localhost:4200';

interface Certificate {
  id: string;
  eventName: string;
  eventDate: string;
  type: 'participation' | 'winner' | 'organizer';
  certificateNumber: string;
  issuedAt: string;
  downloadUrl: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('events_token');
      if (!token) {
        // Demo data
        setCertificates([
          {
            id: 'cert-1',
            eventName: 'Hackathon 2025',
            eventDate: '2025-12-15',
            type: 'participation',
            certificateNumber: 'CERT-2025-HAK-001',
            issuedAt: '2025-12-16T10:00:00Z',
            downloadUrl: '#',
          },
          {
            id: 'cert-2',
            eventName: 'Web Development Workshop',
            eventDate: '2025-11-20',
            type: 'participation',
            certificateNumber: 'CERT-2025-WDW-042',
            issuedAt: '2025-11-21T14:00:00Z',
            downloadUrl: '#',
          },
        ]);
        return;
      }

      const res = await fetch(`${EVENTS_API}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCertificates(data.data || data || []);
    } catch {
      console.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'winner':
        return 'bg-yellow-100 text-yellow-800';
      case 'organizer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your earned certificates and achievements
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse h-48" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
              <p className="text-gray-500 mb-4">Attend events to earn certificates!</p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/10 to-transparent" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeStyle(cert.type)}>
                      {cert.type.charAt(0).toUpperCase() + cert.type.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-500 font-mono">
                      {cert.certificateNumber}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{cert.eventName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div>📅 Event: {new Date(cert.eventDate).toLocaleDateString()}</div>
                    <div>🎫 Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <span className="mr-2">📥</span> Download Certificate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
