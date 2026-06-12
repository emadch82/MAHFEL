import React from 'react';
import { toPersianDigits } from '../utils/helpers';

interface TimestampThumbnailProps {
  videoId: string;
  timestamp: number;
  alt: string;
  className?: string;
  poster?: string;
}

const TimestampThumbnail: React.FC<TimestampThumbnailProps> = ({ timestamp, alt, className = '', poster }) => {
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return toPersianDigits(`${m}:${String(s).padStart(2, '0')}`);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {poster ? (
        <img src={poster} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a2e' }} />
      )}
      {timestamp > 0 && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
          {fmt(timestamp)}
        </div>
      )}
    </div>
  );
};

export default TimestampThumbnail;
