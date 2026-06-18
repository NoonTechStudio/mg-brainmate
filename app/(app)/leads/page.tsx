'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, LayoutGrid, List, X } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, type Lead, logActivity } from '@/lib/db';
import LeadCard from '@/app/components/LeadCard';
import AddLeadModal from '@/app/components/AddLeadModal';
import { vibrate } from '@/lib/utils';

type SortMode = 'newest' | 'oldest' | 'value' | 'followup';

export default function LeadsPage() {
  const { template, showToast, showConfetti } = useApp();
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [sortMode, setSortMode]     = useState<SortMode>('newest');
  const [viewMode, setViewMode]     = useState<'list' | 'grid' | 'kanban'>('list');
  const [filterPreset, setFilterPreset] = useState<'all' | 'today' | 'overdue' | 'highvalue'>('all');
  const [showModal, setShowModal]   = useState(false);
  const [editLead, setEditLead]     = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusDrop = async (leadId: number, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    
    vibrate(10);
    const now = new Date().toISOString();
    await db.leads.update(leadId, { status: newStatus, updatedAt: now });
    await logActivity('status_changed', `${lead.name}: ${lead.status} → ${newStatus}`, leadId);
    
    const wonStatuses = ['Won','Booked','Deal Closed','Policy Issued','Admission Confirmed','Event Done','Confirmed'];
    if (wonStatuses.includes(newStatus)) {
      showConfetti();
    }
    showToast(`Status updated to ${newStatus}`, 'success');
    await loadLeads();
  };

  const loadLeads = useCallback(async () => {
    const all = await db.leads.orderBy('createdAt').reverse().toArray();
    setLeads(all);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.notes?.toLowerCase() ?? '').includes(q) ||
        (l.email?.toLowerCase() ?? '').includes(q)
      );
    }
    if (filterCategory) result = result.filter(l => l.category === filterCategory);
    if (filterStatus)   result = result.filter(l => l.status === filterStatus);
    
    if (filterPreset === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(l => l.followUpDate === today);
    } else if (filterPreset === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(l => l.followUpDate && l.followUpDate < today);
    } else if (filterPreset === 'highvalue') {
      result = result.filter(l => (l.estimatedValue || 0) >= 100000);
    }

    switch (sortMode) {
      case 'oldest':   result.reverse(); break;
      case 'value':    result.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0)); break;
      case 'followup': result.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return a.followUpDate.localeCompare(b.followUpDate);
      }); break;
    }
    return result;
  }, [leads, search, filterCategory, filterStatus, sortMode, filterPreset]);

  const handleSaveLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, addAnother?: boolean) => {
    const now = new Date().toISOString();
    if (editLead?.id) {
      await db.leads.update(editLead.id, { ...leadData, updatedAt: now });
      const wonStatuses = ['Won','Booked','Deal Closed','Policy Issued','Admission Confirmed','Event Done','Confirmed'];
      if (editLead.status !== leadData.status) {
        await logActivity('status_changed', `${editLead.name}: ${editLead.status} → ${leadData.status}`, editLead.id);
        if (wonStatuses.includes(leadData.status)) showConfetti();
      } else {
        await logActivity('updated', `Updated: ${leadData.name}`, editLead.id);
      }
      showToast('Lead updated', 'success');
      if (!addAnother) { setShowModal(false); setEditLead(null); }
    } else {
      const id = await db.leads.add({ ...leadData, createdAt: now, updatedAt: now });
      await logActivity('added', `Added: ${leadData.name} – ${leadData.category}`, Number(id));
      showToast(`Lead added: ${leadData.name}`, 'success');
      if (!addAnother) setShowModal(false);
    }
    await loadLeads();
  };

  const handleDelete = async (id: number) => {
    const lead = await db.leads.get(id);
    if (!lead) return;
    if (!confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    vibrate([10, 50, 10]);
    await db.leads.delete(id);
    await logActivity('deleted', `Deleted: ${lead.name}`, id);
    showToast('Lead deleted', 'info');
    await loadLeads();
  };

  const clearFilters = () => { setFilterCategory(''); setFilterStatus(''); setSearch(''); setFilterPreset('all'); };
  const activeFilters = [filterCategory, filterStatus, search].filter(Boolean).length + (filterPreset !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Leads</h1>
              <p className="text-xs text-muted mt-0.5">
                {filteredLeads.length} of {leads.length} leads
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 p-0.5">
                {[
                  { mode: 'list' as const, label: 'List', icon: List },
                  { mode: 'grid' as const, label: 'Grid', icon: LayoutGrid },
                  { mode: 'kanban' as const, label: 'Kanban', icon: SlidersHorizontal }
                ].map(item => {
                  const Icon = item.icon;
                  const active = viewMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setViewMode(item.mode)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        active
                          ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                          : 'text-muted hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={`${item.label} view`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setEditLead(null); setShowModal(true); }}
                className="flex items-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Lead</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, notes..."
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition ${
                activeFilters > 0 ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-border hover:border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <SlidersHorizontal size={12} />
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </button>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="flex-shrink-0 flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-500 transition">
                <X size={12} /> Clear
              </button>
            )}
            
            {/* Quick Presets */}
            {[
              { key: 'today' as const, label: '📅 Due Today' },
              { key: 'overdue' as const, label: '⚠️ Overdue' },
              { key: 'highvalue' as const, label: '💰 High Value' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setFilterPreset(filterPreset === p.key ? 'all' : p.key)}
                className={`flex-shrink-0 h-8 px-3 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                  filterPreset === p.key
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-600 border-border hover:border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
            {template.statuses.map(s => (
              <button
                key={s.label}
                onClick={() => setFilterStatus(filterStatus === s.label ? '' : s.label)}
                className={`flex-shrink-0 h-8 px-3 rounded-lg text-xs font-semibold border transition whitespace-nowrap`}
                style={filterStatus === s.label
                  ? { backgroundColor: s.bgColor, color: '#fff', borderColor: s.bgColor }
                  : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex gap-2 mt-2 animate-slide-down">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Categories</option>
                {template.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                className="flex-1 h-9 px-3 rounded-xl border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="value">Highest Value</option>
                <option value="followup">Follow-up Date</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leads list */}
      <div className="px-4 lg:px-8 py-4 max-w-7xl mx-auto">
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900/40 rounded-2xl flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No leads found</h3>
            <p className="text-muted text-sm mt-1 mb-6 max-w-xs">
              {activeFilters > 0 ? 'Try adjusting your search or filters.' : 'Add your first lead to get started.'}
            </p>
            {activeFilters > 0 ? (
              <button onClick={clearFilters} className="h-10 px-5 border border-border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60">
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => { setEditLead(null); setShowModal(true); }}
                className="flex items-center gap-2 h-11 px-6 bg-primary text-white font-semibold rounded-xl shadow-md shadow-primary/20 active:scale-95 transition"
              >
                <Plus size={16} /> Add First Lead
              </button>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar min-h-[60vh] items-start">
            {template.statuses.map(column => {
              const columnLeads = filteredLeads.filter(l => l.status === column.label);
              return (
                <div
                  key={column.label}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const leadId = e.dataTransfer.getData('leadId');
                    if (leadId) {
                      handleStatusDrop(Number(leadId), column.label);
                    }
                  }}
                  className="w-72 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/20 border border-border/70 dark:border-slate-800/80 rounded-2xl flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-border/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.bgColor }} />
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[150px]">{column.label}</h4>
                    </div>
                    <span className="text-xs font-bold text-muted bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {columnLeads.length}
                    </span>
                  </div>
                  
                  {/* Scrollable Column Body */}
                  <div className="p-2.5 flex flex-col gap-2 overflow-y-auto no-scrollbar flex-1 min-h-[150px]">
                    {columnLeads.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200/60 dark:border-slate-800/40 rounded-xl py-8 text-center text-xs text-muted flex items-center justify-center">
                        Drag lead here
                      </div>
                    ) : (
                      columnLeads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData('leadId', String(lead.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          <LeadCard
                            lead={lead}
                            statuses={template.statuses}
                            onDelete={handleDelete}
                            compact={true}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3'
            : 'flex flex-col gap-2.5'
          }>
            {filteredLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                statuses={template.statuses}
                onDelete={handleDelete}
                compact={viewMode === 'grid'}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — mobile only */}
      <button
        onClick={() => { setEditLead(null); setShowModal(true); }}
        className="lg:hidden fixed bottom-24 right-5 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-xl shadow-primary/40 flex items-center justify-center active:scale-90 transition z-30"
      >
        <Plus size={24} />
      </button>

      <AddLeadModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditLead(null); }}
        onSave={handleSaveLead}
        template={template}
        editLead={editLead}
      />
    </div>
  );
}
