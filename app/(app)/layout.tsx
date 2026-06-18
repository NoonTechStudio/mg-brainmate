'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import BottomNav from '@/app/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('brainmate_auth');
    if (!auth) router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset on desktop to account for fixed sidebar */}
      <div className="flex-1 lg:pl-64 min-w-0">
        <main className="min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
