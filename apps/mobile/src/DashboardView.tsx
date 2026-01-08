interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  badge?: string;
  status: 'active' | 'coming-soon';
}

const services: Service[] = [
  {
    id: 'campus-gpt',
    name: 'CampusGPT',
    description: 'AI assistant with Generative UI',
    icon: '🎓',
    gradient: 'from-indigo-500 to-purple-600',
    badge: 'Azure AI',
    status: 'active',
  },
  {
    id: 'canteen',
    name: 'Canteen',
    description: 'Order food & track orders',
    icon: '🍽️',
    gradient: 'from-orange-500 to-red-500',
    status: 'active',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Discover campus events',
    icon: '📅',
    gradient: 'from-green-500 to-emerald-500',
    status: 'active',
  },
  {
    id: 'printing',
    name: 'Printing',
    description: 'Print documents on campus',
    icon: '🖨️',
    gradient: 'from-blue-500 to-cyan-500',
    status: 'active',
  },
  {
    id: 'clubs',
    name: 'Clubs',
    description: 'Join student communities',
    icon: '🎯',
    gradient: 'from-violet-500 to-fuchsia-500',
    status: 'active',
  },
  {
    id: 'payments',
    name: 'Wallet',
    description: 'Campus payments',
    icon: '💳',
    gradient: 'from-amber-500 to-orange-500',
    status: 'coming-soon',
  },
];

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  return (
    <div className="pb-20">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome! 👋</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Access campus services from one place
        </p>
      </div>

      {/* Featured - CampusGPT */}
      <button onClick={() => onNavigate('campus-gpt')} className="w-full mb-6 text-left">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                🎓
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">CampusGPT</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500 text-white rounded-full">
                    Azure AI
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  AI assistant with Generative UI
                </p>
              </div>
              <div className="text-indigo-500">→</div>
            </div>
          </div>
        </div>
      </button>

      {/* Services Grid */}
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        All Services
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {services
          .filter((s) => s.id !== 'campus-gpt')
          .map((service) => (
            <button
              key={service.id}
              onClick={() => service.status === 'active' && onNavigate(service.id)}
              disabled={service.status !== 'active'}
              className={`relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-left transition-all ${
                service.status === 'active' ? 'active:scale-95' : 'opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center text-xl mb-3`}
              >
                {service.icon}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {service.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {service.description}
              </div>
              {service.status === 'coming-soon' && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                  Soon
                </span>
              )}
            </button>
          ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { value: '4', label: 'Events', color: 'text-green-500' },
          { value: '6', label: 'Menu', color: 'text-orange-500' },
          { value: '4', label: 'Clubs', color: 'text-purple-500' },
          { value: '0', label: 'Orders', color: 'text-blue-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
