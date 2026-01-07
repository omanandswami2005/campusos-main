'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@campus-os/ui';
import { Alert, AlertDescription } from '@campus-os/ui';
import { EventsClient } from '@campus-os/api-client';
import { HttpClient } from '@campus-os/api-client';
import type { Event } from '@campus-os/types';

// Should be initialized in a context or similar
const httpClient = new HttpClient({ baseUrl: 'http://localhost:4200' });
const eventsClient = new EventsClient(httpClient);

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const filters = category !== 'all' ? { category } : {};
        const data = await eventsClient.listEvents(filters);
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="w-[200px]">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-[300px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{event.category}</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(event.start).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="mt-2">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-gray-600">📍 {event.location}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-10 text-gray-500">No events found.</div>
      )}
    </div>
  );
}
