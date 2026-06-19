'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
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
        position: 'absolute', inset: 0, opacity: 0.08,
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
          width: 120, height: 120, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(16,185,129,0.2)', marginBottom: 32,
          boxShadow: '0 0 60px rgba(16,185,129,0.1)',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 64, fontWeight: 900, lineHeight: 1, margin: 0,
          background: 'linear-gradient(135deg, #10b981, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>۵۰۰</h1>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, color: '#f1f5f9' }}>
          خطای سرور داخلی
        </h2>

        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, maxWidth: 360, lineHeight: 1.8 }}>
          مشکلی در سرور پیش آمده است. نگران نباشید، تیم فنی در حال بررسی هستند.
        </p>

        {error.digest && (
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontFamily: 'monospace', direction: 'ltr' }}>
            Error: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            تلاش مجدد
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 32px',
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            صفحه اصلی
          </button>
        </div>
      </div>
    </div>
  );
}
