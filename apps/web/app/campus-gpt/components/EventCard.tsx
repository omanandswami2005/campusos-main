'use client';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  tags: string[];
}

interface EventCardProps {
  events: Event[];
}

const categoryColors: Record<string, string> = {
  technical: 'from-blue-500 to-cyan-500',
  cultural: 'from-pink-500 to-rose-500',
  sports: 'from-green-500 to-emerald-500',
  career: 'from-amber-500 to-orange-500',
  default: 'from-indigo-500 to-purple-500',
};

const categoryIcons: Record<string, string> = {
  technical: '💻',
  cultural: '🎭',
  sports: '⚽',
  career: '💼',
  default: '📅',
};

export function EventCard({ events }: EventCardProps) {
  return (
    <div className="grid gap-3">
      {events.map((event) => {
        const gradient = categoryColors[event.category] || categoryColors.default;
        const icon = categoryIcons[event.category] || categoryIcons.default;
        const date = new Date(event.startDate);
        const spotsLeft = event.capacity - event.registeredCount;

        return (
          <div
            key={event.id}
            className="bg-gradient-to-r p-[1px] rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
            }}
          >
            <div className={`bg-gradient-to-r ${gradient} p-[1px] rounded-xl`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {/* Date badge */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white shadow-lg`}
                  >
                    <span className="text-xs font-medium uppercase">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">📍 {event.location}</span>
                      <span className="flex items-center gap-1">
                        🕐{' '}
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${spotsLeft < 20 ? 'text-red-500' : 'text-green-500'}`}
                      >
                        👥 {spotsLeft} spots left
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Register button */}
                  <button
                    className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r ${gradient} text-white shadow-md hover:shadow-lg transition-shadow`}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
