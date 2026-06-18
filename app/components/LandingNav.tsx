'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        backgroundColor: '#003566',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: '#FFC300' }}
          >
            BrainMate
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-white text-sm font-medium hover:text-[#FFC300] transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/register"
              className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
              style={{ backgroundColor: '#FFC300', color: '#003566' }}
            >
              Start Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-0.5 bg-white transition-transform duration-300"
              style={{ transform: open ? 'translateY(8px) rotate(45deg)' : '' }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-opacity duration-300"
              style={{ opacity: open ? 0 : 1 }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-transform duration-300"
              style={{ transform: open ? 'translateY(-8px) rotate(-45deg)' : '' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0' }}
      >
        <div className="px-4 pb-4 flex flex-col gap-4" style={{ backgroundColor: '#002a52' }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white text-base font-medium hover:text-[#FFC300] transition-colors py-1"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="inline-block text-center px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#FFC300', color: '#003566' }}
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
