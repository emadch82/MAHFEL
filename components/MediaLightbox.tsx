import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const ImageLightbox: React.FC<{
    src: string;
    onClose: () => void;
    text?: string;
    author?: string;
    authorAvatar?: string;
    time?: string;
    onReply?: (text: string) => void;
    onAttachMedia?: () => void;
}> = ({ src, onClose, text, author, authorAvatar, time, onReply, onAttachMedia }) => {
    const [replyText, setReplyText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        window.dispatchEvent(new CustomEvent('lightbox-change', { detail: { open: true } }));
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
            window.dispatchEvent(new CustomEvent('lightbox-change', { detail: { open: false } }));
        };
    }, [onClose]);

    useEffect(() => {
        if (onReply) inputRef.current?.focus();
    }, [onReply]);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply?.(replyText.trim());
        setReplyText('');
    };

    const colorSeed = author ? author.charCodeAt(0) * 37 : 0;
    const hue = colorSeed % 360;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col animate-fadeIn" style={{ background: '#000' }}>
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 w-full shrink-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)' }}>
                <button onClick={onClose}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all duration-200 hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ring-2 ring-white/20" style={{ background: `hsl(${hue}, 55%, 45%)` }}>
                        {authorAvatar ? <img src={authorAvatar} className="w-full h-full rounded-full object-cover" alt="" /> : author?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                        {author && <p className="text-white text-sm sm:text-base font-bold truncate">{author}</p>}
                        {time && <p className="text-white/40 text-[10px] sm:text-[11px]">{time}</p>}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 p-0 sm:p-1">
                <img src={src} alt="" className="max-w-full max-h-full w-full h-full object-contain select-none rounded-2xl" draggable={false}
                    style={{ maxWidth: '100vw', maxHeight: '100vh' }} />
            </div>
            {text && (
                <div className="w-full shrink-0" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }}>
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-8">
                        <p className="text-[13px] sm:text-sm leading-[1.8] text-center whitespace-pre-wrap break-words max-h-24 overflow-y-auto" style={{ color: '#e0e0e0' }}>{text}</p>
                    </div>
                </div>
            )}
            {onReply && (
                <form onSubmit={handleSendReply} className="shrink-0 px-3 sm:px-4 py-3" style={{ background: 'rgba(0,0,0,0.9)' }}>
                    <div className="flex items-end gap-2 max-w-2xl mx-auto">
                        <button type="button" onClick={onAttachMedia} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-all hover:bg-white/10" style={{ color: '#999', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <div className="flex-1 min-w-0 rounded-xl overflow-hidden transition-all duration-200" style={{ border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                            <input ref={inputRef} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="پیام..." className="w-full bg-transparent outline-none px-3.5 py-2.5 text-[13px] font-medium" style={{ color: '#e0e0e0', direction: 'rtl' }} />
                        </div>
                        <button type="submit" disabled={!replyText.trim()} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-all disabled:opacity-30" style={{ background: replyText.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: replyText.trim() ? '#fff' : '#555', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </form>
            )}
        </div>,
        document.body
    );
};

export const VideoLightbox: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        window.dispatchEvent(new CustomEvent('lightbox-change', { detail: { open: true } }));
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
            window.dispatchEvent(new CustomEvent('lightbox-change', { detail: { open: false } }));
        };
    }, [onClose]);

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isAparat = url.includes('aparat.com');

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col animate-fadeIn" style={{ background: '#000' }}>
            <button onClick={onClose}
                className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <i className="fas fa-times text-lg"></i>
            </button>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[900px] aspect-video rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    {isYouTube ? (
                        <iframe src={url.includes('embed') ? url : url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" frameBorder="0" />
                    ) : isAparat ? (
                        <iframe src={`https://www.aparat.com/embed/video/${url.split('/').pop()?.split('?')[0] || url}?referer=none`}
                            className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" frameBorder="0" />
                    ) : (
                        <video src={url} controls autoPlay className="w-full h-full" style={{ background: '#000' }} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export const MediaPreviewBar: React.FC<{ media: { type: string; url: string }[] }> = ({ media }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [vidUrl, setVidUrl] = useState<string | null>(null);

    return (
        <>
            <div className="flex flex-col gap-2 mt-2">
                {media.map((m, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden mx-auto" style={{ border: '1px solid var(--border)' }}>
                        {m.type === 'image' ? (
                            <img src={m.url} className="w-full max-h-[360px] object-contain cursor-pointer" alt="" onClick={() => setImgSrc(m.url)} />
                        ) : m.type === 'audio' ? (
                            <div className="p-2"><audio src={m.url} controls className="w-full h-8" style={{ direction: 'ltr' }} /></div>
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center" style={{ background: 'var(--surface-3)' }}>
                                <i className="fas fa-play text-white text-xs"></i>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {imgSrc && <ImageLightbox src={imgSrc} onClose={() => setImgSrc(null)} />}
            {vidUrl && <VideoLightbox url={vidUrl} onClose={() => setVidUrl(null)} />}
        </>
    );
};
