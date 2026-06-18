import Link from 'next/link';
import LandingNav from '@/app/components/LandingNav';
import LandingFAQ from '@/app/components/LandingFAQ';

const cobalt = '#003566';
const amber = '#FFC300';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', scrollBehavior: 'smooth' }}>
      <style>{`html { scroll-behavior: smooth; }`}</style>

      <LandingNav />

      {/* ── SECTION 1: HERO ─────────────────────────────────────── */}
      <section
        className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 min-h-screen"
        style={{ backgroundColor: cobalt }}
      >
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl"
          style={{ fontFamily: 'var(--font-playfair)', color: amber }}
        >
          Never lose a lead again.
        </h1>
        <p
          className="mt-6 text-base sm:text-lg max-w-xl leading-relaxed"
          style={{ color: '#ffffff' }}
        >
          BrainMate tracks all your prospects, sends follow-up reminders, and gives you
          real-time sales analytics — all in one place. Built for freelancers and solo
          business owners in India.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/register"
            className="px-7 py-3.5 rounded-full font-bold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: amber, color: cobalt }}
          >
            Start Free — No Card Needed
          </Link>
          <a
            href="#features"
            className="px-7 py-3.5 rounded-full font-semibold text-base border-2 transition-colors hover:bg-[#FFC300] hover:text-[#003566]"
            style={{ borderColor: amber, color: amber }}
          >
            See How It Works
          </a>
        </div>
        <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Free up to 25 leads · No card required · Upgrade anytime
        </p>
      </section>

      {/* ── SECTION 2: PROBLEM ──────────────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-playfair)', color: cobalt }}
          >
            Sound familiar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🗂️',
                title: 'Leads getting lost',
                body: 'A prospect messaged you last Tuesday. You forgot to follow up. They went with someone else.',
              },
              {
                icon: '⏰',
                title: 'Follow-ups forgotten',
                body: 'You meant to call back on Friday. Friday came and went. The deal went cold.',
              },
              {
                icon: '📉',
                title: 'No idea what\'s working',
                body: 'Which leads convert? Which source brings the best clients? You\'re guessing every month.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6 bg-white shadow-sm"
                style={{ borderTop: `4px solid ${cobalt}` }}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: cobalt }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ─────────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: amber }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-14"
            style={{ fontFamily: 'var(--font-playfair)', color: cobalt }}
          >
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create your free account',
                body: 'Sign up with your mobile number. No card, no commitment. Free up to 25 leads.',
              },
              {
                step: '2',
                title: 'Add your leads',
                body: 'Enter your prospects one by one or in bulk. Add notes, status, and expected deal value.',
              },
              {
                step: '3',
                title: 'Let BrainMate remind you',
                body: 'Set a follow-up date. BrainMate alerts you at the right time so no lead ever goes cold.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: cobalt, color: amber }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-bold" style={{ color: cobalt }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: cobalt, opacity: 0.8 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: FEATURES ─────────────────────────────────── */}
      <section id="features" className="py-20 px-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-playfair)', color: cobalt }}
          >
            Your business&apos;s digital brain
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Lead tracking & pipeline',
                body: 'See every prospect in a clear pipeline. Know exactly where each deal stands.',
              },
              {
                icon: '🔔',
                title: 'Follow-up reminders',
                body: 'Never miss a follow-up. BrainMate alerts you before leads go cold.',
              },
              {
                icon: '📊',
                title: 'Sales analytics',
                body: 'Real-time reports on conversions, pipeline value, and your best lead sources.',
              },
              {
                icon: '📱',
                title: 'Works offline',
                body: 'No internet? No problem. BrainMate works completely offline — always in your control.',
              },
              {
                icon: '👤',
                title: 'Built for solo users',
                body: 'No complicated team setup. Just you, your leads, and your numbers.',
              },
              {
                icon: '🔒',
                title: 'Secure & private',
                body: 'Your client data stays with you. OTP login, no third-party sharing.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'rgba(0,53,102,0.05)',
                  borderTop: `4px solid ${amber}`,
                }}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: cobalt }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: PRICING ──────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4" style={{ backgroundColor: cobalt }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center"
            style={{ fontFamily: 'var(--font-playfair)', color: amber }}
          >
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p className="text-center mt-4 text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            No pressure. Use BrainMate free up to 25 leads. Upgrade to Pro only when your
            pipeline grows.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Free */}
            <div className="rounded-2xl p-7 flex flex-col gap-5" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,195,0,0.25)' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Free</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Just getting started</p>
                <p className="text-4xl font-bold mt-3" style={{ color: '#ffffff' }}>₹0</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>forever</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm" style={{ color: '#ffffff' }}>
                {['Up to 25 leads', 'Lead tracking & pipeline', 'Basic status management', 'Manual follow-up notes'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: amber }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-auto text-center py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: amber, color: cobalt }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Monthly — highlighted */}
            <div
              className="rounded-2xl p-7 flex flex-col gap-5 relative"
              style={{ backgroundColor: '#ffffff', border: `2px solid ${cobalt}`, transform: 'scale(1.04)' }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: amber, color: cobalt }}
              >
                Most popular
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(0,53,102,0.5)' }}>Pro Monthly</p>
                <p className="text-sm" style={{ color: 'rgba(0,53,102,0.7)' }}>Serious about your pipeline</p>
                <p className="text-4xl font-bold mt-3" style={{ color: cobalt }}>₹149</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,53,102,0.5)' }}>Per user · Cancel anytime</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm" style={{ color: cobalt }}>
                {['Unlimited leads', 'Follow-up reminders & alerts', 'Full sales analytics', 'Works offline', 'CSV export', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: amber }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-auto text-center py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: cobalt, color: '#ffffff' }}
              >
                Start Pro
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="rounded-2xl p-7 flex flex-col gap-5 relative" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,195,0,0.25)' }}>
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,195,0,0.2)', color: amber, border: `1px solid ${amber}` }}
              >
                Save ₹789
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Pro Yearly</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Best value for committed users</p>
                <p className="text-4xl font-bold mt-3" style={{ color: '#ffffff' }}>₹999</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Just ₹83/month</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm" style={{ color: '#ffffff' }}>
                {['Everything in Pro Monthly', '2 months free', 'Priority support', 'Early access to new features'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: amber }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-auto text-center py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: amber, color: cobalt }}
              >
                Start Pro Yearly
              </Link>
            </div>
          </div>

          <p className="text-center mt-10 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Free plan available forever · No card needed to start · Payments secured by Razorpay
          </p>
        </div>
      </section>

      {/* ── SECTION 6: FAQ ──────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4" style={{ backgroundColor: amber }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-playfair)', color: cobalt }}
          >
            Questions? Answered.
          </h2>
          <LandingFAQ />
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ────────────────────────────────── */}
      <section className="py-24 px-4 text-center" style={{ backgroundColor: cobalt }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: amber }}
          >
            Your next client is one follow-up away.
          </h2>
          <p className="mt-5 text-base" style={{ color: '#ffffff' }}>
            Join freelancers and small business owners across India already closing more
            deals with BrainMate.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 px-8 py-4 rounded-full font-bold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: amber, color: cobalt }}
          >
            Start Free — No Card Needed
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="px-4 py-12" style={{ backgroundColor: cobalt }}>
        <div
          className="max-w-7xl mx-auto"
          style={{ borderTop: '1px solid rgba(255,195,0,0.2)', paddingTop: '2rem' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left */}
            <div>
              <p
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-playfair)', color: amber }}
              >
                BrainMate
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                A product by Meridian Grid
              </p>
            </div>

            {/* Center */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center items-start">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Sign In', href: '/login' },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm hover:text-[#FFC300] transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Right */}
            <div className="flex flex-col gap-1 md:items-end text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <a href="mailto:hello@meridiangrid.in" className="hover:text-[#FFC300] transition-colors">
                hello@meridiangrid.in
              </a>
              <a href="tel:+918000403090" className="hover:text-[#FFC300] transition-colors">
                +91 80004 03090
              </a>
              <a
                href="https://wa.me/918000403090"
                className="font-semibold transition-colors"
                style={{ color: amber }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp ↗
              </a>
            </div>
          </div>

          <div
            className="text-center text-xs"
            style={{ color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,195,0,0.1)', paddingTop: '1.5rem' }}
          >
            © 2026 BrainMate by Meridian Grid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
