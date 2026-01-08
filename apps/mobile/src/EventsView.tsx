import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  location?: string;
  category: string;
  registeredCount: number;
  capacity: number;
}

const categoryIcons: Record<string, string> = {
  workshop: '🔧',
  cultural: '🎭',
  technical: '💻',
  sports: '⚽',
  academic: '📚',
  seminar: '🎤',
};

const demoEvents: Event[] = [
  {
    id: 'e1',
    title: 'AI/ML Workshop',
    start: '2026-01-15T10:00:00Z',
    location: 'Tech Hub',
    category: 'workshop',
    registeredCount: 45,
    capacity: 60,
    description: 'Learn AI with Azure OpenAI',
  },
  {
    id: 'e2',
    title: 'Cultural Fest',
    start: '2026-01-20T16:00:00Z',
    location: 'Main Auditorium',
    category: 'cultural',
    registeredCount: 320,
    capacity: 500,
  },
  {
    id: 'e3',
    title: 'Hackathon 2026',
    start: '2026-02-01T09:00:00Z',
    location: 'Computer Lab',
    category: 'technical',
    registeredCount: 80,
    capacity: 100,
  },
  {
    id: 'e4',
    title: 'Sports Day',
    start: '2026-02-10T08:00:00Z',
    location: 'Sports Ground',
    category: 'sports',
    registeredCount: 150,
    capacity: 200,
  },
];

interface EventsViewProps {
  onBack: () => void;
}

export function EventsView({ onBack }: EventsViewProps) {
  const [events] = useState<Event[]>(demoEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState<Set<string>>(new Set());

  const handleRegister = async (eventId: string) => {
    setRegistering(true);
    await new Promise((r) => setTimeout(r, 500));
    setRegistered((prev) => new Set([...prev, eventId]));
    setRegistering(false);
  };

  if (selectedEvent) {
    return (
      <div className="pb-20">
        <button
          onClick={() => setSelectedEvent(null)}
          className="mb-4 text-indigo-500 flex items-center gap-1"
        >
          ← Back to Events
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{categoryIcons[selectedEvent.category] || '📅'}</span>
            <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
              {selectedEvent.category}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {selectedEvent.description || 'No description available.'}
          </p>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              📅 {new Date(selectedEvent.start).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              🕐 {new Date(selectedEvent.start).toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">📍 {selectedEvent.location}</div>
            <div className="flex items-center gap-2">
              👥 {selectedEvent.registeredCount}/{selectedEvent.capacity} registered
            </div>
          </div>

          <button
            onClick={() => handleRegister(selectedEvent.id)}
            disabled={registering || registered.has(selectedEvent.id)}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              registered.has(selectedEvent.id)
                ? 'bg-green-500 text-white'
                : 'bg-indigo-500 text-white active:bg-indigo-600'
            } disabled:opacity-50`}
          >
            {registered.has(selectedEvent.id)
              ? '✓ Registered'
              : registering
                ? 'Registering...'
                : 'Register Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Campus Events</h1>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="w-full text-left bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xl">
                {categoryIcons[event.category] || '📅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {event.title}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  📅 {new Date(event.start).toLocaleDateString()} • 📍 {event.location}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {event.registeredCount}/{event.capacity}
                  </span>
                </div>
              </div>
              {registered.has(event.id) && <span className="text-green-500 text-lg">✓</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
