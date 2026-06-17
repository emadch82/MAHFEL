export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#0f172a',
      color: '#f1f5f9',
      zIndex: 99999,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #334155',
        borderTop: '4px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ marginTop: 16, fontSize: 14, color: '#94a3b8', fontFamily: 'Tahoma, sans-serif' }}>
        در حال بارگذاری...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
