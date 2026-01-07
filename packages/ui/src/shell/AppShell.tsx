import type { PropsWithChildren, ReactNode } from 'react';

interface AppShellProps extends PropsWithChildren {
  header?: ReactNode;
  footer?: ReactNode;
}

export const AppShell = ({ header, footer, children }: AppShellProps) => (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    {header && <header className="border-b bg-white px-4 py-3">{header}</header>}
    <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    {footer && <footer className="border-t bg-white px-4 py-3">{footer}</footer>}
  </div>
);
import * as React from 'react';

type Props = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export const AppShell: React.FC<Props> = ({ header, footer, children }) => (
  <div className="min-h-screen flex flex-col">
    {header && <header className="border-b">{header}</header>}
    <main className="flex-1">{children}</main>
    {footer && <footer className="border-t">{footer}</footer>}
  </div>
);
