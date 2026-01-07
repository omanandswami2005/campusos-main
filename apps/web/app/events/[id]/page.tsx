'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';
import { EventsClient } from '@campus-os/api-client';
import { HttpClient } from '@campus-os/api-client';
import type { Event } from '@campus-os/types';

const httpClient = new HttpClient({ baseUrl: 'http://localhost:4200' });
const eventsClient = new EventsClient(httpClient);

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await eventsClient.getEvent(id);
        setEvent(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    setError('');
    try {
      // In a real app, userId would come from auth context
      await eventsClient.registerForEvent(id);
      setSuccessMsg('Successfully registered!');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Event not found.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Events
      </Button>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <Badge variant="secondary" className="mb-2">
              {event.category}
            </Badge>
            <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
              {event.status}
            </Badge>
          </div>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
          <div className="flex gap-4 text-sm text-gray-500 mt-2">
            <span>
              📅 {new Date(event.start).toLocaleString()} -{' '}
              {new Date(event.end).toLocaleTimeString()}
            </span>
            <span>📍 {event.location}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">About this event</h3>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>

            {event.tags && event.tags.length > 0 && (
              <div className="mt-4 flex gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button size="lg" onClick={handleRegister} disabled={registering || !!successMsg}>
            {successMsg ? 'Registered' : registering ? 'Registering...' : 'Register Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
