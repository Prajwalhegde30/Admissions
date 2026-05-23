'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { GraduationCap, FileText, User, WifiOff } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    const handleNetworkError = (e: Event) => {
      const customEvent = e as CustomEvent;
      setNetworkError(customEvent.detail || 'Network error occurred');
      setTimeout(() => setNetworkError(''), 5000);
    };
    window.addEventListener('network-error', handleNetworkError);
    return () => window.removeEventListener('network-error', handleNetworkError);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50">
      {networkError && (
        <div className="fixed top-4 right-4 z-[100] bg-error text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">{networkError}</span>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-surface-900 leading-tight">Atria Institute</h1>
                <p className="text-xs text-surface-500 leading-tight">Admission Portal</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              <NavLink href="/application" active={pathname === '/application'} icon={<FileText className="w-4 h-4" />}>
                Application
              </NavLink>
              <NavLink href="/status" active={pathname === '/status'} icon={<User className="w-4 h-4" />}>
                Status
              </NavLink>
            </nav>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-surface-900">Test Student</p>
                <p className="text-xs text-surface-500">test-student@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
        active
          ? 'text-brand-600 bg-brand-50'
          : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
