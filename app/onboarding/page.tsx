'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowLeft, Rocket, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { templateList, getTemplate } from '@/lib/industryTemplates';
import { setSetting } from '@/lib/db'

export default function OnboardingPage() {
  const router = useRouter();
  const { setIndustryId, setBusinessName, showToast } = useApp();
  const [step, setStep]       = useState<'industry' | 'name'>('industry');
  const [selected, setSelected] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSelectIndustry = (id: string) => {
    setSelected(id);
    setTimeout(() => setStep('name'), 200);
  };

  const handleFinish = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const industryId = selected || 'other';
      await setSetting('industry', industryId);
      await setSetting('businessName', name.trim());
      setIndustryId(industryId);
      setBusinessName(name.trim());
      showToast(`Welcome to BrainMate, ${name.trim()}!`, 'success');
      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      showToast('Setup failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left decorative panel (desktop) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-gradient-to-br from-primary to-primary-dark flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Brain size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">BrainMate</h1>
          <p className="text-indigo-200 text-lg mb-8">Your Business&apos;s Digital Brain</p>
          <div className="space-y-3 text-left">
            {['Industry-specific lead tracking','Smart follow-up reminders','Sales analytics & insights','Works offline, stores locally'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 size={16} className="text-emerald-300 flex-shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right main panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark lg:bg-none lg:bg-transparent px-5 lg:px-10 pt-12 lg:pt-10 pb-8 lg:pb-6 relative overflow-hidden lg:overflow-visible">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 lg:hidden" />
          <div className="flex items-center gap-3 relative z-10 lg:border-b lg:border-border lg:pb-5">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Brain size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-white lg:text-slate-800 font-bold text-lg">BrainMate Setup</h1>
              <p className="text-white/70 lg:text-muted text-xs">Step {step === 'industry' ? 1 : 2} of 2</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/20 lg:bg-slate-200 rounded-full relative z-10 lg:mt-4">
            <div className="h-full bg-white lg:bg-primary rounded-full transition-all duration-500"
              style={{ width: step === 'industry' ? '50%' : '100%' }} />
          </div>
        </div>

        <div className="flex-1 px-5 lg:px-10 xl:px-16 py-6">
          {step === 'industry' && (
            <div className="animate-fade-in max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">What&apos;s your business?</h2>
              <p className="text-muted text-sm mb-6">We&apos;ll set up BrainMate perfectly for you.</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {templateList.map(template => (
                  <button key={template.id} onClick={() => handleSelectIndustry(template.id)}
                    className={`flex flex-col items-center gap-2 p-4 lg:p-5 rounded-2xl border-2 transition active:scale-95 ${
                      selected === template.id ? 'border-primary bg-primary-light' : 'border-border bg-surface hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    <span className="text-3xl lg:text-4xl">{template.icon}</span>
                    <div className="text-center">
                      <div className="font-semibold text-slate-800 text-sm">{template.name}</div>
                      <div className="text-xs text-muted mt-0.5 hidden lg:block">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'name' && (
            <div className="animate-fade-in max-w-md">
              <button onClick={() => setStep('industry')} className="mb-5 text-muted text-sm flex items-center gap-1 hover:text-slate-700 transition">
                <ArrowLeft size={14} /> Back
              </button>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">{getTemplate(selected).icon}</div>
                <h2 className="text-2xl font-bold text-slate-800">{getTemplate(selected).name}</h2>
                <p className="text-muted text-sm mt-1">What&apos;s your business called?</p>
              </div>

              <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Business Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={`e.g., Ahmed Travels, ${getTemplate(selected).name} Pro`}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-bg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleFinish()}
                />
                <p className="text-xs text-muted mt-2">This appears on your dashboard and reports.</p>
              </div>

              <div className="mt-4 flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">You&apos;re all set!</span> Your dashboard is ready — start adding leads right away.
                </p>
              </div>

              <button onClick={handleFinish} disabled={!name.trim() || loading}
                className="w-full h-14 mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-base rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Rocket size={18} />
                {loading ? 'Setting up...' : "Let's Go!"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
