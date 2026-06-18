'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, CheckCircle2, Clock, AlertCircle, Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, type Lead, logActivity } from '@/lib/db';
import { generateCallUrl, generateWhatsAppUrl, vibrate } from '@/lib/utils';

type Tab = 'today' | 'overdue' | 'upcoming';

export default function FollowUpsPage() {
  const { template, showToast } = useApp();
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('today');
  const [snoozeOpenId, setSnoozeOpenId] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadLeads = useCallback(async () => {
    const all = await db.leads.filter(l => !!l.followUpDate).sortBy('followUpDate');
    setLeads(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadLeads();
    }, 0);
  }, [loadLeads]);

  const todayLeads    = leads.filter(l => l.followUpDate === todayStr);
  const overdueLeads  = leads.filter(l => l.followUpDate! < todayStr);
  const upcomingLeads = leads.filter(l => l.followUpDate! > todayStr);
  const displayLeads  = tab === 'today' ? todayLeads : tab === 'overdue' ? overdueLeads : upcomingLeads;

  const markDone = async (lead: Lead) => {
    if (!lead.id) return;
    vibrate(10);
    await db.leads.update(lead.id, { followUpDate: '', updatedAt: new Date().toISOString() });
    await logActivity('followup_done', `Follow-up done: ${lead.name}`, lead.id);
    showToast(`Follow-up done: ${lead.name} ✓`, 'success');
    await loadLeads();
  };

  const reschedule = async (lead: Lead, daysOffset: number, label: string) => {
    if (!lead.id) return;
    vibrate(8);
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const newDate = d.toISOString().split('T')[0];
    await db.leads.update(lead.id, { followUpDate: newDate, updatedAt: new Date().toISOString() });
    await logActivity('updated', `Rescheduled: ${lead.name} → ${newDate}`, lead.id);
    showToast(`Rescheduled to ${label}`, 'info');
    setSnoozeOpenId(null);
    await loadLeads();
  };

  const TABS = [
    { key: 'today'    as Tab, label: "Today",    count: todayLeads.length,    icon: Clock,        emptyIcon: '🎉', emptyMsg: "You're all caught up!",     emptyDesc: 'No follow-ups scheduled for today.' },
    { key: 'overdue'  as Tab, label: 'Overdue',  count: overdueLeads.length,  icon: AlertCircle,  emptyIcon: '✅', emptyMsg: 'No overdue follow-ups!',    emptyDesc: 'Great job staying on top of things.' },
    { key: 'upcoming' as Tab, label: 'Upcoming', count: upcomingLeads.length, icon: Calendar,     emptyIcon: '📅', emptyMsg: 'No upcoming follow-ups',    emptyDesc: 'Add follow-up dates to your leads.' },
  ];

  const SNOOZE_OPTIONS = [
    { label: 'Tomorrow',      days: 1  },
    { label: 'In 3 days',     days: 3  },
    { label: 'Next week',     days: 7  },
    { label: 'In 2 weeks',    days: 14 },
  ];

  return (
    <div className="min-h-screen" onClick={() => snoozeOpenId && setSnoozeOpenId(null)}>
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-0 max-w-4xl mx-auto">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-slate-800">Follow-ups</h1>
            <p className="text-xs text-muted mt-0.5">
              {overdueLeads.length > 0 && <span className="text-danger font-semibold">{overdueLeads.length} overdue · </span>}
              {todayLeads.length} today · {upcomingLeads.length} upcoming
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex flex-col items-center pb-3 pt-1 text-xs font-semibold border-b-2 transition ${
                    tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} />
                    <span>{t.label}</span>
                    {t.count > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        tab === t.key ? 'bg-primary text-white' :
                        t.key === 'overdue' ? 'bg-red-100 text-danger' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)
        ) : displayLeads.length === 0 ? (
          (() => { const t = TABS.find(t => t.key === tab)!; return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">{t.emptyIcon}</div>
              <h3 className="text-lg font-semibold text-slate-700">{t.emptyMsg}</h3>
              <p className="text-muted text-sm mt-1 mb-6">{t.emptyDesc}</p>
              <Link href="/leads" className="flex items-center gap-2 h-11 px-6 bg-primary text-white font-semibold rounded-xl shadow-md shadow-primary/20 active:scale-95 transition">
                Go to Leads
              </Link>
            </div>
          ); })()
        ) : (
          displayLeads.map(lead => {
            const statusConfig = template.statuses.find(s => s.label === lead.status);
            const isOverdue    = lead.followUpDate! < todayStr;
            const isToday      = lead.followUpDate === todayStr;

            return (
              <div
                key={lead.id}
                onClick={e => e.stopPropagation()}
                className={`bg-surface rounded-2xl border shadow-sm overflow-hidden ${
                  isOverdue ? 'border-red-200' : isToday ? 'border-amber-200' : 'border-border'
                }`}
              >
                {/* Banner */}
                <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
                  isOverdue ? 'bg-red-50 text-danger' : isToday ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-primary'
                }`}>
                  {isOverdue ? <AlertCircle size={12} /> : isToday ? <Clock size={12} /> : <Calendar size={12} />}
                  {isOverdue
                    ? `Overdue – ${new Date(lead.followUpDate! + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : isToday ? 'Due Today'
                    : new Date(lead.followUpDate! + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                  }
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/leads/${lead.id}`} className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">{lead.name}</h3>
                          <p className="text-sm text-muted">{lead.phone}</p>
                        </div>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: statusConfig?.bgColor + '20', color: statusConfig?.bgColor }}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md mt-2 inline-block">{lead.category}</span>
                      {lead.notes && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">&ldquo;{lead.notes}&rdquo;</p>
                      )}
                    </Link>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 mt-3">
                    <a href={generateCallUrl(lead.phone)} onClick={() => vibrate(10)}
                      className="flex items-center gap-1.5 h-9 px-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 active:scale-95 transition">
                      <Phone size={13} /> Call
                    </a>
                    <a href={generateWhatsAppUrl(lead.phone)} target="_blank" rel="noreferrer" onClick={() => vibrate(10)}
                      className="flex items-center gap-1.5 h-9 px-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 active:scale-95 transition">
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => markDone(lead)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl active:scale-95 transition"
                    >
                      <CheckCircle2 size={14} /> Mark Done
                    </button>

                    {/* Snooze with state-based dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSnoozeOpenId(snoozeOpenId === lead.id ? null : lead.id ?? null); }}
                        className="h-9 px-3 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl active:scale-95 transition"
                      >
                        <Clock size={13} /> Snooze <ChevronDown size={11} />
                      </button>
                      {snoozeOpenId === lead.id && (
                        <div
                          className="absolute bottom-full left-0 mb-1 bg-surface border border-border rounded-xl shadow-xl p-1 z-20 min-w-[140px] animate-slide-down"
                          onClick={e => e.stopPropagation()}
                        >
                          {SNOOZE_OPTIONS.map(opt => (
                            <button
                              key={opt.days}
                              onClick={() => reschedule(lead, opt.days, opt.label)}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
