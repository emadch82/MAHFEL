
import React, { useState, useMemo } from 'react';
import type { Author, Book, Podcast, Video } from '../types';
import BookCard from '../components/BookCard';
import VideoListItem from '../components/VideoListItem';
import { toPersianDigits, DEFAULT_COVER } from '../utils/helpers';

interface AuthorPageProps {
  author: Author;
  allBooks: Book[];
  allPodcasts: Podcast[];
  allVideos: Video[];
  onBack: () => void;
  onBookSelect: (book: Book) => void;
  onPlayEpisode: (podcast: Podcast, episodeIndex: number) => void;
}

const AuthorPage: React.FC<AuthorPageProps> = ({ author, allBooks, allPodcasts, allVideos, onBack, onBookSelect, onPlayEpisode }) => {
  const [activeTab, setActiveTab] = useState<'matn' | 'sowt' | 'video'>('matn');

  const authorBooks = allBooks.filter(book => book.authorId === author.id);
  // Sort podcasts: Newest ID first (assuming ID correlates with time or add a date field sort)
  const authorPodcasts = useMemo(() => {
      return allPodcasts
        .filter(podcast => podcast.speakerId === author.id)
        .sort((a, b) => b.id - a.id); // Descending order by ID
  }, [allPodcasts, author.id]);

  // Mock filtering for videos based on category matching author name or tag, since videos don't have speakerId yet.
  // In a real app, video should have an authorId or speakerId field.
  // For now, let's filter by string match or just show empty.
  const authorVideos = allVideos.filter(v => v.description.includes(author.name) || v.title.includes(author.name));
  
  const isSpecialAuthor = author.id === 7;

  const handlePodcastSelect = (podcast: Podcast) => {
      if(podcast.episodes.length > 0) {
          onPlayEpisode(podcast, 0);
      }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white animate-fadeIn pb-24">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 h-48" style={{ backgroundImage: `url(${author.coverImage || author.avatar})`, filter: 'blur(8px)' }}></div>
        <div className="relative z-10 flex flex-col items-center text-center pt-8 pb-4 bg-gradient-to-b from-transparent to-gray-900">
            <button onClick={onBack} className="bg-black/40 text-white border-none w-10 h-10 rounded-full text-base cursor-pointer backdrop-blur-sm transition-all duration-300 flex items-center justify-center absolute right-4 top-4 active:bg-black/50 active:scale-95 z-20">
              <i className="fas fa-arrow-right"></i>
            </button>
            
            <img 
                src={author.avatar} 
                alt={author.name} 
                className="w-28 h-28 rounded-full object-cover shadow-2xl mb-3 mt-4"
                style={{ border: isSpecialAuthor ? '3px solid rgba(251, 191, 36, 0.5)' : '3px solid rgba(255,255,255,0.2)' }}
            />
            
            <h1 className={`text-xl font-bold mb-2 ${isSpecialAuthor ? 'text-amber-400' : 'text-white'}`}>{author.name}</h1>
            <p className="text-xs leading-relaxed text-gray-300 max-w-md px-6 line-clamp-2">
              {author.bio}
            </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md z-30 border-b border-gray-800">
          <div className="flex items-center justify-around px-2">
              <button onClick={() => setActiveTab('matn')} className={`flex-1 py-3 text-sm font-medium text-center transition-all duration-200 border-b-2 ${activeTab === 'matn' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}>متن‌ ({toPersianDigits(authorBooks.length)})</button>
              <button onClick={() => setActiveTab('sowt')} className={`flex-1 py-3 text-sm font-medium text-center transition-all duration-200 border-b-2 ${activeTab === 'sowt' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}>جلسات ({toPersianDigits(authorPodcasts.length)})</button>
              <button onClick={() => setActiveTab('video')} className={`flex-1 py-3 text-sm font-medium text-center transition-all duration-200 border-b-2 ${activeTab === 'video' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}>ویدیو ({toPersianDigits(authorVideos.length)})</button>
          </div>
      </div>
      
      {/* Content */}
      <main className="p-4">
        {activeTab === 'matn' && (
          <div className="animate-fadeIn">
             {authorBooks.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                  {authorBooks.map(book => (
                    <div key={book.id}>
                      <BookCard book={book} author={author} onClick={() => onBookSelect(book)} />
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-16 text-gray-500">
                    <i className="fas fa-book-open text-3xl mb-3"></i>
                    <p className="text-sm">کتابی یافت نشد.</p>
                </div>
             )}
          </div>
        )}
        
        {activeTab === 'sowt' && (
          <div className="animate-fadeIn space-y-3">
             {authorPodcasts.length > 0 ? (
                authorPodcasts.map(podcast => (
                  <div 
                    key={podcast.id} 
                    onClick={() => handlePodcastSelect(podcast)}
                    className="flex items-center gap-3 p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img src={podcast.cover || DEFAULT_COVER} alt={podcast.title} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                            <i className="fas fa-play text-white text-sm opacity-80"></i>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-200 line-clamp-1">{podcast.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                              <span className="bg-gray-700 px-2 py-0.5 rounded-full">{toPersianDigits(podcast.year)}</span>
                              <span>{toPersianDigits(podcast.episodes.length)} قسمت</span>
                          </div>
                      </div>
                  </div>
                ))
             ) : (
                <div className="text-center py-16 text-gray-500">
                    <i className="fas fa-microphone-slash text-3xl mb-3"></i>
                    <p className="text-sm">مجموعه صوتی یافت نشد.</p>
                </div>
             )}
          </div>
        )}

        {activeTab === 'video' && (
            <div className="animate-fadeIn space-y-3">
                {authorVideos.length > 0 ? (
                    authorVideos.map(video => (
                        <VideoListItem 
                            key={video.id} 
                            video={video} 
                            onClick={() => {}} // In a real app, play video
                            isActive={false} 
                        />
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <i className="fas fa-video-slash text-3xl mb-3"></i>
                        <p className="text-sm">ویدیویی یافت نشد.</p>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default AuthorPage;
