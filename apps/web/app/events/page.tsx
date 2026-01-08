'use client';

import { useState } from 'react';
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

interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  location?: string;
  category: string;
  registeredCount: number;
  capacity: number;
  status: string;
  tags?: string[];
}

// Demo data
const demoEvents: Event[] = [
  {
    id: 'e1',
    title: 'AI/ML Workshop - Building Smart Campus Apps',
    description: 'Learn to build AI-powered applications using Azure OpenAI and modern frameworks.',
    start: '2026-01-15T10:00:00Z',
    location: 'Tech Hub, Building A',
    category: 'workshop',
    registeredCount: 45,
    capacity: 60,
    status: 'published',
    tags: ['AI', 'Machine Learning', 'Azure'],
  },
  {
    id: 'e2',
    title: 'Annual Cultural Fest - Harmony 2026',
    description: 'The biggest cultural event of the year featuring music, dance, and drama.',
    start: '2026-01-20T16:00:00Z',
    location: 'Main Auditorium',
    category: 'cultural',
    registeredCount: 320,
    capacity: 500,
    status: 'published',
    tags: ['Cultural', 'Music', 'Dance'],
  },
  {
    id: 'e3',
    title: 'Hackathon 2026',
    description: '24-hour coding marathon to build innovative solutions.',
    start: '2026-02-01T09:00:00Z',
    location: 'Computer Lab',
    category: 'technical',
    registeredCount: 80,
    capacity: 100,
    status: 'published',
    tags: ['Coding', 'Innovation'],
  },
  {
    id: 'e4',
    title: 'Sports Day 2026',
    description: 'Annual inter-department sports competition.',
    start: '2026-02-10T08:00:00Z',
    location: 'Sports Ground',
    category: 'sports',
    registeredCount: 150,
    capacity: 200,
    status: 'published',
    tags: ['Sports', 'Competition'],
  },
];

const categoryColors: Record<string, string> = {
  workshop: 'bg-purple-100 text-purple-800',
  cultural: 'bg-pink-100 text-pink-800',
  technical: 'bg-blue-100 text-blue-800',
  sports: 'bg-green-100 text-green-800',
  academic: 'bg-yellow-100 text-yellow-800',
  seminar: 'bg-orange-100 text-orange-800',
};

const categoryIcons: Record<string, string> = {
  workshop: '🔧',
  cultural: '🎭',
  technical: '💻',
  sports: '⚽',
  academic: '📚',
  seminar: '🎤',
};

export default function EventsPage() {
  const [events] = useState<Event[]>(demoEvents);
  const [category, setCategory] = useState<string>('all');
  const [loading] = useState(false);

  const filteredEvents =
    category === 'all' ? events : events.filter((e) => e.category === category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Campus Events</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover and register for exciting events
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="workshop">🔧 Workshop</SelectItem>
                <SelectItem value="cultural">🎭 Cultural</SelectItem>
                <SelectItem value="technical">💻 Technical</SelectItem>
                <SelectItem value="sports">⚽ Sports</SelectItem>
                <SelectItem value="academic">📚 Academic</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/events/my-registrations">
              <Button variant="outline">My Registrations</Button>
            </Link>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-[320px]" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-500">Check back later for upcoming events!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Category Banner */}
                <div
                  className={`h-2 ${categoryColors[event.category]?.replace('text-', 'bg-').split(' ')[0] || 'bg-gray-200'}`}
                />

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge
                      className={categoryColors[event.category] || 'bg-gray-100 text-gray-800'}
                    >
                      {categoryIcons[event.category]} {event.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(event.start).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>
                        {new Date(event.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>
                        {event.registeredCount}/{event.capacity} registered
                      </span>
                      {event.registeredCount >= event.capacity && (
                        <Badge variant="destructive" className="text-xs">
                          Full
                        </Badge>
                      )}
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-indigo-600 transition-colors">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
