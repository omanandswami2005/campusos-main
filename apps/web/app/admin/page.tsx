'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';

interface PendingClub {
  id: string;
  name: string;
  coordinator: string;
  submittedAt: string;
  category: string;
}

interface PendingEvent {
  id: string;
  title: string;
  clubName: string;
  date: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const [pendingClubs, setPendingClubs] = useState<PendingClub[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClubs: 0,
    totalUsers: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    // Demo data
    setPendingClubs([
      {
        id: 'c1',
        name: 'Photography Club',
        coordinator: 'Rahul Sharma',
        submittedAt: '2026-01-08',
        category: 'Arts',
      },
      {
        id: 'c2',
        name: 'Entrepreneurship Cell',
        coordinator: 'Priya Patel',
        submittedAt: '2026-01-07',
        category: 'Business',
      },
    ]);
    setPendingEvents([
      {
        id: 'e1',
        title: 'Annual Sports Meet',
        clubName: 'Sports Club',
        date: '2026-02-10',
        submittedAt: '2026-01-08',
      },
      {
        id: 'e2',
        title: 'Photography Exhibition',
        clubName: 'Photography Club',
        date: '2026-01-28',
        submittedAt: '2026-01-07',
      },
    ]);
    setStats({ totalEvents: 24, totalClubs: 12, totalUsers: 1560, totalRegistrations: 890 });
  }, []);

  const handleApprove = (type: 'club' | 'event', id: string) => {
    if (type === 'club') setPendingClubs((prev) => prev.filter((c) => c.id !== id));
    else setPendingEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage clubs, events, and campus activities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-500">Total Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalClubs}</div>
              <div className="text-sm text-gray-500">Active Clubs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500">Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalRegistrations}</div>
              <div className="text-sm text-gray-500">Registrations</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Clubs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span> Pending Club Approvals
                </CardTitle>
                <Badge variant="outline">{pendingClubs.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingClubs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingClubs.map((club) => (
                    <div key={club.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{club.name}</h4>
                          <p className="text-sm text-gray-500">By {club.coordinator}</p>
                        </div>
                        <Badge variant="secondary">{club.category}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleApprove('club', club.id)}>
                          ✓ Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          ✗ Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-yellow-500">📅</span> Pending Event Approvals
                </CardTitle>
                <Badge variant="outline">{pendingEvents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          By {event.clubName} • 📅 {event.date}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleApprove('event', event.id)}>
                          ✓ Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          ✗ Reject
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/events">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
              <span className="text-xl">📅</span>
              <span>All Events</span>
            </Button>
          </Link>
          <Link href="/admin/clubs">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
              <span className="text-xl">🎯</span>
              <span>All Clubs</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
              <span className="text-xl">👥</span>
              <span>Users</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
              <span className="text-xl">📊</span>
              <span>Analytics</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
