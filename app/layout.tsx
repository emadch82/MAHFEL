import './globals.css';
import { Vazirmatn } from 'next/font/google';
import localFont from 'next/font/local';
import ExternalScripts from '../components/ExternalScripts';
import StructuredData from '../components/StructuredData';
import type { Metadata, Viewport } from 'next';

const vazir = Vazirmatn({
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-vazir',
  display: 'swap',
});

const iranNastaliq = localFont({
  src: [
    { path: '../fonts/IranNastaliq.woff2' },
    { path: '../fonts/IranNastaliq.ttf' },
  ],
  variable: '--font-nastaliq',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'سرای هنر و اندیشه',
    template: '%s | سرای هنر و اندیشه',
  },
  description: 'پلتفرم پادکست، کتاب و ویدیو - سرای هنر و اندیشه',
  keywords: ['پادکست', 'کتاب', 'ویدیو', 'سرای هنر و اندیشه', 'آموزش', 'فلسفه', 'عرفان'],
  authors: [{ name: 'سرای هنر و اندیشه' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'سرای هنر و اندیشه',
    description: 'پلتفرم پادکست، کتاب و ویدیو',
    type: 'website',
    locale: 'fa_IR',
    siteName: 'سرای هنر و اندیشه',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سرای هنر و اندیشه',
    description: 'پلتفرم پادکست، کتاب و ویدیو',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'سرای هنر و اندیشه',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${iranNastaliq.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/font-awesome/all.min.css" />
      </head>
      <body suppressHydrationWarning>
        <StructuredData />
        <ExternalScripts />
        {children}
      </body>
    </html>
  );
}
