'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, EyeOff, LogIn, UserCircle, ClipboardList, Calendar, BarChart2, Wifi } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { getSetting } from '@/lib/db';

const DEMO_EMAIL    = 'demo@brainmate.com';
const DEMO_PASSWORD = 'demo123';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user = { name: 'Demo User', email, role: 'Admin', isDemo: true };
      setUser(user);
      const industry = await getSetting('industry');
      showToast('Welcome back!', 'success');
      router.replace(industry ? '/dashboard' : '/onboarding');
    } else if (email && password.length >= 6) {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setUser({ name, email, role: 'Admin', isDemo: false });
      const industry = await getSetting('industry');
      showToast('Welcome to BrainMate!', 'success');
      router.replace(industry ? '/dashboard' : '/onboarding');
    } else {
      showToast('Invalid credentials. Try demo@brainmate.com / demo123', 'error');
    }
    setLoading(false);
  };

  const handleGuest = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setUser({ name: 'Guest User', email: 'guest@brainmate.com', role: 'Admin', isDemo: false });
    const industry = await getSetting('industry');
    router.replace(industry ? '/dashboard' : '/onboarding');
    setLoading(false);
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-border bg-bg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm';

  const FEATURES = [
    { icon: ClipboardList, text: 'Track all leads' },
    { icon: Calendar,      text: 'Follow-up reminders' },
    { icon: BarChart2,     text: 'Sales analytics' },
    { icon: Wifi,          text: 'Works offline' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left panel — hero (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Brain size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">BrainMate</h1>
          <p className="text-indigo-200 text-lg mb-8">Your Business&apos;s Digital Brain</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-left">
                  <Icon size={18} className="text-indigo-200 flex-shrink-0" />
                  <span className="text-sm font-medium text-white">{f.text}</span>
                </div>
              );
            })}
          </div>
          <p className="text-indigo-300/70 text-xs mt-8">Replace paper notepads, WhatsApp lists & Excel sheets</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col lg:justify-center">
        {/* Mobile header */}
        <div className="lg:hidden bg-gradient-to-br from-primary to-primary-dark px-5 pt-14 pb-20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl mb-3">
              <Brain size={30} className="text-primary" />
            </div>
            <h1 className="text-white font-bold text-2xl tracking-tight">BrainMate</h1>
            <p className="text-white/75 text-sm mt-1">Your Business&apos;s Digital Brain</p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 px-5 lg:px-12 xl:px-16 -mt-6 lg:mt-0 pb-8 lg:pb-0">
          <div className="bg-surface rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent p-6 lg:p-0 lg:max-w-sm lg:mx-auto">
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-muted text-sm mt-1">Sign in to manage your leads</p>
            </div>
            <div className="lg:hidden mb-1">
              <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-muted text-sm">Sign in to manage your leads</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="demo@brainmate.com" className={inputCls} autoComplete="email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="demo123" className={inputCls + ' pr-12'} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-600 transition w-8 h-8 flex items-center justify-center">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-primary/20 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted text-xs font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button onClick={handleGuest} disabled={loading}
              className="w-full h-12 border-2 border-border text-slate-700 font-semibold rounded-xl active:scale-95 transition hover:border-primary hover:text-primary disabled:opacity-60 flex items-center justify-center gap-2">
              <UserCircle size={16} /> Continue as Guest
            </button>

            <p className="text-center text-xs text-muted mt-4">
              By continuing you agree to BrainMate&apos;s{' '}
              <span className="text-primary font-medium cursor-pointer hover:underline">Terms of Service</span>
            </p>
          </div>

          {/* Mobile features */}
          <div className="lg:hidden mt-6 grid grid-cols-2 gap-3 pb-8">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2.5 border border-border">
                  <Icon size={15} className="text-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
