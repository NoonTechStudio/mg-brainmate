'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Phone, MessageCircle, Pencil, Trash2, Clock, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, type Lead, type Activity, logActivity } from '@/lib/db';
import AddLeadModal from '@/app/components/AddLeadModal';
import { formatFollowUpDate, formatCurrency, formatRelativeTime, generateWhatsAppUrl, generateCallUrl, vibrate } from '@/lib/utils';

const ACT_ICONS: Record<string, React.ElementType> = {
  added: CheckCircle2, updated: Pencil, status_changed: Clock, followup_done: CheckCircle2, deleted: Trash2,
};
const ACT_COLORS: Record<string, string> = {
  added: 'text-emerald-500 bg-emerald-50', updated: 'text-blue-500 bg-blue-50',
  status_changed: 'text-indigo-500 bg-indigo-50', followup_done: 'text-emerald-500 bg-emerald-50', deleted: 'text-red-500 bg-red-50',
};

const AVATAR_COLORS = ['bg-indigo-500','bg-emerald-500','bg-amber-500','bg-pink-500','bg-blue-500','bg-violet-500'];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }        = use(params);
  const router        = useRouter();
  const { template, businessName, showToast, showConfetti } = useApp();
  const [lead, setLead]         = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [newNote, setNewNote]       = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleAppendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNote = newNote.trim();
    if (!cleanNote || !lead?.id) return;
    
    vibrate(10);
    const timestamp = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const updatedNotes = lead.notes
      ? `${lead.notes}\n\n[${timestamp}]: ${cleanNote}`
      : `[${timestamp}]: ${cleanNote}`;
       
    const now = new Date().toISOString();
    await db.leads.update(lead.id, { notes: updatedNotes, updatedAt: now });
    await logActivity('updated', `Added note: "${cleanNote.slice(0, 30)}..."`, lead.id);
    showToast('Note added successfully', 'success');
    setNewNote('');
    await loadLead();
  };

  const getWhatsAppTemplate = (type: string) => {
    if (!lead) return '';
    const name = lead.name.split(' ')[0];
    const business = businessName || 'our agency';
    const category = lead.category;
    
    const destination = lead.customFields?.destination || 'your destination';
    const passengers = lead.customFields?.passengers || '1';
    
    let travelDateStr = '';
    if (lead.customFields?.travelDate) {
      try {
        travelDateStr = new Date(lead.customFields.travelDate + 'T00:00:00').toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        travelDateStr = lead.customFields.travelDate;
      }
    } else {
      travelDateStr = 'soon';
    }

    switch (type) {
      case 'greeting':
        return `Hello *${name}*, thank you for reaching out to *${business}*! We are excited to assist you with your *${category}* inquiry for *${destination}*. Could you please share your preferred travel dates and budget so we can prepare a quote for you?`;
      case 'quote':
        return `Hi *${name}*, we have prepared a customized quote for your *${category}* to *${destination}* for *${passengers}* traveler(s). Please review it and let us know if you want any modifications. Looking forward to booking your trip!`;
      case 'docs':
        return `Dear *${name}*, we need a few documents to proceed with your *${category}* booking (e.g. passport copies/visa documents). Please send them here at your earliest convenience so we can finalize the bookings.`;
      case 'confirm':
        return `Dear *${name}*, congratulations! Your *${category}* to *${destination}* is officially confirmed. Your travel date is *${travelDateStr}*. We wish you a wonderful journey! Thank you for choosing *${business}*.`;
      default:
        return '';
    }
  };

  const loadLead = useCallback(async () => {
    const numId = parseInt(id);
    if (isNaN(numId)) { router.replace('/leads'); return; }
    const [l, acts] = await Promise.all([
      db.leads.get(numId),
      db.activities.where('leadId').equals(numId).reverse().toArray(),
    ]);
    if (!l) { router.replace('/leads'); return; }
    setLead(l);
    setActivities(acts);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    setTimeout(() => {
      loadLead();
    }, 0);
  }, [loadLead]);

  const WON = ['Won','Booked','Deal Closed','Policy Issued','Admission Confirmed','Event Done','Confirmed'];

  const handleUpdateLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!lead?.id) return;
    const now = new Date().toISOString();
    await db.leads.update(lead.id, { ...leadData, updatedAt: now });
    if (lead.status !== leadData.status) {
      await logActivity('status_changed', `${lead.name}: ${lead.status} → ${leadData.status}`, lead.id);
      if (WON.includes(leadData.status)) showConfetti();
    } else {
      await logActivity('updated', `Updated: ${leadData.name}`, lead.id);
    }
    showToast('Lead updated', 'success');
    setShowModal(false);
    await loadLead();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead?.id || lead.status === newStatus) return;
    vibrate(10);
    const now = new Date().toISOString();
    await db.leads.update(lead.id, { status: newStatus, updatedAt: now });
    await logActivity('status_changed', `${lead.name}: ${lead.status} → ${newStatus}`, lead.id);
    if (WON.includes(newStatus)) showConfetti();
    showToast(`Status: ${newStatus}`, 'success');
    await loadLead();
  };

  const handleDelete = async () => {
    if (!lead?.id) return;
    if (!confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    vibrate([10, 50, 10]);
    await db.leads.delete(lead.id);
    await logActivity('deleted', `Deleted: ${lead.name}`, lead.id);
    showToast('Lead deleted', 'info');
    router.replace('/leads');
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-9 w-24 rounded-xl" />
        <div className="skeleton h-52 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" />
      </div>
    );
  }
  if (!lead) return null;

  const statusConfig  = template.statuses.find(s => s.label === lead.status) ?? template.statuses[0];
  const followUp      = formatFollowUpDate(lead.followUpDate);
  const initials      = lead.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor   = AVATAR_COLORS[lead.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 lg:px-8 pt-10 lg:pt-5 pb-3 max-w-3xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted hover:text-slate-700 transition">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 bg-indigo-50 text-primary font-semibold text-sm rounded-xl hover:bg-indigo-100 active:scale-95 transition"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-9 h-9 bg-red-50 text-danger flex items-center justify-center rounded-xl hover:bg-red-100 active:scale-95 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        {/* Visual Progress Stepper */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5 dark:border-slate-800">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Inquiry Stage</h2>
          <div className="relative flex items-center justify-between px-2">
            {/* Connecting lines */}
            <div className="absolute left-4 right-4 top-3.5 h-1 bg-slate-100 dark:bg-slate-800 z-0 rounded" />
            <div
              className="absolute left-4 top-3.5 h-1 bg-primary transition-all duration-500 z-0 rounded"
              style={{
                width: `${(template.statuses.findIndex(s => s.label === lead.status) / (template.statuses.length - 1)) * 92}%`
              }}
            />
            {template.statuses.map((s, idx) => {
              const activeIndex = template.statuses.findIndex(st => st.label === lead.status);
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={s.label}
                  onClick={() => handleStatusChange(s.label)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                  title={`Change status to ${s.label}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border-2 ${
                      isCurrent
                        ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/30'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-surface dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isCompleted && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`absolute top-9 text-[9px] font-bold tracking-tight text-center w-16 truncate transition-colors ${
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="h-5" /> {/* Spacer for labels */}
        </div>

        {/* Main card */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden dark:border-slate-800">
          {/* Color top bar */}
          <div className="h-1.5" style={{ backgroundColor: statusConfig?.bgColor }} />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{lead.name}</h1>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: statusConfig?.bgColor + '20', color: statusConfig?.bgColor }}
                  >
                    {lead.status}
                  </span>
                </div>
                <p className="text-muted text-sm mt-0.5">{lead.phone}</p>
                {lead.email && <p className="text-muted text-sm">{lead.email}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium px-2.5 py-1 rounded-md border border-border/40">{lead.category}</span>
                  {lead.estimatedValue && lead.estimatedValue > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                      {formatCurrency(lead.estimatedValue)}
                    </span>
                  )}
                  {lead.source && (
                    <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1 rounded-md border border-border/40">{lead.source}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <a
                href={generateCallUrl(lead.phone)}
                onClick={() => vibrate(10)}
                className="flex items-center justify-center gap-2 h-11 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/20 active:scale-95 transition"
              >
                <Phone size={16} /> Call Now
              </a>
              <a
                href={generateWhatsAppUrl(lead.phone, `Hi ${lead.name.split(' ')[0]}, `)}
                target="_blank" rel="noreferrer"
                onClick={() => vibrate(10)}
                className="flex items-center justify-center gap-2 h-11 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/20 active:scale-95 transition"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Follow-up banner */}
        {lead.followUpDate && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
            followUp.overdue ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30' : followUp.urgent ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30' : 'bg-surface border-border dark:border-slate-800'
          }`}>
            {followUp.overdue ? <AlertCircle size={20} className="text-danger flex-shrink-0" />
             : followUp.urgent ? <Clock size={20} className="text-amber-500 flex-shrink-0" />
             : <Calendar size={20} className="text-muted flex-shrink-0" />}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Follow-up</p>
              <p className={`font-semibold text-sm ${followUp.overdue ? 'text-danger' : followUp.urgent ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {followUp.label}
              </p>
            </div>
          </div>
        )}

        {/* Quick WhatsApp Templates Drawer */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">WhatsApp Replies</h2>
              <p className="text-[11px] text-muted">Generate templates loaded with travel details</p>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {showTemplates ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {showTemplates && (
            <div className="space-y-3 mt-4 animate-slide-down">
              {[
                { id: 'greeting', title: '👋 Inquiry Greeting', desc: 'Welcome client & seek requirements' },
                { id: 'quote', title: '📄 Send Quotation', desc: 'Share pricing & traveler counts' },
                { id: 'docs', title: '📎 Document Request', desc: 'Ask for passport/visa attachments' },
                { id: 'confirm', title: '✈️ Confirm Booking', desc: 'Share confirmed travel dates' },
              ].map(item => {
                const message = getWhatsAppTemplate(item.id);
                const waUrl = generateWhatsAppUrl(lead.phone, message);
                return (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border/80 dark:border-slate-800/80 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-[10px] text-muted">{item.desc}</p>
                      </div>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => vibrate(10)}
                        className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <MessageCircle size={11} /> Send
                      </a>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-border/40 select-all leading-relaxed whitespace-pre-wrap italic">
                      &ldquo;{message}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Details</h2>
          <div className="space-y-3">
            {lead.source && <Row label="Lead Source" value={lead.source} />}
            {lead.followUpDate && (
              <Row label="Follow-up Date" value={new Date(lead.followUpDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} />
            )}
            {lead.assignedTo && <Row label="Assigned To" value={lead.assignedTo} />}
            {template.extraFields.map(field => {
              const val = lead.customFields?.[field.name];
              if (!val) return null;
              return <Row key={field.name} label={field.label} value={val} />;
            })}
          </div>
        </div>

        {/* Interactive Notes Logs */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Activity & Notes Log</h2>
          
          {lead.notes ? (
            <div className="max-h-48 overflow-y-auto mb-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-border/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {lead.notes}
            </div>
          ) : (
            <p className="text-xs text-muted mb-4 italic">No specific notes captured yet. Add a log below.</p>
          )}
          
          <form onSubmit={handleAppendNote} className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Type dynamic comment or update to append..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs resize-none transition"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl flex-shrink-0 active:scale-95 transition"
            >
              Add Note
            </button>
          </form>
        </div>

        {/* Meta timestamps */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Added', value: formatRelativeTime(lead.createdAt) },
            { label: 'Updated', value: formatRelativeTime(lead.updatedAt) },
          ].map(m => (
            <div key={m.label} className="bg-surface rounded-xl border border-border p-3 text-center">
              <p className="text-xs text-muted">{m.label}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Activity */}
        {activities.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 lg:px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-slate-700">Activity History</h2>
            </div>
            <div className="divide-y divide-border">
              {activities.map(act => {
                const Icon  = ACT_ICONS[act.type] ?? CheckCircle2;
                const color = ACT_COLORS[act.type] ?? 'text-slate-500 bg-slate-50';
                return (
                  <div key={act.id} className="flex items-start gap-3 px-4 lg:px-5 py-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{act.description}</p>
                      <p className="text-xs text-muted mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>

      <AddLeadModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleUpdateLead} template={template} editLead={lead} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs font-medium text-muted flex-shrink-0 w-28">{label}</span>
      <span className="text-sm text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}
