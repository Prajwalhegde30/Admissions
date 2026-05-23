'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, UserPlus, Shield } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: Users },
  { name: 'Invites', href: '/invites', icon: UserPlus },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-950 text-white flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="p-2 bg-brand-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-brand-300" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Admin Portal</h1>
            <p className="text-brand-300 text-xs">Atria Admissions</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-brand-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-brand-300 truncate">admin@atria.ac.in</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-surface-200 px-8 py-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-500" />
            <h1 className="font-bold text-surface-900">Admin Portal</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
