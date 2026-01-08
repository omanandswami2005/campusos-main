import type { ReactNode } from 'react';
import '@campus-os/ui/theme.css';
import '@campus-os/ui/globals.css';
import './globals.css';
import { Providers } from './providers/Providers';

export const metadata = {
  title: 'Campus OS',
  description: 'Campus platform for web and mobile',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
