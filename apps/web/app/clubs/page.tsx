'use client';

import { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@campus-os/ui';
import { Button } from '@campus-os/ui';
import { Badge } from '@campus-os/ui';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  coordinator: string;
  logoUrl?: string;
  meetingSchedule?: string;
}

const demoClubs: Club[] = [
  {
    id: 'c1',
    name: 'CodeCraft - Programming Club',
    description: 'Learn programming, participate in hackathons, and build cool projects together.',
    category: 'Technical',
    memberCount: 156,
    coordinator: 'Arjun Kumar',
    meetingSchedule: 'Every Saturday, 3 PM',
  },
  {
    id: 'c2',
    name: 'Rhythm - Dance Club',
    description: 'Express yourself through dance! We cover all styles from classical to hip-hop.',
    category: 'Cultural',
    memberCount: 89,
    coordinator: 'Priya Sharma',
    meetingSchedule: 'Tue & Thu, 5 PM',
  },
  {
    id: 'c3',
    name: 'Debate Society',
    description: 'Sharpen your communication skills and participate in inter-college debates.',
    category: 'Literary',
    memberCount: 67,
    coordinator: 'Rohan Verma',
    meetingSchedule: 'Wednesday, 4 PM',
  },
  {
    id: 'c4',
    name: 'Sports Club',
    description: 'Join us for cricket, football, basketball, and more!',
    category: 'Sports',
    memberCount: 234,
    coordinator: 'Vikram Singh',
    meetingSchedule: 'Daily, 6 AM',
  },
  {
    id: 'c5',
    name: 'Photography Club',
    description: 'Capture moments, learn photography techniques, and showcase your work.',
    category: 'Arts',
    memberCount: 45,
    coordinator: 'Sneha Reddy',
    meetingSchedule: 'Sunday, 10 AM',
  },
  {
    id: 'c6',
    name: 'Entrepreneurship Cell',
    description: 'Build startups, learn business skills, and connect with investors.',
    category: 'Business',
    memberCount: 112,
    coordinator: 'Amit Patel',
    meetingSchedule: 'Friday, 6 PM',
  },
];

const categoryColors: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-800',
  Cultural: 'bg-pink-100 text-pink-800',
  Literary: 'bg-purple-100 text-purple-800',
  Sports: 'bg-green-100 text-green-800',
  Arts: 'bg-orange-100 text-orange-800',
  Business: 'bg-yellow-100 text-yellow-800',
};

const categoryIcons: Record<string, string> = {
  Technical: '💻',
  Cultural: '🎭',
  Literary: '📖',
  Sports: '⚽',
  Arts: '🎨',
  Business: '💼',
};

export default function ClubsPage() {
  const [clubs] = useState<Club[]>(demoClubs);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(clubs.map((c) => c.category))];
  const filteredClubs =
    selectedCategory === 'all' ? clubs : clubs.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Campus Clubs</h1>
          <p className="text-gray-600 dark:text-gray-400">Find your community and make memories</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? '🎯 All' : `${categoryIcons[cat] || ''} ${cat}`}
            </Button>
          ))}
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Card
              key={club.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div
                className={`h-2 ${categoryColors[club.category]?.split(' ')[0] || 'bg-gray-200'}`}
              />

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    {categoryIcons[club.category] || '🎯'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <Badge className={categoryColors[club.category] || 'bg-gray-100'}>
                      {club.category}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{club.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{club.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Coord: {club.coordinator}</span>
                  </div>
                  {club.meetingSchedule && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{club.meetingSchedule}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-4 group-hover:bg-indigo-600 transition-colors">
                  Join Club
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
