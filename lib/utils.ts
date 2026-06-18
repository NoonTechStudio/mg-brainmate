export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatFollowUpDate(dateStr?: string): {
  label: string;
  urgent: boolean;
  overdue: boolean;
} {
  if (!dateStr) return { label: 'No follow-up set', urgent: false, overdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');

  const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`, urgent: true, overdue: true };
  if (diff === 0) return { label: 'Today', urgent: true, overdue: false };
  if (diff === 1) return { label: 'Tomorrow', urgent: false, overdue: false };
  if (diff <= 7) return { label: `In ${diff} days`, urgent: false, overdue: false };
  return { label: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), urgent: false, overdue: false };
}

export function isFollowUpToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isFollowUpOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export function isFollowUpUpcoming(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr > today;
}

export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diff = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function generateWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const num = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  const encodedMsg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${num}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

export function generateCallUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `tel:+${cleaned.startsWith('91') ? cleaned : `91${cleaned}`}`;
}

export const TIPS = [
  '💡 Always follow up within 24 hours of the first inquiry for the best conversion.',
  '📞 A quick call beats a long message – pick up the phone!',
  '📝 Add detailed notes after every conversation to never forget context.',
  '⏰ Set follow-up dates immediately when adding a new lead.',
  '🎯 Focus on leads with the highest estimated value first.',
  '📊 Review your analytics weekly to spot patterns in your conversions.',
  '🤝 Referrals convert 3x better than cold leads – ask happy clients!',
  '📱 WhatsApp follow-ups get 40% higher response rates than calls.',
  '✅ Update lead status in real-time to keep your pipeline accurate.',
  '🌟 A personalized approach beats a generic one every time.',
];

export function getTodaysTip(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[dayOfYear % TIPS.length];
}

export function vibrate(pattern: number | number[] = 10): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row =>
      keys.map(k => {
        const val = row[k];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
