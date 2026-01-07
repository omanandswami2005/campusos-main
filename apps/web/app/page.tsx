'use client';

import { useRouter } from 'next/navigation';
import { AppShell, Button } from '@campus-os/ui';

export default function HomePage() {
  const router = useRouter();

  const goCanteen = () => router.push('/canteen');
  const goPrinting = () => router.push('/printing');

  return (
    <AppShell
      header={<div className="font-semibold text-lg">Campus OS</div>}
      footer={
        <div className="text-center text-sm text-muted-foreground py-4">
          Modular monorepo starter • Wired UI, types, API
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 py-12 px-4">
        <div className="space-y-4 max-w-2xl">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Campus OS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Build student experiences faster with a production-ready starter
          </h1>
          <p className="text-xl text-muted-foreground">
            Shared UI primitives, typed API client, and module scaffolds are in place. Ship canteen,
            printing, auth, and campus services without rebuilding the foundation each time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="default" onClick={goCanteen} size="lg">
            Open Canteen Demo
          </Button>
          <Button variant="secondary" onClick={goPrinting} size="lg">
            Open Printing Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full pt-12">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Shared design system</h3>
            <p className="text-sm text-muted-foreground">
              Buttons and shell components live in packages/ui so web and mobile stay consistent.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Typed clients</h3>
            <p className="text-sm text-muted-foreground">
              API clients and domain types are centralized; import once and reuse everywhere.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Service stubs</h3>
            <p className="text-sm text-muted-foreground">
              Canteen and printing services already run locally for rapid feature prototyping.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
