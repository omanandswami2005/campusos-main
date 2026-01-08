'use client';

import { ThemeProvider } from './ThemeProvider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="campus-os-theme">
      {children}
    </ThemeProvider>
  );
}
