'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, BarChart2, Settings } from 'lucide-react';
import { vibrate } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home'       },
  { href: '/leads',     icon: Users,           label: 'Leads'      },
  { href: '/followups', icon: Calendar,        label: 'Follow-ups' },
  { href: '/analytics', icon: BarChart2,       label: 'Analytics'  },
  { href: '/settings',  icon: Settings,        label: 'Settings'   },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-glass border-t border-glass shadow-glass pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => vibrate(8)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90 ${
                active ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={`transition-transform ${active ? 'scale-110' : 'scale-100'}`}
              />
              <span className={`text-[10px] font-medium leading-none ${active ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-5 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
