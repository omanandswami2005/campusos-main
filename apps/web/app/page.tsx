import { AppShell, Button } from '@campus-os/ui';

export default function HomePage() {
  return (
    <AppShell
      header={<div className="font-semibold">Campus OS</div>}
      footer={<div className="text-sm text-gray-500">Modular monorepo starter</div>}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Campus OS</h1>
        <p className="text-gray-700">
          Shared UI, types, and API client are wired. Build domain modules in apps/web/modules and
          share logic via packages/.
        </p>
        <div className="flex gap-2">
          <Button variant="primary">Primary action</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
    </AppShell>
  );
}
