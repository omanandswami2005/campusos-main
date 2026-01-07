import type { ReactNode } from 'react';
import '@campus-os/ui/theme.css';
import '@campus-os/ui/globals.css';

export const metadata = {
  title: 'Campus OS',
  description: 'Campus platform for web and mobile',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
