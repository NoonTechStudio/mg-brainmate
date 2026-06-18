'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting } from '@/lib/db';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('brainmate_auth');
    if (!auth) {
      router.replace('/login');
      return;
    }
    getSetting('industry').then(industry => {
      if (!industry) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-3xl shadow-lg">
          🧠
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
