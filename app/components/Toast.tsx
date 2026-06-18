'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

const ICONS    = { success: CheckCircle2, error: XCircle, info: Info };
const BG_CLASS = { success: 'bg-slate-900 text-white', error: 'bg-danger text-white', info: 'bg-primary text-white' };

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 left-4 lg:left-auto lg:w-80 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl pointer-events-auto animate-slide-right cursor-pointer ${BG_CLASS[toast.type]}`}
            onClick={() => removeToast(toast.id)}
          >
            <Icon size={18} className="flex-shrink-0 opacity-90" />
            <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
            <X size={14} className="flex-shrink-0 opacity-60" />
          </div>
        );
      })}
    </div>
  );
}
