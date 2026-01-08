import { useState } from 'react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  coordinator: string;
}

const categoryIcons: Record<string, string> = {
  Technical: '💻',
  Cultural: '🎭',
  Literary: '📖',
  Sports: '⚽',
  Arts: '🎨',
  Business: '💼',
};

const demoClubs: Club[] = [
  {
    id: 'c1',
    name: 'CodeCraft',
    description: 'Programming & hackathons',
    category: 'Technical',
    memberCount: 156,
    coordinator: 'Arjun Kumar',
  },
  {
    id: 'c2',
    name: 'Rhythm Dance',
    description: 'All dance styles',
    category: 'Cultural',
    memberCount: 89,
    coordinator: 'Priya Sharma',
  },
  {
    id: 'c3',
    name: 'Debate Society',
    description: 'Public speaking & debates',
    category: 'Literary',
    memberCount: 67,
    coordinator: 'Rohan Verma',
  },
  {
    id: 'c4',
    name: 'Sports Club',
    description: 'Cricket, football & more',
    category: 'Sports',
    memberCount: 234,
    coordinator: 'Vikram Singh',
  },
  {
    id: 'c5',
    name: 'Photography',
    description: 'Visual arts & photos',
    category: 'Arts',
    memberCount: 45,
    coordinator: 'Sneha Reddy',
  },
  {
    id: 'c6',
    name: 'E-Cell',
    description: 'Startups & business',
    category: 'Business',
    memberCount: 112,
    coordinator: 'Amit Patel',
  },
];

interface ClubsViewProps {
  onBack: () => void;
}

export function ClubsView({ onBack }: ClubsViewProps) {
  const [clubs] = useState<Club[]>(demoClubs);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(clubs.map((c) => c.category))];
  const filteredClubs =
    selectedCategory === 'all' ? clubs : clubs.filter((c) => c.category === selectedCategory);

  const handleJoin = (clubId: string) => {
    setJoined((prev) => new Set([...prev, clubId]));
  };

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Campus Clubs</h1>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {cat === 'all' ? '🎯 All' : `${categoryIcons[cat] || ''} ${cat}`}
          </button>
        ))}
      </div>

      {/* Clubs List */}
      <div className="space-y-3">
        {filteredClubs.map((club) => (
          <div key={club.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl text-white">
                {categoryIcons[club.category] || '🎯'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{club.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 rounded">
                    {club.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{club.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>👥 {club.memberCount} members</span>
                  <span>👤 {club.coordinator}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleJoin(club.id)}
              disabled={joined.has(club.id)}
              className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                joined.has(club.id)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-indigo-500 text-white active:bg-indigo-600'
              }`}
            >
              {joined.has(club.id) ? '✓ Joined' : 'Join Club'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
