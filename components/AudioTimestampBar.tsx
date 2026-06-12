import React, { useState, useEffect } from 'react';
import { formatTime, DEFAULT_COVER } from '../utils/helpers';

interface AudioTimestampBarProps {
  timestamp: number;
  duration?: number;
  currentTime?: number;
  podcastTitle?: string;
  episodeTitle?: string;
  cover?: string;
  onSeek?: (seconds: number) => void;
  compact?: boolean;
  showTimeOnly?: boolean;
}

const AudioTimestampBar: React.FC<AudioTimestampBarProps> = ({
  timestamp, duration, currentTime, podcastTitle, episodeTitle, cover,
  onSeek, compact = false, showTimeOnly = false
}) => {
  const [waveBars] = useState(() =>
    Array.from({ length: 40 }, (_, i) => (Math.sin(i * 0.8) * 0.3 + 0.5 + Math.random() * 0.3))
  );

  const safeDuration = duration && duration > 0 ? duration : 1;
  const progress = Math.min(timestamp / safeDuration, 1);
  const currentProgress = currentTime != null && duration != null && duration > 0
    ? Math.min(currentTime / duration, 1) : 0;
  const isPlaying = currentTime != null && duration != null && duration > 0
    && Math.abs(currentTime - timestamp) < 1.5;

  if (showTimeOnly) {
    return (
      <div className="flex items-center gap-1.5">
        <i className="fas fa-music text-primary text-[9px]"></i>
        <span className="text-[10px] font-mono font-bold text-primary" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>
          {formatTime(timestamp)}
        </span>
      </div>
    );
  }

  return (
    <div dir="ltr" className={`${compact ? '' : 'w-full'} select-none bg-white/[0.03] rounded-xl p-2 pt-1.5 border border-white/5`} style={{ direction: 'ltr' }}>
      {(podcastTitle || episodeTitle) && !compact && (
        <div className="flex items-center gap-1.5 mb-1.5">
          {cover && (
            <img src={cover || DEFAULT_COVER} alt="" className="w-4 h-4 rounded object-cover flex-shrink-0 ring-1 ring-white/10" />
          )}
          <div className="text-[10px] font-medium truncate leading-tight text-gray-400">
            {episodeTitle && <span className="text-white/60">{episodeTitle}</span>}
            {podcastTitle && <span className="mx-1 text-gray-600">·</span>}
            {podcastTitle && <span className="text-gray-500">{podcastTitle}</span>}
          </div>
        </div>
      )}
      <div
        onClick={() => { if (onSeek) onSeek(timestamp); }}
        className="relative cursor-pointer group active:scale-[0.98] transition-transform"
        style={{ height: compact ? '16px' : '22px' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 22" preserveAspectRatio="none">
          {waveBars.map((amp, i) => {
            const barW = 200 / 40;
            const x = i * barW;
            const h = amp * 16;
            const top = 11 - h / 2;
            const barPos = i / 40;
            const isBeforeTimestamp = barPos <= progress;
            const barIsPlayed = isBeforeTimestamp && (!isPlaying || barPos <= currentProgress);
            const barIsFuture = !isBeforeTimestamp;
            const fillColor = barIsPlayed ? '#06b6d4'
              : (isBeforeTimestamp && isPlaying && barPos > currentProgress ? '#06b6d4' : 'rgba(255,255,255,0.12)');
            return (
              <rect key={i}
                x={x} y={top} width={barW * 0.65} height={Math.max(h, 2)}
                rx={barW * 0.15} ry={barW * 0.15}
                fill={fillColor}
                className="transition-colors duration-200"
              />
            );
          })}
          <line x1={progress * 200} y1="0" x2={progress * 200} y2="22"
            stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2,2"
            className="opacity-60" />
          <circle cx={progress * 200} cy="11" r="3" fill="#06b6d4"
            className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </svg>
      </div>
      <div className="flex justify-between items-center mt-0.5" style={{ direction: 'ltr' }}>
        <span className="text-[9px] font-mono font-bold text-primary flex items-center gap-1" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>
          <i className="fas fa-play text-[6px]"></i>
          {formatTime(timestamp)}
        </span>
        {duration != null && duration > 0 && (
          <span className="text-[8px] font-mono text-gray-500" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>
            {formatTime(duration)}
          </span>
        )}
      </div>
    </div>
  );
};

export default AudioTimestampBar;
