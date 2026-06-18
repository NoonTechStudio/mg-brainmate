'use client';

import { useState, useEffect } from 'react';
import { X, Save, PlusCircle } from 'lucide-react';
import { type Lead } from '@/lib/db';
import { type IndustryTemplate } from '@/lib/industryTemplates';
import { vibrate } from '@/lib/utils';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, addAnother?: boolean) => void;
  template: IndustryTemplate;
  editLead?: Lead | null;
}

const EMPTY: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', phone: '', email: '', category: '', status: '',
  followUpDate: '', notes: '', source: '', estimatedValue: 0,
  assignedTo: '', customFields: {},
};

export default function AddLeadModal({ isOpen, onClose, onSave, template, editLead }: AddLeadModalProps) {
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      if (editLead) {
        setForm({
          name: editLead.name,
          phone: editLead.phone,
          email: editLead.email || '',
          category: editLead.category,
          status: editLead.status,
          followUpDate: editLead.followUpDate || '',
          notes: editLead.notes || '',
          source: editLead.source || '',
          estimatedValue: editLead.estimatedValue || 0,
          assignedTo: editLead.assignedTo || '',
          customFields: editLead.customFields || {},
        });
      } else {
        setForm({ ...EMPTY, category: template.categories[0] || '', status: template.statuses[0]?.label || '', customFields: {} });
      }
      setErrors({});
    }, 0);
  }, [editLead, template, isOpen]);

  const set = (key: keyof typeof form, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const setCustom = (key: string, value: string) =>
    setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [key]: value } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.category)     e.category = 'Select a category';
    if (!form.status)       e.status   = 'Select a status';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (addAnother = false) => {
    if (!validate()) return;
    vibrate(10);
    onSave(form, addAnother);
    if (addAnother) {
      setForm(prev => ({ ...EMPTY, category: prev.category, status: prev.status, customFields: {} }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog */}
      <div className="relative w-full lg:max-w-lg bg-surface lg:rounded-2xl rounded-t-3xl animate-slide-up lg:animate-scale-in max-h-[92vh] lg:max-h-[85vh] flex flex-col shadow-2xl">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editLead ? 'Edit Lead' : 'New Lead'}
            </h2>
            <p className="text-xs text-muted mt-0.5">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
          {/* Name */}
          <Field label="Full Name *" error={errors.name}>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Customer full name" className={input(errors.name)} autoFocus={!editLead} />
          </Field>

          {/* Phone */}
          <Field label="Phone Number *" error={errors.phone}>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+91 98765 43210" className={input(errors.phone)} />
          </Field>

          {/* Email */}
          <Field label="Email (optional)">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="email@example.com" className={input()} />
          </Field>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *" error={errors.category}>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={select(errors.category)}>
                {template.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status *" error={errors.status}>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={select(errors.status)}>
                {template.statuses.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Follow-up + Value */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Follow-up Date">
              <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} className={input()} />
            </Field>
            <Field label="Est. Value (₹)">
              <input type="number" value={form.estimatedValue || ''} onChange={e => set('estimatedValue', Number(e.target.value))}
                placeholder="50000" min={0} className={input()} />
            </Field>
          </div>

          {/* Source */}
          <Field label="Lead Source">
            <select value={form.source} onChange={e => set('source', e.target.value)} className={select()}>
              <option value="">Select source</option>
              {template.sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* Industry extra fields */}
          {template.extraFields.length > 0 && (
            <div>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted font-semibold uppercase tracking-wider px-1">{template.name} Details</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-3 mt-3">
                {template.extraFields.map(field => (
                  <Field key={field.name} label={field.label}>
                    {field.type === 'select' ? (
                      <select
                        value={form.customFields?.[field.name] || ''}
                        onChange={e => setCustom(field.name, e.target.value)}
                        className={select()}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={form.customFields?.[field.name] || ''}
                        onChange={e => setCustom(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={input()}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <Field label="Notes / Conversation">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Requirements, notes from last conversation, follow-up context..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm transition"
            />
          </Field>

          <div className="h-1" />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border pb-safe space-y-2">
          <button
            onClick={() => handleSave(false)}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {editLead ? 'Save Changes' : 'Save Lead'}
          </button>
          {!editLead && (
            <button
              onClick={() => handleSave(true)}
              className="w-full h-9 text-primary font-medium text-sm rounded-xl border border-primary/25 hover:bg-primary-light active:scale-95 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={14} />
              Save & Add Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
    </div>
  );
}

const base = 'w-full px-3 py-2.5 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition';
const input  = (err?: string) => `${base} ${err ? 'border-danger' : 'border-border'}`;
const select = (err?: string) => `${base} ${err ? 'border-danger' : 'border-border'} appearance-none cursor-pointer`;
