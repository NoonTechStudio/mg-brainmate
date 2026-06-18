'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Database, ChevronRight, Save, Plus, Trash2, Upload, Download, RefreshCw, Sun, Moon } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, getSetting, setSetting, type Lead, type TeamMember, logActivity } from '@/lib/db';
import { exportToCSV, vibrate } from '@/lib/utils';
import { industryTemplates } from '@/lib/industryTemplates';

type Section = 'main' | 'business' | 'team' | 'data';

export default function SettingsPage() {
  const { template, industryId, setIndustryId, businessName, setBusinessName, showToast, theme, toggleTheme } = useApp();
  const [section, setSection] = useState<Section>('main');
  const [bizName, setBizName] = useState(businessName);
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);

  const [prevBusinessName, setPrevBusinessName] = useState(businessName);
  if (businessName !== prevBusinessName) {
    setPrevBusinessName(businessName);
    setBizName(businessName);
  }

  useEffect(() => {
    Promise.all([getSetting('bizPhone'), getSetting('bizEmail')]).then(([ph, em]) => {
      if (ph) setBizPhone(ph);
      if (em) setBizEmail(em);
    });
    db.team.toArray().then(setTeam);
  }, []);

  const saveBusiness = async () => {
    setSaving(true);
    await setSetting('businessName', bizName.trim());
    await setSetting('bizPhone', bizPhone.trim());
    await setSetting('bizEmail', bizEmail.trim());
    setBusinessName(bizName.trim());
    showToast('Business profile saved', 'success');
    setSaving(false);
    setSection('main');
  };

  const addTeamMember = async () => {
    if (!newMember.name.trim()) return;
    await db.team.add(newMember);
    const members = await db.team.toArray();
    setTeam(members);
    setNewMember({ name: '', phone: '', role: '' });
    showToast(`${newMember.name} added`, 'success');
  };

  const removeTeamMember = async (id: number) => {
    await db.team.delete(id);
    setTeam(t => t.filter(m => m.id !== id));
  };

  const exportLeads = async () => {
    const leads = await db.leads.toArray();
    if (!leads.length) { showToast('No leads to export', 'info'); return; }
    exportToCSV(leads.map(l => ({
      Name: l.name, Phone: l.phone, Email: l.email || '',
      Category: l.category, Status: l.status,
      FollowUpDate: l.followUpDate || '', Source: l.source || '',
      EstimatedValue: l.estimatedValue || 0, Notes: l.notes || '',
      AssignedTo: l.assignedTo || '', CreatedAt: l.createdAt,
    })), `brainmate-leads-${new Date().toISOString().slice(0, 10)}`);
    showToast(`Exported ${leads.length} leads`, 'success');
  };

  const importLeads = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(Boolean);
    if (lines.length < 2) { showToast('Invalid CSV file', 'error'); return; }
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const nameIdx  = headers.findIndex(h => h.toLowerCase().includes('name'));
    const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone'));
    if (nameIdx === -1 || phoneIdx === -1) { showToast('CSV must have Name and Phone columns', 'error'); return; }
    const now = new Date().toISOString();
    const toAdd: Omit<Lead, 'id'>[] = lines.slice(1).map(line => {
      const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        name: cells[nameIdx] || 'Unknown', phone: cells[phoneIdx] || '',
        email: headers.includes('Email') ? cells[headers.indexOf('Email')] : '',
        category: template.categories[0], status: template.statuses[0].label,
        notes: '', source: 'Import', customFields: {}, createdAt: now, updatedAt: now,
      };
    }).filter(l => l.name && l.phone);
    await db.leads.bulkAdd(toAdd);
    await logActivity('added', `Imported ${toAdd.length} leads from CSV`);
    showToast(`Imported ${toAdd.length} leads`, 'success');
    e.target.value = '';
  };

  const clearAllData = async () => {
    if (!confirm('Delete ALL leads and activities? This cannot be undone!')) return;
    vibrate([10, 100, 10]);
    await db.leads.clear();
    await db.activities.clear();
    showToast('All data cleared', 'info');
  };

  const resetOnboarding = async () => {
    if (!confirm('This will take you to onboarding. Your leads will remain.')) return;
    await db.settings.where('key').equals('industry').delete();
    await db.settings.where('key').equals('isSeeded').delete();
    window.location.href = '/onboarding';
  };

  const inputCls = 'w-full h-11 px-4 rounded-xl border border-border bg-bg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition';

  if (section === 'business') return (
    <div className="min-h-screen">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 max-w-3xl mx-auto">
          <button onClick={() => setSection('main')} className="text-muted text-sm mb-2 flex items-center gap-1 hover:text-slate-700 transition">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-800">Business Profile</h1>
        </div>
      </div>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm space-y-4">
          {[
            { label: 'Business Name', value: bizName, set: setBizName, placeholder: 'My Business', type: 'text' },
            { label: 'Business Phone', value: bizPhone, set: setBizPhone, placeholder: '+91 98765 43210', type: 'tel' },
            { label: 'Business Email', value: bizEmail, set: setBizEmail, placeholder: 'info@mybusiness.com', type: 'email' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Industry Template</label>
            <select
              value={industryId}
              onChange={async e => {
                const newId = e.target.value;
                await setSetting('industry', newId);
                setIndustryId(newId);
                showToast('Industry template updated', 'success');
              }}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {Object.values(industryTemplates).map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={saveBusiness} disabled={saving}
          className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-primary/20 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );

  if (section === 'team') return (
    <div className="min-h-screen">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 max-w-3xl mx-auto">
          <button onClick={() => setSection('main')} className="text-muted text-sm mb-2 hover:text-slate-700 transition">← Back</button>
          <h1 className="text-xl font-bold text-slate-800">Team Members</h1>
        </div>
      </div>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-3">
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <p className="text-sm font-semibold text-slate-700">Add New Member</p>
          {[
            { label: 'Name', key: 'name' as const, placeholder: 'John Smith', type: 'text' },
            { label: 'Phone', key: 'phone' as const, placeholder: '+91 98765 43210', type: 'tel' },
            { label: 'Role', key: 'role' as const, placeholder: 'Sales Executive', type: 'text' },
          ].map(f => (
            <input key={f.key} type={f.type} value={newMember[f.key]}
              onChange={e => setNewMember(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full h-10 px-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          ))}
          <button onClick={addTeamMember}
            className="w-full h-10 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl active:scale-95 transition flex items-center justify-center gap-2">
            <Plus size={14} /> Add Member
          </button>
        </div>
        {team.map(member => (
          <div key={member.id} className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {member.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{member.name}</p>
              <p className="text-xs text-muted">{member.role} · {member.phone}</p>
            </div>
            <button onClick={() => member.id && removeTeamMember(member.id)}
              className="w-8 h-8 bg-danger-light text-danger rounded-lg flex items-center justify-center hover:bg-red-100 transition">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {team.length === 0 && (
          <p className="text-center text-muted text-sm py-8">No team members yet. Add your first!</p>
        )}
      </div>
    </div>
  );

  if (section === 'data') return (
    <div className="min-h-screen">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 max-w-3xl mx-auto">
          <button onClick={() => setSection('main')} className="text-muted text-sm mb-2 hover:text-slate-700 transition">← Back</button>
          <h1 className="text-xl font-bold text-slate-800">Data Management</h1>
        </div>
      </div>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-3">
        <button onClick={exportLeads}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 active:scale-95 transition text-left hover:bg-emerald-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Export Leads (CSV)</p>
            <p className="text-xs opacity-70 mt-0.5">Download all leads as a spreadsheet</p>
          </div>
          <ChevronRight size={16} className="text-emerald-500" />
        </button>

        <label className="flex items-center gap-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50 text-primary active:scale-95 transition cursor-pointer hover:bg-indigo-100">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Upload size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Import Leads (CSV)</p>
            <p className="text-xs opacity-70 mt-0.5">Upload a CSV with Name and Phone columns</p>
          </div>
          <ChevronRight size={16} className="text-indigo-400" />
          <input type="file" accept=".csv" onChange={importLeads} className="hidden" />
        </label>

        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs text-muted font-semibold px-1 uppercase tracking-wide">Danger Zone</p>
          <button onClick={resetOnboarding}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 active:scale-95 transition hover:bg-amber-100">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <RefreshCw size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Change Industry Template</p>
              <p className="text-xs opacity-70 mt-0.5">Go back to onboarding to select a new industry</p>
            </div>
          </button>
          <button onClick={clearAllData}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-red-200 bg-red-50 text-danger active:scale-95 transition hover:bg-red-100">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Clear All Data</p>
              <p className="text-xs opacity-70 mt-0.5">Permanently delete all leads and activities</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Main settings
  const MENU_ITEMS = [
    { icon: Building2, title: 'Business Profile',  desc: 'Name, phone, email, industry', section: 'business' as Section, color: 'bg-indigo-50 text-primary' },
    { icon: Users,     title: 'Team Members',       desc: `${team.length} member${team.length !== 1 ? 's' : ''}`, section: 'team' as Section, color: 'bg-emerald-50 text-emerald-600' },
    { icon: Database,  title: 'Data Management',    desc: 'Export, import, backup',        section: 'data' as Section, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-slate-800">Settings</h1>
          <p className="text-xs text-muted mt-0.5">Customize BrainMate for your business</p>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        {/* Business card */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {template.icon}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{businessName || 'My Business'}</h2>
              <p className="text-white/70 text-sm">{template.name}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden dark:border-slate-800">
          {MENU_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button key={item.section} onClick={() => setSection(item.section)}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-bg active:bg-bg dark:hover:bg-slate-900/40 dark:active:bg-slate-900/40 transition text-left ${idx > 0 ? 'border-t border-border dark:border-slate-800' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.title}</p>
                  <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </button>
            );
          })}
        </div>

        {/* Theme Mode Option */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Theme Mode</h2>
              <p className="text-xs text-muted mt-0.5">Toggle light/dark display preference</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={13} className="text-indigo-600 animate-pulse" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={13} className="text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status workflow */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">Status Workflow</h2>
          <div className="flex flex-wrap gap-2">
            {template.statuses.map(s => (
              <span key={s.label} className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: s.bgColor, color: s.color }}>
                {s.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Workflow is based on your industry template.</p>
        </div>

        {/* Categories */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 lg:p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">Lead Categories</h2>
          <div className="flex flex-wrap gap-2">
            {template.categories.map(c => (
              <span key={c} className="text-xs bg-bg border border-border text-slate-600 px-2.5 py-1 rounded-lg">{c}</span>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
