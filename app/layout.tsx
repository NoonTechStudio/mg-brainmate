import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/Toast';
import ServiceWorkerRegistrar from './components/ServiceWorkerRegistrar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrainMate – Your Business\'s Digital Brain',
  description: 'Universal lead and inquiry management system for small businesses.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BrainMate',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'BrainMate',
    description: 'Your Business\'s Digital Brain',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full antialiased">
        <AppProvider>
          {children}
          <ToastContainer />
          <ServiceWorkerRegistrar />
        </AppProvider>
      </body>
    </html>
  );
}
