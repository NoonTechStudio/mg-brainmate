'use client';

import Link from 'next/link';
import { Phone, MessageCircle, Trash2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { type Lead } from '@/lib/db';
import { formatFollowUpDate, formatCurrency, generateWhatsAppUrl, generateCallUrl, vibrate } from '@/lib/utils';
import { type StatusConfig } from '@/lib/industryTemplates';

interface LeadCardProps {
  lead: Lead;
  statuses: StatusConfig[];
  onDelete?: (id: number) => void;
  compact?: boolean;
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500',   'bg-blue-500',   'bg-violet-500',
];

export default function LeadCard({ lead, statuses, onDelete, compact }: LeadCardProps) {
  const statusConfig = statuses.find(s => s.label === lead.status) ?? statuses[0];
  const followUp     = formatFollowUpDate(lead.followUpDate);
  const initials     = lead.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor  = AVATAR_COLORS[lead.name.charCodeAt(0) % AVATAR_COLORS.length];

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Link href={`/leads/${lead.id}`}>
      <article className="bg-surface rounded-2xl border border-border hover:border-slate-300 hover:shadow-md transition-all duration-200 active:scale-[0.99] overflow-hidden group">
        {/* Top section */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-xl ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate leading-tight">{lead.name}</h3>
                  <p className="text-sm text-muted mt-0.5">{lead.phone}</p>
                </div>
                <span
                  className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap"
                  style={{ backgroundColor: statusConfig?.bgColor + '20', color: statusConfig?.bgColor, border: `1px solid ${statusConfig?.bgColor}30` }}
                >
                  {lead.status}
                </span>
              </div>

              {!compact && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                    {lead.category}
                  </span>
                  {lead.estimatedValue && lead.estimatedValue > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {formatCurrency(lead.estimatedValue)}
                    </span>
                  )}
                  {lead.source && (
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded-md bg-slate-50">
                      {lead.source}
                    </span>
                  )}
                </div>
              )}

              {lead.followUpDate && !compact && (
                <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
                  followUp.overdue ? 'text-red-500' : followUp.urgent ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  {followUp.overdue
                    ? <AlertCircle size={12} />
                    : followUp.urgent
                    ? <Clock size={12} />
                    : <Calendar size={12} />
                  }
                  <span>{followUp.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        {!compact && (
          <div className="flex items-center border-t border-border/60 divide-x divide-border/60">
            <a
              href={generateCallUrl(lead.phone)}
              onClick={(e) => { stop(e); vibrate(10); }}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition"
            >
              <Phone size={13} />
              Call
            </a>
            <a
              href={generateWhatsAppUrl(lead.phone, `Hi ${lead.name.split(' ')[0]}, `)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { stop(e); vibrate(10); }}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
            {onDelete && (
              <button
                onClick={(e) => { stop(e); vibrate([10,50,10]); if (lead.id) onDelete(lead.id); }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
