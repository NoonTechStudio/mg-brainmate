'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, BarChart2,
  Settings, Brain, LogOut, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/leads',      icon: Users,            label: 'Leads'      },
  { href: '/followups',  icon: Calendar,         label: 'Follow-ups' },
  { href: '/analytics',  icon: BarChart2,        label: 'Analytics'  },
  { href: '/settings',   icon: Settings,         label: 'Settings'   },
];

export default function Sidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, setUser, businessName, template, theme, toggleTheme } = useApp();

  const handleLogout = () => {
    setUser(null);
    router.replace('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-none">BrainMate</p>
          <p className="text-xs text-muted mt-0.5 truncate">Digital Brain</p>
        </div>
      </div>

      {/* Business badge */}
      <div className="mx-4 mt-4 px-3 py-2.5 bg-primary-light rounded-xl border border-primary/10">
        <div className="flex items-center gap-2">
          <span className="text-lg flex-shrink-0">{template.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary truncate">{businessName || 'My Business'}</p>
            <p className="text-xs text-primary/60 truncate">{template.name}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-muted px-3 mb-2 uppercase tracking-wider">Menu</p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                active ? 'active' : 'text-slate-600'
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-primary/50" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        {user?.isDemo && (
          <div className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 text-center">Demo Mode</p>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-border bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition text-xs font-semibold"
          >
            {theme === 'light' ? (
              <>
                <Moon size={13} className="text-indigo-600" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={13} className="text-amber-500" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-muted truncate">{user?.role || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger-light transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
