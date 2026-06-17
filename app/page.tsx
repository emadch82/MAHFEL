'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #334155',
        borderTop: '4px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ marginTop: 16, fontSize: 14, color: '#94a3b8' }}>در حال بارگذاری...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Home() {
  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0f172a',
          color: '#f1f5f9',
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #334155',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ marginTop: 16, fontSize: 14, color: '#94a3b8' }}>در حال بارگذاری...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <App />
    </Suspense>
  );
}
