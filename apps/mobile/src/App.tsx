import { Button, AppShell } from '@campus-os/ui';

export const App = () => (
  <AppShell
    header={<div className="font-semibold">Campus OS Mobile</div>}
    footer={<div className="text-sm text-gray-500">Vite + Capacitor starter</div>}
  >
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hello from mobile</h1>
      <p className="text-gray-700">Shared UI works here too.</p>
      <Button variant="primary">Tap me</Button>
    </div>
  </AppShell>
);
