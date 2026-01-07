import type { ReactNode } from 'react';
import './global.css';

export const metadata = {
  title: 'Campus OS',
  description: 'Campus platform for web and mobile'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
