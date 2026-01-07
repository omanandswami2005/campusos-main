import * as React from 'react';

export const metadata = {
  title: 'Campus OS',
  description: 'Campus OS Web Platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
