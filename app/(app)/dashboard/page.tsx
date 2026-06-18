'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { TrendingUp, Phone, CheckCircle2, DollarSign, Plus, Calendar, BarChart2, User, ArrowRight, Lightbulb } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, type Activity, type Lead, logActivity } from '@/lib/db';
import AddLeadModal from '@/app/components/AddLeadModal';
import { getGreeting, getTodaysTip, formatCurrency, formatRelativeTime } from '@/lib/utils';

interface Stats { newToday: number; followUpsdue: number; convertedMonth: number; pipelineValue: number; }

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  added: Plus, updated: CheckCircle2, status_changed: TrendingUp, followup_done: CheckCircle2, deleted: User,
};

export default function DashboardPage() {
  const { user, template, businessName, showToast } = useApp();
  const [stats, setStats]         = useState<Stats>({ newToday: 0, followUpsdue: 0, convertedMonth: 0, pipelineValue: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [quickInput, setQuickInput] = useState('');

  const todayStr  = new Date().toISOString().split('T')[0];

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = quickInput.trim();
    if (!val) return;

    const words = val.split(/\s+/);
    let name = '';
    let phone = '';
    let categoryOrNotes = '';

    let phoneIndex = -1;
    for (let i = 0; i < words.length; i++) {
      const cleaned = words[i].replace(/[^\d+]/g, '');
      if (cleaned.length >= 8 && (cleaned.startsWith('+') || /^\d+$/.test(cleaned))) {
        phone = words[i];
        phoneIndex = i;
        break;
      }
    }

    if (phoneIndex !== -1) {
      name = words.slice(0, phoneIndex).join(' ');
      categoryOrNotes = words.slice(phoneIndex + 1).join(' ');
    } else {
      name = words.slice(0, 2).join(' ');
      categoryOrNotes = words.slice(2).join(' ');
      phone = '';
    }

    name = name.trim();
    categoryOrNotes = categoryOrNotes.trim();

    if (!name) {
      showToast('Please enter at least a name', 'error');
      return;
    }
    if (!phone) {
      showToast('Please enter a phone number', 'error');
      return;
    }

    let category = template.categories[0] || 'Other';
    let notes = '';
    
    const matchedCategory = template.categories.find(
      c => c.toLowerCase() === categoryOrNotes.toLowerCase() || categoryOrNotes.toLowerCase().includes(c.toLowerCase())
    );

    if (matchedCategory) {
      category = matchedCategory;
    } else {
      notes = categoryOrNotes;
    }

    const now = new Date().toISOString();
    const leadData: Omit<Lead, 'id'> = {
      name,
      phone,
      category,
      status: template.statuses[0]?.label || 'New Inquiry',
      notes: notes || `Quick added from dashboard.`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const id = await db.leads.add(leadData);
      await logActivity('added', `Quick Added: ${name} – ${category}`, Number(id));
      showToast(`Quick added: ${name}`, 'success');
      setQuickInput('');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to quick add lead', 'error');
    }
  };

  const loadData = useCallback(async () => {
    const [allLeads, allActivities] = await Promise.all([
      db.leads.orderBy('createdAt').reverse().toArray(),
      db.activities.orderBy('createdAt').reverse().limit(20).toArray(),
    ]);

    const monthStart = new Date(); monthStart.setDate(1);
    const wonStatuses = template.statuses
      .filter(s => ['Won','Booked','Deal Closed','Policy Issued','Admission Confirmed','Event Done','Confirmed'].includes(s.label))
      .map(s => s.label);

    setStats({
      newToday:       allLeads.filter(l => l.createdAt.startsWith(todayStr)).length,
      followUpsdue:   allLeads.filter(l => l.followUpDate && l.followUpDate <= todayStr).length,
      convertedMonth: allLeads.filter(l => wonStatuses.includes(l.status) && l.updatedAt >= monthStart.toISOString()).length,
      pipelineValue:  allLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0),
    });
    setActivities(allActivities);
    setRecentLeads(allLeads.slice(0, 8));
    setLoading(false);
  }, [template, todayStr]);

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, [loadData]);

  const handleSaveLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, addAnother?: boolean) => {
    const now = new Date().toISOString();
    const id  = await db.leads.add({ ...leadData, createdAt: now, updatedAt: now });
    await logActivity('added', `Added: ${leadData.name} – ${leadData.category}`, Number(id));
    showToast(`Lead added: ${leadData.name}`, 'success');
    if (!addAnother) setShowModal(false);
    await loadData();
  };

  const STAT_CARDS = [
    { label: 'New Leads Today',    value: stats.newToday,                   icon: TrendingUp,   color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Follow-ups Due',     value: stats.followUpsdue,               icon: Phone,        color: stats.followUpsdue > 0 ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-50' },
    { label: 'Converted (Month)',  value: stats.convertedMonth,             icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pipeline Value',     value: formatCurrency(stats.pipelineValue), icon: DollarSign,color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Page header — extra bottom padding creates a "shelf" for the floating stat cards */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-5 lg:px-8 pt-10 lg:pt-8 pb-28 lg:pb-32 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-20 w-24 h-24 rounded-full bg-white/5 blur-xl hidden lg:block" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-indigo-200 text-sm font-medium">{getGreeting()}</p>
              <h1 className="text-white font-bold text-2xl lg:text-3xl mt-0.5 truncate max-w-sm lg:max-w-lg">{businessName || 'My Business'}</h1>
              <p className="text-indigo-200/70 text-xs mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {user?.isDemo && (
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-bold px-2.5 py-1 rounded-lg">DEMO</span>
              )}
              <Link href="/profile" className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white font-bold text-sm border border-white/20 transition lg:hidden">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content container — pulled up so stat cards elegantly overlap the header edge */}
      <div className="px-4 lg:px-8 pb-6 max-w-7xl mx-auto -mt-20 lg:-mt-24 relative z-20">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl shadow-lg" />)
            : STAT_CARDS.map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-surface rounded-2xl p-4 lg:p-5 border border-border/70 shadow-lg shadow-indigo-900/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 dark:border-slate-800">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{card.value}</div>
                    <div className="text-xs text-muted mt-1 font-medium">{card.label}</div>
                  </div>
                );
              })}
        </div>

        {/* Quick Add Lead Bar */}
        {!loading && (
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm mb-5 dark:border-slate-800 animate-fade-in">
            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm select-none">⚡ Quick Add:</span>
                <input
                  type="text"
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                  placeholder="e.g. Salim +919876543210 Umrah Package (or notes...)"
                  className="w-full h-11 pl-28 pr-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition flex-shrink-0"
              >
                <Plus size={16} /> Add Lead
              </button>
            </form>
            <p className="text-[10px] text-muted mt-1.5 pl-1.5">
              Enter <span className="font-semibold text-slate-600 dark:text-slate-300">Name</span>, followed by <span className="font-semibold text-slate-600 dark:text-slate-300">Phone Number</span>, and optionally a <span className="font-semibold text-slate-600 dark:text-slate-300">Category</span> or note.
            </p>
          </div>
        )}

        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Getting Started — shown only when no leads exist */}
            {!loading && recentLeads.length === 0 && (
              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-slate-800 text-base">Get started in 3 steps</h2>
                  <p className="text-xs text-muted mt-0.5">BrainMate is ready — here&apos;s how to make the most of it</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    {
                      step: '1',
                      title: 'Add your first lead',
                      desc: 'Capture a customer inquiry with their name, phone and what they need.',
                      color: 'bg-indigo-50 text-primary border-indigo-100',
                      action: () => setShowModal(true),
                      cta: 'Add Lead',
                      ctaColor: 'bg-primary hover:bg-primary-dark text-white',
                    },
                    {
                      step: '2',
                      title: 'Set a follow-up date',
                      desc: 'Never forget to call back. BrainMate reminds you on the right day.',
                      color: 'bg-amber-50 text-amber-600 border-amber-100',
                      href: '/followups',
                      cta: 'View Follow-ups',
                      ctaColor: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
                    },
                    {
                      step: '3',
                      title: 'Track your pipeline',
                      desc: 'See conversion rates, pipeline value and source breakdown in Analytics.',
                      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                      href: '/analytics',
                      cta: 'View Analytics',
                      ctaColor: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
                    },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-4 px-5 py-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border ${item.color}`}>
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      {item.action ? (
                        <button onClick={item.action}
                          className={`flex-shrink-0 h-8 px-3 rounded-xl text-xs font-semibold active:scale-95 transition ${item.ctaColor}`}>
                          {item.cta}
                        </button>
                      ) : (
                        <Link href={item.href!}
                          className={`flex-shrink-0 h-8 px-3 rounded-xl text-xs font-semibold active:scale-95 transition flex items-center ${item.ctaColor}`}>
                          {item.cta}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 bg-slate-50 border-t border-border">
                  <button onClick={() => setShowModal(true)}
                    className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition flex items-center justify-center gap-2 text-sm">
                    <Plus size={16} /> Add Your First Lead
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions — shown when leads exist */}
            {(loading || recentLeads.length > 0) && (
              <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
                <h2 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide text-muted">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Add Lead',    icon: Plus,      action: () => setShowModal(true), color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
                    { label: 'Follow-ups', icon: Calendar,  href: '/followups',               color: 'bg-amber-50 text-amber-600 hover:bg-amber-100'  },
                    { label: 'Analytics',  icon: BarChart2, href: '/analytics',               color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                  ].map(item => (
                    item.href ? (
                      <Link key={item.label} href={item.href}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl ${item.color} active:scale-95 transition`}>
                        <item.icon size={20} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </Link>
                    ) : (
                      <button key={item.label} onClick={item.action}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl ${item.color} active:scale-95 transition w-full`}>
                        <item.icon size={20} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {(loading || recentLeads.length > 0) && (
              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 lg:px-5 py-3.5 border-b border-border">
                  <h2 className="font-semibold text-slate-800 text-sm">Recent Activity</h2>
                  <Link href="/leads" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-muted text-sm">No activity yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activities.slice(0, 8).map(activity => {
                      const Icon = ACTIVITY_ICONS[activity.type] || Plus;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 px-4 lg:px-5 py-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon size={13} className="text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-snug">{activity.description}</p>
                            <p className="text-xs text-muted mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tip of the day */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 lg:p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-200 mb-1.5 uppercase tracking-wider">Tip of the Day</p>
                  <p className="text-sm leading-relaxed text-white/90">{getTodaysTip()}</p>
                </div>
              </div>
            </div>

            {/* Recent Leads — only when data exists */}
            {recentLeads.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 lg:px-5 py-3.5 border-b border-border">
                  <h2 className="font-semibold text-slate-800 text-sm">Recent Leads</h2>
                  <Link href="/leads" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    All <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {recentLeads.map(lead => {
                    const status = template.statuses.find(s => s.label === lead.status);
                    const initials = lead.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <Link key={lead.id} href={`/leads/${lead.id}`}
                        className="flex items-center gap-3 px-4 lg:px-5 py-3 hover:bg-slate-50 transition">
                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{lead.name}</p>
                          <p className="text-xs text-muted truncate">{lead.category}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                          style={{ backgroundColor: status?.bgColor + '20', color: status?.bgColor }}>
                          {lead.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feature highlights — shown only when no leads */}
            {!loading && recentLeads.length === 0 && (
              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border">
                  <h2 className="font-semibold text-slate-800 text-sm">What BrainMate tracks</h2>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { icon: '📋', label: 'Leads & Inquiries',   desc: 'All in one place, never lost' },
                    { icon: '📅', label: 'Follow-up Reminders', desc: 'Never miss a callback' },
                    { icon: '📊', label: 'Conversion Analytics',desc: "Know what's working" },
                    { icon: '📱', label: 'Works Offline',       desc: 'Data stored on your device' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center flex-shrink-0">{f.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{f.label}</p>
                        <p className="text-xs text-muted">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLeadModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSaveLead} template={template} />
    </div>
  );
}
