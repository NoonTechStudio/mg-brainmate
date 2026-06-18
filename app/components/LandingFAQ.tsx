'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Is the free plan really free forever?',
    a: 'Yes. Up to 25 leads, completely free, no card needed. Upgrade only when your pipeline outgrows it.',
  },
  {
    q: 'Do I need to download an app?',
    a: "No. BrainMate works in your phone's browser. Open the link and you're in — no install needed.",
  },
  {
    q: 'Does it really work offline?',
    a: 'Yes. You can add leads, update statuses, and add notes without internet. It syncs when you\'re back online.',
  },
  {
    q: 'Can I use BrainMate for my team?',
    a: 'Currently BrainMate is built for solo users. Team features are on the roadmap — stay tuned.',
  },
  {
    q: 'What if I need help getting started?',
    a: 'WhatsApp us at +91 80004 03090. We\'ll walk you through it on a call, no extra charge.',
  },
];

export default function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'rgba(0,53,102,0.08)', border: '1px solid rgba(0,53,102,0.15)' }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-base transition-colors duration-200"
              style={{ color: isOpen ? '#003566' : '#003566', fontFamily: 'var(--font-inter)' }}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span
                className="ml-4 flex-shrink-0 text-xl transition-transform duration-300"
                style={{
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  color: '#003566',
                }}
              >
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? '200px' : '0' }}
            >
              <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#003566', opacity: 0.8 }}>
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
