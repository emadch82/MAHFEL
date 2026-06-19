'use client';

import { useEffect, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          color: '#f1f5f9',
          fontFamily: 'Tahoma, sans-serif',
          padding: 24,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            background: 'radial-gradient(circle at 30% 40%, #10b981 0%, transparent 50%), radial-gradient(circle at 70% 60%, #6366f1 0%, transparent 50%)',
          }} />

          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(239,68,68,0.2)', marginBottom: 28,
              boxShadow: '0 0 60px rgba(239,68,68,0.1)',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>

            <h1 style={{
              fontSize: 56, fontWeight: 900, lineHeight: 1, margin: 0,
              color: '#ef4444',
            }}>خطای بحرانی</h1>

            <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 12, maxWidth: 340, lineHeight: 1.8 }}>
              مشکل غیرمنتظره‌ای رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید.
            </p>

            {error.digest && (
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontFamily: 'monospace', direction: 'ltr' }}>
                {error.digest}
              </p>
            )}

            <button
              onClick={() => reset()}
              style={{
                marginTop: 28, padding: '12px 36px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              بازنشانی
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
