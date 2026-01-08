import { useState } from 'react';
import { ThemeProvider, ThemeToggle } from './ThemeProvider';
import { DashboardView } from './DashboardView';
import { CampusGPTView } from './CampusGPTView';
import { CanteenView } from './CanteenView';
import { PrintingMobileView } from './PrintingMobileView';
import { EventsView } from './EventsView';
import { ClubsView } from './ClubsView';

type View = 'dashboard' | 'campus-gpt' | 'canteen' | 'events' | 'printing' | 'clubs';

export const App = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'campus-gpt':
        return <CampusGPTView onBack={() => setCurrentView('dashboard')} />;
      case 'canteen':
        return (
          <div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mb-4 text-indigo-500 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
            <CanteenView />
          </div>
        );
      case 'printing':
        return <PrintingMobileView onBack={() => setCurrentView('dashboard')} />;
      case 'events':
        return <EventsView onBack={() => setCurrentView('dashboard')} />;
      case 'clubs':
        return <ClubsView onBack={() => setCurrentView('dashboard')} />;
      default:
        return <DashboardView onNavigate={(view) => setCurrentView(view as View)} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <span className="font-semibold">
                Campus<span className="text-indigo-500">OS</span>
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-4">{renderView()}</main>

        {/* Bottom Navigation - 5 tabs */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-area-pb">
          <div className="flex justify-around py-2">
            {[
              { id: 'dashboard', icon: '🏠', label: 'Home' },
              { id: 'campus-gpt', icon: '🎓', label: 'AI' },
              { id: 'events', icon: '📅', label: 'Events' },
              { id: 'canteen', icon: '🍽️', label: 'Food' },
              { id: 'printing', icon: '🖨️', label: 'Print' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentView === item.id ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </ThemeProvider>
  );
};
