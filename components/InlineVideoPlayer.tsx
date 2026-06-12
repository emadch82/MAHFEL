
import React from 'react';
import type { Video } from '../types';

interface InlineVideoPlayerProps {
  video: Video;
  mode: 'inline' | 'minimized' | 'standalone';
  activeTab: 'videos' | string;
  isHeaderVisible: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
  onExitStandalone: () => void;
}

const InlineVideoPlayer: React.FC<InlineVideoPlayerProps> = ({
  video,
  mode,
  activeTab,
  isHeaderVisible,
  onMinimize,
  onExpand,
  onClose,
  onExitStandalone,
}) => {
  const embedUrl = `https://www.aparat.com/video/video/embed/videohash/${video.embedId}/vt/frame?autoplay=true&recom=none&titleShow=false`;
  const isForVideoPage = activeTab === 'videos';
  const topPosition = isHeaderVisible ? '73px' : '0px';

  // Standalone is a special overlay
  if (mode === 'standalone') {
    return (
        <div className="fixed inset-0 bg-black/95 z-[1500] flex items-center justify-center p-4 animate-fadeIn backdrop-blur-xl" onClick={onExitStandalone}>
            <div className="w-full max-w-5xl aspect-video relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <iframe key={`standalone-${video.id}`} src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen={true} className="w-full h-full" frameBorder="0" />
                 <button onClick={onExitStandalone} className="absolute top-4 left-4 z-30 bg-white/10 hover:bg-white/20 border-none w-10 h-10 rounded-full text-white cursor-pointer backdrop-blur-md transition-all flex items-center justify-center">
                    <i className="fas fa-compress"></i>
                </button>
            </div>
        </div>
    );
  }

  // Persisted Player Container
  // We use CSS for transitions so the iframe is NEVER unmounted during minimize/expand
  const isMinimized = mode === 'minimized';
  
  return (
    <div 
        className={`fixed z-[950] transition-all duration-500 ease-in-out shadow-2xl overflow-hidden ${
            isMinimized 
            ? "bottom-20 left-4 right-4 h-20 bg-secondary rounded-2xl border border-white/20" 
            : (isForVideoPage ? "top-0 left-0 right-0 aspect-video" : `left-0 right-0 aspect-video border-b border-border-color`)
        }`}
        style={!isMinimized && !isForVideoPage ? { top: topPosition } : {}}
    >
        <div className="relative w-full h-full flex items-center">
            {/* The Video Engine - Always Running */}
            <div className={`transition-all duration-500 ease-in-out h-full ${isMinimized ? 'w-32' : 'w-full'}`}>
                <iframe 
                    key={`engine-${video.id}`}
                    src={embedUrl} 
                    title={video.title} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen={true} 
                    className="w-full h-full" 
                    frameBorder="0" 
                />
            </div>

            {/* Minimized UI Overlay */}
            {isMinimized && (
                <div className="flex-1 flex items-center justify-between px-4 animate-fadeIn" onClick={onExpand}>
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-black text-white truncate">{video.title}</p>
                        <p className="text-[10px] text-white/70 font-bold">در حال پخش...</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"><i className="fas fa-expand-alt"></i></button>
                        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"><i className="fas fa-times"></i></button>
                    </div>
                </div>
            )}

            {/* Inline Close/Minimize Button */}
            {!isMinimized && (
                <button 
                    onClick={onMinimize} 
                    className="absolute top-3 left-3 z-[1001] bg-black/40 hover:bg-black/60 w-9 h-9 rounded-full text-white backdrop-blur-md transition-all flex items-center justify-center"
                >
                    <i className="fas fa-chevron-down"></i>
                </button>
            )}
        </div>
    </div>
  );
};

export default InlineVideoPlayer;
