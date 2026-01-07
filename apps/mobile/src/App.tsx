import { AppShell } from '@campus-os/ui';
import { PrintingView } from './PrintingView';
import { CanteenView } from './CanteenView';
import { CanteenAuthView } from './CanteenAuthView';

export const App = () => (
  <AppShell
    header={<div className="font-semibold">Campus OS Mobile</div>}
    footer={<div className="text-sm text-gray-500">Printing demo via shared client</div>}
  >
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hello from mobile</h1>
      <p className="text-gray-700">Shared UI and API client wired to printing and canteen services.</p>
      <PrintingView />
      <CanteenView />
      <div className="border-t pt-4">
        <CanteenAuthView />
      </div>
    </div>
  </AppShell>
);
