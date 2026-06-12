
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toPersianDigits } from '../utils/helpers';

export interface AudioPlayerHandle {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
}

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  onAudioRef?: (el: HTMLAudioElement | null) => void;
  compact?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${toPersianDigits(m)}:${toPersianDigits(String(s).padStart(2, '0'))}`;
}

const SAMPLE_COUNT = 50;

const waveformData: number[] = Array.from({ length: SAMPLE_COUNT }, () => Math.random());

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ src, onTimeUpdate, onAudioRef, compact = false }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
    },
    getCurrentTime: () => audioRef.current?.currentTime || 0,
  }));

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    onAudioRef?.(audioRef.current);
    return () => onAudioRef?.(null);
  }, [audioRef.current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setDuration(audio.duration);
      onTimeUpdateRef.current?.(audio.currentTime);
    };
    const onMeta = () => { if (audio) setDuration(audio.duration); };
    const onEnd = () => setPlaying(false);
    const onPlay = () => {
      setPlaying(true);
      document.querySelectorAll('audio').forEach(el => { if (el !== audio) el.pause(); });
    };
    const onPause = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(x * duration, duration));
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const buildWavePath = (width: number, height: number, fillProgress: number) => {
    const barW = width / SAMPLE_COUNT;
    const mid = height / 2;
    let played = '';
    let remaining = '';

    waveformData.forEach((amp, i) => {
      const x = i * barW;
      const h = amp * height * 0.8;
      const top = mid - h / 2;
      const bot = mid + h / 2;
      const xEnd = x + barW * 0.7;
      const isPlayed = (i / SAMPLE_COUNT) * 100 <= fillProgress;

      if (i === 0) {
        played += `M${x},${mid}`;
        remaining += `M${x},${mid}`;
      }
      const path = isPlayed ? played : remaining;
      if (isPlayed) {
        played += ` L${x},${top} L${xEnd},${top} L${xEnd},${bot} L${x},${bot} Z`;
      } else {
        remaining += ` L${x},${top} L${xEnd},${top} L${xEnd},${bot} L${x},${bot} Z`;
      }
    });

    return { played, remaining };
  };

  return (
    <div dir="ltr" className={`rounded-xl overflow-hidden select-none`}
      style={{
        background: compact ? 'var(--surface-2)' : 'var(--surface)',
        border: '1px solid var(--border)',
        direction: 'ltr',
      }}>
      <audio ref={audioRef} src={src} preload="metadata"
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />

      <div className={`flex items-center gap-2 ${compact ? 'p-2' : 'p-3'}`}>
        <button onClick={togglePlay}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={{
            background: playing ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--primary)',
            color: playing ? 'var(--primary)' : 'white',
          }}>
          <i className={`fas ${playing ? 'fa-pause' : 'fa-play'} text-[10px]`}
            style={{ marginRight: playing ? 0 : '1.5px' }}></i>
        </button>

        <div ref={progressRef} onClick={handleProgressClick}
          className="flex-1 cursor-pointer"
          style={{ height: compact ? '28px' : '36px' }}>
          <svg width="100%" height="100%" viewBox={`0 0 200 40`} preserveAspectRatio="none">
            {/* Remaining (unplayed) waveform */}
            {waveformData.map((amp, i) => {
              const barW = 200 / SAMPLE_COUNT;
              const x = i * barW;
              const h = amp * 32;
              const top = 20 - h / 2;
              const isPlayed = (i / SAMPLE_COUNT) * 100 <= progress;
              return (
                <rect key={i}
                  x={x} y={top} width={barW * 0.7} height={h}
                  rx={barW * 0.2} ry={barW * 0.2}
                  fill={isPlayed ? 'var(--primary)' : 'color-mix(in srgb, var(--text-3) 25%, transparent)'}
                  style={{ transition: 'fill 0.15s' }}
                />
              );
            })}
          </svg>
        </div>

        <span className="text-[10px] font-mono font-bold flex-shrink-0 tabular-nums"
          style={{ color: 'var(--text-3)', direction: 'ltr', minWidth: '42px', textAlign: 'center' }}>
          {formatTime(duration > 0 ? duration - currentTime : 0)}
        </span>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
export default AudioPlayer;
