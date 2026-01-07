'use client';

import { useRouter } from 'next/navigation';
import { AppShell, Button } from '@campus-os/ui';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();

  const goCanteen = () => router.push('/canteen');
  const goPrinting = () => router.push('/printing');

  return (
    <AppShell
      header={<div className="font-semibold text-lg">Campus OS</div>}
      footer={
        <div className={styles.footerNote}>Modular monorepo starter • Wired UI, types, API</div>
      }
    >
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Campus OS</div>
        <h1 className={styles.title}>
          Build student experiences faster with a production-ready starter
        </h1>
        <p className={styles.subtitle}>
          Shared UI primitives, typed API client, and module scaffolds are in place. Ship canteen,
          printing, auth, and campus services without rebuilding the foundation each time.
        </p>
        <div className={styles.actions}>
          <Button variant="default" onClick={goCanteen}>
            Open Canteen Demo
          </Button>
          <Button variant="secondary" onClick={goPrinting}>
            Open Printing Demo
          </Button>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Shared design system</h3>
            <p>
              Buttons and shell components live in packages/ui so web and mobile stay consistent.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Typed clients</h3>
            <p>API clients and domain types are centralized; import once and reuse everywhere.</p>
          </div>
          <div className={styles.card}>
            <h3>Service stubs</h3>
            <p>Canteen and printing services already run locally for rapid feature prototyping.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
