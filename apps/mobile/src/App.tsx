import { AppShell } from '@campus-os/ui';
import { PrintingView } from './PrintingView';
import { CanteenView } from './CanteenView';
import { CanteenAuthView } from './CanteenAuthView';
import { ThemeProvider, ThemeToggle } from './ThemeProvider';

export const App = () => (
  <ThemeProvider defaultTheme="system">
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <AppShell
        header={
          <div className="flex justify-between items-center w-full">
            <span className="font-semibold">Campus OS Mobile</span>
            <ThemeToggle />
          </div>
        }
        footer={
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Printing demo via shared client
          </div>
        }
      >
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Hello from mobile</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Shared UI and API client wired to printing and canteen services.
          </p>
          <PrintingView />
          <CanteenView />
          <div className="border-t dark:border-gray-800 pt-4">
            <CanteenAuthView />
          </div>
        </div>
      </AppShell>
    </div>
  </ThemeProvider>
);
