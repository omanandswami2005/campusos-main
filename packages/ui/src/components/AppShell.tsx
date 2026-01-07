import * as React from 'react';
import { cn } from '../lib/utils';

interface AppShellProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AppShell({ header, footer, sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background text-foreground', className)}>
      {header && (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4">
            {header}
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {sidebar && (
          <aside className="hidden md:flex w-64 flex-col border-r bg-background">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 container py-6 px-4">
          {children}
        </main>
      </div>
      {footer && (
        <footer className="border-t bg-background">
          <div className="container flex h-14 items-center px-4">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}
