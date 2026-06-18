'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Star, RefreshCw, LogOut, Brain, Users, BarChart2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db } from '@/lib/db';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, businessName, template, showToast } = useApp();
  const [leadCount, setLeadCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    Promise.all([db.leads.count(), db.activities.count()]).then(([leads, acts]) => {
      setLeadCount(leads);
      setActivityCount(acts);
    });
  }, []);

  const handleLogout = () => {
    if (!confirm('Log out of BrainMate?')) return;
    setUser(null);
    showToast('Logged out successfully', 'info');
    router.replace('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const MENU = [
    {
      icon: MessageCircle,
      title: 'Need Help?',
      desc: 'Chat with us on WhatsApp',
      color: 'bg-emerald-50 text-emerald-600',
      action: () => window.open('https://wa.me/?text=Hi, I need help with BrainMate', '_blank'),
    },
    {
      icon: Star,
      title: 'Rate BrainMate',
      desc: 'Love the app? Share your feedback',
      color: 'bg-amber-50 text-amber-600',
      action: () => showToast('Thank you for your support!', 'success'),
    },
    {
      icon: RefreshCw,
      title: 'Change Industry',
      desc: 'Switch to a different business type',
      color: 'bg-indigo-50 text-primary',
      action: () => router.push('/settings'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-4 lg:px-8 pt-10 lg:pt-8 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-white/5" />
        <h1 className="text-white font-bold text-xl relative z-10 max-w-3xl mx-auto">Profile</h1>
      </div>

      <div className="px-4 lg:px-8 -mt-8 pb-8 max-w-3xl mx-auto space-y-4">
        {/* User card */}
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Guest'}</h2>
                {user?.isDemo && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-200">DEMO</span>
                )}
              </div>
              <p className="text-muted text-sm mt-0.5">{user?.email}</p>
              <span className="text-xs bg-primary-light text-primary font-semibold px-2.5 py-0.5 rounded-lg inline-block mt-1.5">{user?.role || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Business card */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {template.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{businessName || 'My Business'}</h3>
              <p className="text-sm text-muted">{template.name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm text-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary tabular-nums">{leadCount}</p>
            <p className="text-xs text-muted mt-1 font-medium">Total Leads</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm text-center">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BarChart2 size={18} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600 tabular-nums">{activityCount}</p>
            <p className="text-xs text-muted mt-1 font-medium">Activities</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          {MENU.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button key={item.title} onClick={item.action}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-bg active:bg-bg transition text-left ${idx > 0 ? 'border-t border-border' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                </div>
                <span className="text-muted text-lg">›</span>
              </button>
            );
          })}
        </div>

        {/* App info */}
        <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-sm">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">BrainMate</p>
              <p className="text-xs text-muted">Version 1.0.0 · Your Business&apos;s Digital Brain</p>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            BrainMate helps small businesses replace paper notepads, WhatsApp lists, and Excel sheets with a powerful digital lead management system. Works offline, stores data locally.
          </p>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full h-12 border-2 border-danger text-danger font-semibold rounded-2xl active:scale-95 transition hover:bg-danger-light flex items-center justify-center gap-2">
          <LogOut size={16} /> Log Out
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
}
