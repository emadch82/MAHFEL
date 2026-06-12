import React, { useEffect, useState } from 'react';

const IranAccessWarning: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const lang = navigator.language || (navigator as any).languages?.[0] || '';
        const offset = new Date().getTimezoneOffset();
        const isIran = tz.includes('Tehran') || tz.includes('Iran') || lang.startsWith('fa') || offset === -210;

        const params = new URLSearchParams(window.location.search);
        const testIp = params.get('ip');
        const url = testIp ? `/api/check-ip?ip=${encodeURIComponent(testIp)}` : '/api/check-ip';

        const resp = await fetch(url);
        const data = await resp.json();

        if (data.local) {
          if (!isIran && !cancelled) setShow(true);
        } else {
          if (!cancelled && data.countryCode !== 'IR') setShow(true);
        }
      } catch {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const lang = navigator.language || '';
        const isIran = tz.includes('Tehran') || tz.includes('Iran') || lang.startsWith('fa');
        if (!isIran) setShow(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{ direction: 'rtl' }}>
      <div className="bg-gray-900 border border-red-500/30 rounded-3xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
        </div>
        <h2 className="text-lg font-black text-white mb-3">هشدار دسترسی</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          به نظر می‌رسد از خارج از ایران به این سایت متصل شده‌اید. دسترسی به برخی از محتوای این سایت ممکن است محدود باشد.
        </p>
        <button onClick={() => setShow(false)}
          className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all active:scale-95 border border-red-500/20">
          متوجه شدم
        </button>
      </div>
    </div>
  );
};

export default IranAccessWarning;
