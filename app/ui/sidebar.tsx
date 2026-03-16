'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/farms', label: 'Farms' },
  { href: '/users', label: 'Users' },
  { href: '/decorations', label: 'Decorations' }
];

export function Sidebar({
  mobileOpen,
  onNavigate
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={mobileOpen ? 'sidebar sidebar--open' : 'sidebar'}>
      <div className="sidebar-header">
        <span className="brand">Farmhouse Admin</span>
      </div>
      {user && (
        <>
          <nav className="sidebar-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onNavigate?.()}
                className={
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'sidebar-link active'
                    : 'sidebar-link'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      )}
      {!user && (
        <div className="sidebar-footer">
          <Link href="/login" className="sidebar-link">
            Login
          </Link>
        </div>
      )}
    </aside>
  );
}

