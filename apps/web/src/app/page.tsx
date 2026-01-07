import { AppShell, Button } from '@campus-os/ui';
import { HttpClient, CanteenClient } from '@campus-os/api-client';

export default async function Page() {
  const api = new CanteenClient(new HttpClient({ baseUrl: 'http://localhost:3001' }));
  // Note: This is a placeholder — in real SSR you'd fetch or use Server Actions.
  void api;
  return (
    <AppShell header={<div className="p-4">Campus OS</div>}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to Campus OS</h1>
        <Button onClick={() => alert('Hello Campus!')}>Get Started</Button>
      </div>
    </AppShell>
  );
}
