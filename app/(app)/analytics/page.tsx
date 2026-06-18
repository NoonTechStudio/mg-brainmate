'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, Target, DollarSign, BarChart2, AlertCircle } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { db, type Lead } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

interface MonthData { month: string; added: number; converted: number; }

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#F97316', '#7C3AED', '#EF4444'];

export default function AnalyticsPage() {
  const { template } = useApp();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const all = await db.leads.orderBy('createdAt').toArray();
    setLeads(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl mt-10 lg:mt-6" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
      </div>
    );
  }

  const wonStatuses = template.statuses
    .filter(s => ['Won','Booked','Deal Closed','Policy Issued','Admission Confirmed','Event Done','Confirmed'].includes(s.label))
    .map(s => s.label);

  const totalLeads = leads.length;
  const converted = leads.filter(l => wonStatuses.includes(l.status)).length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const totalValue = leads.reduce((s, l) => s + (l.estimatedValue || 0), 0);
  const avgValue = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;

  const categoryMap: Record<string, number> = {};
  leads.forEach(l => { categoryMap[l.category] = (categoryMap[l.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const statusMap: Record<string, number> = {};
  leads.forEach(l => { statusMap[l.status] = (statusMap[l.status] || 0) + 1; });
  const statusData = template.statuses.map(s => ({
    name: s.label, count: statusMap[s.label] || 0, fill: s.bgColor,
  })).filter(s => s.count > 0);

  const monthData: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const monthLeads = leads.filter(l => l.createdAt.startsWith(monthStr));
    monthData.push({
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      added: monthLeads.length,
      converted: monthLeads.filter(l => wonStatuses.includes(l.status)).length,
    });
  }

  const sourceMap: Record<string, number> = {};
  leads.forEach(l => { if (l.source) sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const SUMMARY = [
    { label: 'Total Leads',       value: totalLeads,               icon: BarChart2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Conversion Rate',   value: `${conversionRate}%`,     icon: Target,    color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Pipeline',    value: formatCurrency(totalValue),icon: DollarSign,color: 'text-amber-600 bg-amber-50' },
    { label: 'Avg Lead Value',    value: formatCurrency(avgValue),  icon: TrendingUp,color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
          <p className="text-xs text-muted mt-0.5">Business performance overview</p>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-4 lg:space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {SUMMARY.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon size={18} />
                </div>
                <div className="text-2xl font-bold text-slate-800 tabular-nums">{item.value}</div>
                <div className="text-xs text-muted mt-1 font-medium">{item.label}</div>
              </div>
            );
          })}
        </div>

        {totalLeads === 0 ? (
          <div className="bg-surface rounded-2xl p-12 border border-border text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold">No data yet</p>
            <p className="text-muted text-sm mt-1">Add leads to see analytics here.</p>
          </div>
        ) : (
          <>
            {/* Desktop: 2-column layout for charts */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">
              {/* Status Funnel */}
              <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
                <h2 className="font-semibold text-slate-800 mb-4 text-sm">Status Funnel</h2>
                <div className="space-y-2.5">
                  {statusData.map(s => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-24 truncate flex-shrink-0">{s.name}</span>
                      <div className="flex-1 bg-bg rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.max(8, (s.count / totalLeads) * 100)}%`, backgroundColor: s.fill }}
                        >
                          <span className="text-white text-xs font-bold">{s.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart */}
              {categoryData.length > 0 && (
                <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
                  <h2 className="font-semibold text-slate-800 mb-4 text-sm">Leads by Category</h2>
                  <div className="flex items-center">
                    <div className="w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={62} paddingAngle={3}>
                            {categoryData.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [`${v} leads`, '']} contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 pl-4 space-y-2 min-w-0">
                      {categoryData.map((c, idx) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-xs text-slate-600 flex-1 truncate">{c.name}</span>
                          <span className="text-xs font-bold text-slate-800">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Trend — full width */}
            <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm">6-Month Trend</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="added" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} name="Added" />
                  <Line type="monotone" dataKey="converted" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Converted" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Source bar chart */}
            {sourceData.length > 0 && (
              <div className="bg-surface rounded-2xl p-4 lg:p-5 border border-border shadow-sm">
                <h2 className="font-semibold text-slate-800 mb-4 text-sm">Leads by Source</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sourceData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Leads">
                      {sourceData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
