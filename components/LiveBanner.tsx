import React from 'react';

interface LiveBannerProps {
  title: string;
  url: string;
  onDismiss: () => void;
}

const LiveBanner: React.FC<LiveBannerProps> = ({ title, url, onDismiss }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-3 flex items-center gap-4 animate-slideInDown border border-white/10">
      <div className="flex-shrink-0 flex flex-col items-center">
         <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400/80 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        <span className="text-xs font-bold mt-1 tracking-widest">زنده</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs opacity-80">هم اکنون به صورت زنده درحال برگزاری است</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="bg-white/90 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-full flex-shrink-0 active:scale-95 transition-transform">
        مشاهده
      </a>
      <button onClick={onDismiss} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default LiveBanner;
