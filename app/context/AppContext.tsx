'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getTemplate, type IndustryTemplate } from '@/lib/industryTemplates';
import { getSetting } from '@/lib/db';

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  isDemo: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  template: IndustryTemplate;
  industryId: string;
  setIndustryId: (id: string) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  showConfetti: () => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [industryId, setIndustryIdState] = useState('other');
  const [businessName, setBusinessNameState] = useState('My Business');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const template = getTemplate(industryId);

  useEffect(() => {
    const raw = localStorage.getItem('brainmate_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTimeout(() => setUserState(parsed), 0);
      } catch { /* ignore */ }
    }

    getSetting('industry').then(id => {
      if (id) setIndustryIdState(id);
    });
    getSetting('businessName').then(name => {
      if (name) setBusinessNameState(name);
    });

    const savedTheme = localStorage.getItem('brainmate_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTimeout(() => setTheme(savedTheme), 0);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTimeout(() => setTheme('dark'), 0);
      document.documentElement.classList.add('dark');
    }

    setTimeout(() => setIsLoading(false), 0);
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('brainmate_auth', JSON.stringify(u));
    } else {
      localStorage.removeItem('brainmate_auth');
    }
  }, []);

  const setIndustryId = useCallback((id: string) => {
    setIndustryIdState(id);
  }, []);

  const setBusinessName = useCallback((name: string) => {
    setBusinessNameState(name);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('brainmate_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfetti = useCallback(() => {
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#F97316'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${Math.random() * 100}vw`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = `${Math.random() * 1.5}s`;
      el.style.animationDuration = `${2 + Math.random() * 2}s`;
      el.style.width = `${6 + Math.random() * 8}px`;
      el.style.height = `${6 + Math.random() * 8}px`;
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      template, industryId, setIndustryId,
      businessName, setBusinessName,
      toasts, showToast, removeToast,
      showConfetti,
      isLoading,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
