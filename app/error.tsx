'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--surface)',
      color: 'var(--text)',
      fontFamily: 'var(--font-vazir), Tahoma, sans-serif',
      padding: 24,
      textAlign: 'center',
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 16 }}>خطایی رخ داد</h2>
      <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8, maxWidth: 400 }}>
        متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
      </p>
      {error.digest && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
          کد خطا: {error.digest}
        </p>
      )}
      <button
        onClick={() => reset()}
        style={{
          marginTop: 24,
          padding: '10px 24px',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        تلاش مجدد
      </button>
    </div>
  );
}
