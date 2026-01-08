'use client';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  logoUrl?: string;
  coordinator: string;
  meetingTime: string;
}

interface ClubCardProps {
  clubs: Club[];
}

const categoryColors: Record<string, string> = {
  technical: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  cultural: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  sports: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  literary: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

const categoryIcons: Record<string, string> = {
  technical: '💻',
  cultural: '🎭',
  sports: '⚽',
  literary: '📚',
  default: '🎯',
};

export function ClubCard({ clubs }: ClubCardProps) {
  return (
    <div className="grid gap-3">
      {clubs.map((club) => {
        const colorClass = categoryColors[club.category] || categoryColors.default;
        const icon = categoryIcons[club.category] || categoryIcons.default;

        return (
          <div
            key={club.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              {/* Club icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl shadow-inner">
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{club.name}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
                    {club.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {club.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">👥 {club.memberCount} members</span>
                  <span className="flex items-center gap-1">🗓️ {club.meetingTime}</span>
                  <span className="flex items-center gap-1">👤 {club.coordinator}</span>
                </div>
              </div>

              {/* Join button */}
              <button className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors">
                Join
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
