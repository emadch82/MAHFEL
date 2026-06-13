
import React from 'react';
import type { Video } from '../types';
import { toPersianDigits, formatTime } from '../utils/helpers';

interface VideoMiniPlayerProps {
  video: Video;
  currentTime: number;
  isVisible: boolean;
  onExpand: () => void;
  onClose: () => void;
}

const VideoMiniPlayer: React.FC<VideoMiniPlayerProps> = ({
  video,
  currentTime,
  isVisible,
  onExpand,
  onClose,
}) => {
  return (
    <div
      className={`fixed bottom-20 left-2.5 right-2.5 lg:left-auto lg:right-6 lg:w-[28rem] bg-black rounded-xl shadow-2xl z-[900] transition-all duration-300 ease-out border border-white/10 overflow-hidden ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none'}`}
    >
      <div className="relative flex items-center gap-2.5 p-2 lg:gap-2.5 lg:p-3 cursor-pointer" onClick={onExpand}>
        <div className="relative w-20 h-12 lg:w-36 lg:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <i className="fas fa-play text-white text-[9px] lg:text-xs mr-[-1px]" />
            </div>
          </div>
          {currentTime > 0 && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] lg:text-[10px] font-bold text-white bg-black/70 backdrop-blur-sm">
              {toPersianDigits(formatTime(currentTime))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs lg:text-sm font-bold text-white truncate">{video.title}</p>
          <p className="text-[10px] lg:text-xs text-white/50 truncate">{toPersianDigits(video.viewCount)} بازدید</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
        >
          <i className="fas fa-times text-xs" />
        </button>
      </div>
    </div>
  );
};

export default VideoMiniPlayer;
