import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from './lib/auth-context';
import { AppFrame } from './ui/app-frame';

export const metadata = {
  title: 'Farmhouse Admin',
  description: 'Admin panel for Farmhouse backend'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppFrame>{children}</AppFrame>
        </AuthProvider>
      </body>
    </html>
  );
}

