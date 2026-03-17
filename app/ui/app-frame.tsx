'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // For auth pages like /login, render without sidebar
  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          ☰
        </button>
        <div className="mobile-topbar-title">Farmhouse Admin</div>
      </div>
      {mobileNavOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      <main className="app-main">{children}</main>
    </div>
  );
}
