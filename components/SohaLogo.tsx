import React from 'react';

export const SohaLogo: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-white ${className}`}
    style={{ width: size, height: size }}
  >
    <img src="/logo.png" width={size * 0.7} height={size * 0.7} className="object-contain" alt="سها" />
  </div>
);

export const SohaLogotype: React.FC<{ className?: string; isDark?: boolean }> = ({ className = '', isDark = false }) => (
  <div className={`font-nastaliq whitespace-nowrap ${className}`} style={{ color: '#14b8a6', fontSize: '2rem', lineHeight: 1.4, letterSpacing: '-0.5px' }}>
    سرای هنر و اندیشه
  </div>
);

export const SohaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-white ${className}`}
    style={{ width: size, height: size }}
  >
    <img src="/logo.png" width={size * 0.7} height={size * 0.7} className="object-contain" alt="سها" />
  </div>
);

export const SohaFullLogotype: React.FC<{ className?: string; isDark?: boolean }> = ({ className = '', isDark = false }) => (
  <div className={`font-nastaliq whitespace-nowrap ${className}`} style={{ color: '#14b8a6', fontSize: '2.2rem', lineHeight: 1.4, letterSpacing: '-0.5px' }}>
    سها سیما
  </div>
);
