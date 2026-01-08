'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';

const EVENTS_API = process.env.NEXT_PUBLIC_EVENTS_API || 'http://localhost:4200';

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  registeredAt: string;
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Get token from localStorage (simplified auth)
      const token = localStorage.getItem('events_token');
      if (!token) {
        // Demo data for hackathon
        setRegistrations([
          {
            id: 'reg-1',
            eventId: 'event-hackathon',
            eventTitle: 'AI/ML Workshop - Building Smart Campus Apps',
            eventDate: '2026-01-15T10:00:00Z',
            eventLocation: 'Tech Hub, Building A',
            status: 'confirmed',
            registeredAt: '2026-01-08T10:30:00Z',
          },
          {
            id: 'reg-2',
            eventId: 'event-cultural',
            eventTitle: 'Annual Cultural Fest - Harmony 2026',
            eventDate: '2026-01-20T16:00:00Z',
            eventLocation: 'Main Auditorium',
            status: 'confirmed',
            registeredAt: '2026-01-07T14:00:00Z',
          },
        ]);
        return;
      }

      const res = await fetch(`${EVENTS_API}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRegistrations(data.data || data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (regId: string) => {
    try {
      const token = localStorage.getItem('events_token');
      await fetch(`${EVENTS_API}/registrations/${regId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch (err: any) {
      setError(err.message || 'Failed to cancel');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Registrations</h1>
            <p className="text-gray-600 dark:text-gray-400">Events you've registered for</p>
          </div>
          <Link href="/events">
            <Button variant="outline">Browse Events</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-32" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No registrations yet</h3>
              <p className="text-gray-500 mb-4">
                Browse events and register for ones that interest you!
              </p>
              <Link href="/events">
                <Button>Explore Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <Card key={reg.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(reg.status)}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Registered {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {reg.eventTitle}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>📅 {new Date(reg.eventDate).toLocaleDateString()}</span>
                        <span>🕐 {new Date(reg.eventDate).toLocaleTimeString()}</span>
                        <span>📍 {reg.eventLocation}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/events/${reg.eventId}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {reg.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleCancel(reg.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
