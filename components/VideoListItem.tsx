import React from 'react';
import type { Video } from '../types';
import { toPersianDigits } from '../utils/helpers';

interface VideoListItemProps {
  video: Video;
  onClick: () => void;
  isActive: boolean;
}

const VideoListItem: React.FC<VideoListItemProps> = ({ video, onClick, isActive }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? 'bg-secondary/20' : 'hover:bg-gray-700/50'}`}
    >
      <div className="relative w-28 h-16 flex-shrink-0">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" className="w-full h-full object-cover rounded-md" />
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
            <i className="fas fa-play-circle text-white text-2xl opacity-80"></i>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-200 line-clamp-2">{video.title}</h4>
         <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>{toPersianDigits(video.viewCount)} بازدید</span>
            <span>•</span>
            <span>{video.uploadDate}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoListItem;
