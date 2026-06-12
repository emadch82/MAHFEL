
import React, { useMemo, useState } from 'react';
import type { Video, Podcast, Author, User } from '../types';
import { toPersianDigits, formatTime, DEFAULT_COVER } from '../utils/helpers';

interface LibraryPageProps {
  savedVideoIds: string[];
  allVideos: Video[];
  onPlayVideo: (video: Video) => void;
  onRemoveVideo: (id: string) => void;
  savedPodcastIds?: string[];
  savedEpisodes?: { podcastId: string; episodeIndex: number }[];
  allPodcasts?: Podcast[];
  authors?: Author[];
  onPlayPodcast?: (podcast: Podcast, episodeIndex: number) => void;
  onSelectPodcast?: (podcast: Podcast) => void;
  onRemovePodcast?: (podcast: Podcast) => void;
  onRemoveEpisode?: (podcastId: string, episodeIndex: number) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  user?: User | null;
  onOpenProfile?: () => void;
  onOpenSearch?: () => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ savedVideoIds, allVideos, onPlayVideo, onRemoveVideo, savedPodcastIds = [], savedEpisodes = [], allPodcasts = [], authors = [], onPlayPodcast, onSelectPodcast, onRemovePodcast, onRemoveEpisode, theme, onToggleTheme, user, onOpenProfile, onOpenSearch }) => {
  const savedVideos = useMemo(() =>
    allVideos.filter(v => savedVideoIds.some(id => String(id) === String(v.id) || String(id) === String((v as any)._id))),
    [allVideos, savedVideoIds]
  );

  const savedPodcasts = useMemo(() =>
    allPodcasts.filter(p => savedPodcastIds.includes(String(p.id || (p as any)._id))),
    [allPodcasts, savedPodcastIds]
  );

  const savedEpisodeItems = useMemo(() => {
    return savedEpisodes.map(se => {
      const podcast = allPodcasts.find(p => String(p.id || (p as any)._id) === String(se.podcastId));
      if (!podcast || !podcast.episodes[se.episodeIndex]) return null;
      return { podcast, episode: podcast.episodes[se.episodeIndex], episodeIndex: se.episodeIndex, podcastId: se.podcastId };
    }).filter(Boolean) as { podcast: Podcast; episode: any; episodeIndex: number; podcastId: string }[];
  }, [savedEpisodes, allPodcasts]);

  const [searchQuery, setSearchQuery] = useState('');

  const totalSaved = savedVideos.length + savedPodcasts.length + savedEpisodeItems.length;

  const q = searchQuery.trim().toLowerCase();
  const filteredPodcasts = useMemo(() =>
    q ? savedPodcasts.filter(p => p.title.toLowerCase().includes(q)) : savedPodcasts,
    [savedPodcasts, q]
  );
  const filteredEpisodes = useMemo(() =>
    q ? savedEpisodeItems.filter(item => item.episode.title.toLowerCase().includes(q) || item.podcast.title.toLowerCase().includes(q)) : savedEpisodeItems,
    [savedEpisodeItems, q]
  );
  const filteredVideos = useMemo(() =>
    q ? savedVideos.filter(v => v.title.toLowerCase().includes(q)) : savedVideos,
    [savedVideos, q]
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 pt-5 pb-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}>
            <i className="fas fa-bookmark text-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-extrabold" style={{ color: 'var(--text)' }}>کتابخانه من</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
              {toPersianDigits(totalSaved)} مورد ذخیره شده
            </p>
          </div>
        </div>
        <div className="relative flex-1">
          <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-3)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو در کتابخانه..." className="w-full pr-10 pl-4 py-2 rounded-xl text-[10px] sm:text-sm font-bold outline-none transition-all focus:ring-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'color-mix(in srgb, var(--primary) 30%, transparent)' } as any} />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2"><i className="fas fa-times text-[9px]" style={{ color: 'var(--text-3)' }} /></button>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onToggleTheme && (
            <button onClick={onToggleTheme} className="p-2.5 rounded-xl transition-all duration-300 active:scale-90" title="تغییر تم" style={{ color: 'var(--text-2)' }}>
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-[14px]`}></i>
            </button>
          )}
          {onOpenProfile && (
            <button onClick={onOpenProfile} className="rounded-xl transition-all duration-300 active:scale-90">
              {user?.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-xl border-2 object-cover" style={{ borderColor: 'var(--primary)' }} alt="profile" />
              ) : (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }}>
                  <i className="fas fa-user text-sm" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {totalSaved === 0 ? (
        <div className="text-center py-24 px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent), color-mix(in srgb, var(--secondary) 5%, transparent))' }}>
            <i className="fas fa-bookmark text-4xl" style={{ color: 'var(--text-3)', opacity: 0.3 }} />
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-3)' }}>هنوز چیزی ذخیره نکردی</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)', opacity: 0.7 }}>
            روی آیکون بوکمارک در صفحه ویدیو یا پادکست کلیک کن تا ذخیره بشه
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-6">

          {/* Saved Podcasts */}
          {filteredPodcasts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1 mt-3">
                <i className="fas fa-layer-group text-xs" style={{ color: 'var(--primary)' }}></i>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>پلی‌لیست‌ها ({toPersianDigits(filteredPodcasts.length)})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPodcasts.map((p) => {
                  const author = authors.find(a => String(a.id) === String(p.speakerId));
                  return (
                    <div key={String(p.id) || String((p as any)._id)}
                      className="group relative flex gap-3 p-3 rounded-2xl transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => onSelectPodcast?.(p)}>
                        <img src={String(p.cover || DEFAULT_COVER)} alt={String(p.title)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ top: '38px' }}>
                          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 scale-75 group-hover:scale-100 transition-transform shadow-2xl">
                            <i className="fas fa-play text-white text-[10px] mr-[-1px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black w-fit mb-1"
                          style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                          <i className="fas fa-layer-group text-[7px]"></i>
                          پلی‌لیست
                        </span>
                        <h4 className="text-[13px] font-bold line-clamp-2 leading-relaxed group-hover:text-primary-400 transition-colors cursor-pointer min-w-0"
                          style={{ color: 'var(--text)' }}
                          onClick={() => onSelectPodcast?.(p)}>{String(p.title)}</h4>
                        {author && <p className="text-[10px] mb-1" style={{ color: 'var(--text-3)' }}>{String(author.name)}</p>}
                        <div className="flex items-center justify-between">
                          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                            {toPersianDigits(p.episodes.length)} جلسه
                          </p>
                          <button onClick={() => onRemovePodcast?.(p)}
                            className="flex items-center gap-1 text-[9px] font-bold transition-all hover:scale-105 active:scale-95"
                            style={{ color: 'var(--text-3)' }}>
                            <i className="fas fa-bookmark text-[9px]" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Episodes */}
          {savedEpisodeItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1 mt-3">
                <i className="fas fa-headphones text-xs" style={{ color: '#f59e0b' }}></i>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>صوت‌ها ({toPersianDigits(savedEpisodeItems.length)})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedEpisodeItems.map((item, i) => {
                  const author = authors.find(a => String(a.id) === String(item.podcast.speakerId));
                  return (
                    <div key={`${item.podcastId}-${item.episodeIndex}`}
                      className="group relative flex gap-3 p-3 rounded-2xl transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                      style={{ background: 'color-mix(in srgb, #f59e0b 4%, var(--surface-2))', border: '1px solid color-mix(in srgb, #f59e0b 12%, var(--border))' }}>
                      <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => onPlayPodcast?.(item.podcast, item.episodeIndex)}>
                        <img src={String(item.episode.cover || item.podcast.cover || DEFAULT_COVER)} alt={String(item.episode.title)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ top: '38px' }}>
                          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 scale-75 group-hover:scale-100 transition-transform shadow-2xl">
                            <i className="fas fa-play text-white text-[10px] mr-[-1px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black w-fit mb-1"
                          style={{ background: 'color-mix(in srgb, #f59e0b 15%, transparent)', color: '#f59e0b' }}>
                          <i className="fas fa-headphones text-[7px]"></i>
                          صوت · جلسه {toPersianDigits(item.episodeIndex + 1)}
                        </span>
                        <h4 className="text-[13px] font-bold line-clamp-1 leading-relaxed group-hover:text-primary-400 transition-colors cursor-pointer min-w-0"
                          style={{ color: 'var(--text)' }}
                          onClick={() => onPlayPodcast?.(item.podcast, item.episodeIndex)}>{String(item.episode.title)}</h4>
                        <p className="text-[10px] mb-1" style={{ color: 'var(--text-3)' }}>{String(item.podcast.title)}</p>
                        <div className="flex items-center justify-between">
                          {author && <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{String(author.name)}</p>}
                          <button onClick={() => onRemoveEpisode?.(item.podcastId, item.episodeIndex)}
                            className="flex items-center gap-1 text-[9px] font-bold transition-all hover:scale-105 active:scale-95"
                            style={{ color: 'var(--text-3)' }}>
                            <i className="fas fa-bookmark text-[9px]" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Videos */}
          {savedVideos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1 mt-3">
                <i className="fas fa-video text-xs" style={{ color: 'var(--primary)' }}></i>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>ویدیوها ({toPersianDigits(savedVideos.length)})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedVideos.map((v, i) => (
                  <div key={v.id || i}
                    className="group flex gap-3 p-3 rounded-2xl transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="relative w-[140px] h-[80px] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => onPlayVideo(v)}>
                      <img src={v.thumbnailUrl} alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 scale-75 group-hover:scale-100 transition-transform shadow-2xl">
                          <i className="fas fa-play text-white text-xs mr-[-1px]" />
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white bg-black/60 backdrop-blur-sm border border-white/10">
                        {toPersianDigits(formatTime(v.duration))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4 className="text-[13px] font-bold line-clamp-2 leading-relaxed mb-1.5 group-hover:text-primary-400 transition-colors cursor-pointer"
                        style={{ color: 'var(--text)' }}
                        onClick={() => onPlayVideo(v)}>{v.title}</h4>
                      <p className="text-[10px] mb-2" style={{ color: 'var(--text-3)' }}>
                        {toPersianDigits(v.viewCount)} بازدید • {v.uploadDate}
                      </p>
                      <button onClick={() => onRemoveVideo(v.id || (v as any)._id)}
                        className="flex items-center gap-1.5 text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                        style={{ color: 'var(--text-3)' }}>
                        <i className="fas fa-bookmark text-[10px]" />
                        <span>حذف از کتابخانه</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
