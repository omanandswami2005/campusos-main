'use client';

import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  status: 'active' | 'coming-soon';
}

const services: Service[] = [
  {
    id: 'campus-gpt',
    name: 'CampusGPT',
    description:
      'AI-powered campus assistant with Generative UI. Ask about events, order food, find clubs, and get study help.',
    icon: '🎓',
    route: '/campus-gpt',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    badge: 'Azure AI',
    badgeColor: 'bg-blue-500',
    status: 'active',
  },
  {
    id: 'canteen',
    name: 'Canteen',
    description:
      'Browse menu, place orders, track order status, and get notifications when your food is ready.',
    icon: '🍽️',
    route: '/canteen',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    status: 'active',
  },
  {
    id: 'events',
    name: 'Events',
    description:
      'Discover campus events, workshops, and seminars. Register, get reminders, and earn certificates.',
    icon: '📅',
    route: '/events',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    status: 'active',
  },
  {
    id: 'printing',
    name: 'Printing',
    description:
      'Upload documents, select print options, and pick up from nearby print shops on campus.',
    icon: '🖨️',
    route: '/printing',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    status: 'active',
  },
  {
    id: 'clubs',
    name: 'Clubs & Societies',
    description:
      'Explore student clubs, join communities, and participate in activities that match your interests.',
    icon: '🎯',
    route: '/clubs',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    status: 'active',
  },
  {
    id: 'payments',
    name: 'Payments',
    description:
      'Manage your campus wallet, view transaction history, and make secure payments across services.',
    icon: '💳',
    route: '/payments',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    status: 'coming-soon',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Campus<span className="text-indigo-600 dark:text-indigo-400">OS</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl">🔔</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                OS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Access all campus services from one place. What would you like to do today?
          </p>
        </div>

        {/* Featured - CampusGPT */}
        <div onClick={() => router.push('/campus-gpt')} className="mb-8 group cursor-pointer">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
            <div className="relative rounded-2xl bg-white dark:bg-gray-900 p-6 sm:p-8 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
                  🎓
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">CampusGPT</h3>
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full">
                      ✨ Azure AI Powered
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                      NEW
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Your AI campus assistant with Generative UI. Ask about events, order food, find
                    clubs, and get instant answers!
                  </p>
                </div>

                <div className="sm:self-center">
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    Try Now →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Services</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            .filter((s) => s.id !== 'campus-gpt')
            .map((service) => (
              <div
                key={service.id}
                onClick={() => service.status === 'active' && router.push(service.route)}
                className={`group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300 ${
                  service.status === 'active'
                    ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-transparent'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      {service.icon}
                    </div>

                    {service.status === 'coming-soon' && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                        Coming Soon
                      </span>
                    )}

                    {service.badge && (
                      <span
                        className={`px-2 py-1 text-xs font-medium ${service.badgeColor} text-white rounded-full`}
                      >
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {service.description}
                  </p>

                  {service.status === 'active' && (
                    <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open service
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Services</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Events This Week</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">6</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Menu Items</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Clubs</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>© 2026 CampusOS • Built for Microsoft Imagine Hackathon</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
