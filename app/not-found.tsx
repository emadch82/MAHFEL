import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>۴۰۴</h1>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>صفحه یافت نشد</h2>
      <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>
        صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.
      </p>
      <Link
        href="/"
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
          textDecoration: 'none',
        }}
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
