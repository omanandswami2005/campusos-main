'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';

interface Event {
  id: string;
  title: string;
  start: string;
  status: string;
  registeredCount: number;
  capacity: number;
}

interface Club {
  id: string;
  name: string;
  status: string;
  memberCount: number;
}

export default function CoordinatorDashboard() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myClub, setMyClub] = useState<Club | null>(null);

  useEffect(() => {
    // Demo data for hackathon
    setMyEvents([
      {
        id: 'e1',
        title: 'AI/ML Workshop',
        start: '2026-01-15T10:00:00Z',
        status: 'published',
        registeredCount: 45,
        capacity: 60,
      },
      {
        id: 'e2',
        title: 'Coding Bootcamp',
        start: '2026-01-20T09:00:00Z',
        status: 'draft',
        registeredCount: 0,
        capacity: 40,
      },
      {
        id: 'e3',
        title: 'Tech Talk Series',
        start: '2026-01-25T14:00:00Z',
        status: 'pending_approval',
        registeredCount: 0,
        capacity: 100,
      },
    ]);
    setMyClub({
      id: 'club-1',
      name: 'CodeCraft - Programming Club',
      status: 'approved',
      memberCount: 156,
    });
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Coordinator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your club and events</p>
          </div>
          <Link href="/events/coordinator/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700">+ Create Event</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Club */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎯</span> My Club
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myClub ? (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{myClub.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getStatusBadge(myClub.status)}>{myClub.status}</Badge>
                    <span className="text-sm text-gray-500">{myClub.memberCount} members</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Club
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">You don't have a club yet</p>
                  <Button>Register Club</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{myEvents.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {myEvents.filter((e) => e.status === 'published').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {myEvents.filter((e) => e.status === 'pending_approval').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {myEvents.reduce((sum, e) => sum + e.registeredCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Registrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Events */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Events</CardTitle>
              <Link href="/events/coordinator/events">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>📅 {new Date(event.start).toLocaleDateString()}</span>
                      <span>
                        👥 {event.registeredCount}/{event.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusBadge(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <Link href={`/events/coordinator/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
