
import React, { useState } from 'react';
import type { Book, Podcast, Author } from '../types';
import { toPersianDigits, formatPersianDate, DEFAULT_COVER } from '../utils/helpers';

interface BookPageProps {
  book: Book;
  allPodcasts: Podcast[];
  authors: Author[];
  onBack: () => void;
  onPlayEpisode: (podcast: Podcast, episodeIndex: number) => void;
  onAuthorSelect: (author: Author) => void;
}

const BookPage: React.FC<BookPageProps> = ({ book, allPodcasts, authors, onBack, onPlayEpisode, onAuthorSelect }) => {
  
  const getRelatedEpisodeDetails = () => {
    return book.relatedEpisodes
      .map(ref => {
        const podcast = allPodcasts.find(p => p.id === ref.podcastId);
        if (podcast && podcast.episodes[ref.episodeIndex]) {
          return {
            podcast,
            episode: podcast.episodes[ref.episodeIndex],
            episodeIndex: ref.episodeIndex,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const relatedEpisodes = getRelatedEpisodeDetails();
  const author = authors.find(a => a.id === book.authorId);

  const getInitialTab = () => {
    if (book.description) return 'about';
    if (relatedEpisodes.length > 0) return 'sessions';
    return 'comments';
  };
  
  const [activeTab, setActiveTab] = useState<'about' | 'sessions' | 'comments'>(getInitialTab);
  const [isBookmarked, setIsBookmarked] = useState(false); // Add bookmark state

  const playAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (relatedEpisodes.length > 0) {
      onPlayEpisode(relatedEpisodes[0].podcast, relatedEpisodes[0].episodeIndex);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-[200] overflow-y-auto animate-fadeIn">
      {/* ===== HEADER SECTION ===== */}
      <header className="text-white p-4 pb-28 relative bg-cover bg-center">
        {/* Background Image & Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${book.cover})`, filter: 'blur(30px) brightness(0.5)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>

        <div className="relative z-10">
          {/* Back Button - Standardized to Right */}
          <button onClick={onBack} className="bg-black/40 border-none w-10 h-10 rounded-full text-base text-white cursor-pointer backdrop-blur-md transition-all duration-300 flex items-center justify-center absolute right-4 top-4 active:bg-black/50 active:scale-95 z-20">
            <i className="fas fa-arrow-right"></i>
          </button>
          
          {/* Main Content */}
          <div className="flex flex-col items-center text-center pt-16">
            <div className="w-32 sm:w-36 md:w-40 aspect-[2/3] rounded-lg shadow-2xl mb-4 overflow-hidden">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-bold leading-tight text-gray-100 drop-shadow-lg">{book.title}</h1>
            
            {author && (
              <p 
                className="text-lg font-semibold text-gray-300 mt-1 mb-3 leading-relaxed cursor-pointer hover:underline drop-shadow-sm"
                onClick={() => onAuthorSelect(author)}
              >
                {author.name}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-400 drop-shadow-sm">
              {relatedEpisodes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <i className="fas fa-headphones"></i>
                  <span>{toPersianDigits(relatedEpisodes.length)} جلسه</span>
                </div>
              )}
              {book.categories.slice(0,1).map(cat => (
                <div key={cat} className="flex items-center gap-1.5">
                  <i className="fas fa-tag"></i>
                  <span>{cat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {relatedEpisodes.length > 0 && (
              <div className="flex gap-3 mt-2.5 justify-center">
                <button onClick={playAll} className="bg-primary text-white font-bold border-none py-3 px-8 rounded-full text-base cursor-pointer transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-lg hover:bg-primary-dark">
                  <i className="fas fa-play"></i>
                  <span>پخش</span>
                </button>
                <button onClick={() => setIsBookmarked(!isBookmarked)} className="bg-gray-800/70 border border-gray-600/50 w-12 h-12 rounded-full text-gray-300 text-lg cursor-pointer backdrop-blur-md transition-all duration-300 active:scale-95 active:bg-gray-700 flex items-center justify-center">
                  <i className={`${isBookmarked ? 'fas fa-bookmark text-primary' : 'far fa-bookmark'}`}></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* ===== TABS & CONTENT SECTION ===== */}
      <div className="bg-gray-900 rounded-t-2xl -mt-16 relative z-10">
        <div className="border-b border-gray-700 flex justify-center sticky top-0 z-20 bg-gray-900 rounded-t-2xl">
            {book.description && <button onClick={() => setActiveTab('about')} className={`py-3 px-6 text-sm font-semibold transition-all ${activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>درباره</button>}
            {relatedEpisodes.length > 0 && <button onClick={() => setActiveTab('sessions')} className={`py-3 px-6 text-sm font-semibold transition-all ${activeTab === 'sessions' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>{`جلسات (${toPersianDigits(relatedEpisodes.length)})`}</button>}
            <button onClick={() => setActiveTab('comments')} className={`py-3 px-6 text-sm font-semibold transition-all ${activeTab === 'comments' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>گفتگوها</button>
        </div>

        <div className="p-4">
            {activeTab === 'about' && (
              <section className="animate-fadeIn">
                  <div className="text-gray-300 text-sm leading-loose text-justify whitespace-pre-wrap bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      {book.description || "توضیحاتی برای این کتاب ثبت نشده است."}
                  </div>
              </section>
            )}

            {activeTab === 'sessions' && (
              <section className="animate-fadeIn">
                  {relatedEpisodes.length > 0 ? (
                      <div className="flex flex-col gap-3">
                      {relatedEpisodes.map((item, index) => (
                          <div key={index} onClick={() => onPlayEpisode(item.podcast, item.episodeIndex)} className="group flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all duration-200 bg-gray-800/50 border border-transparent hover:bg-gray-700/70 hover:border-gray-600">
                             <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-700/50 rounded-lg text-gray-400 font-mono text-xl">
                                {toPersianDigits(index + 1)}
                             </div>
                             <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                  <img src={item.episode.cover || item.podcast.cover || DEFAULT_COVER} alt={item.episode.title} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                      <i className="fas fa-play-circle"></i>
                                  </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-200 line-clamp-2 group-hover:text-primary">{item.episode.title}</h4>
                                  <p className="text-xs text-gray-400 mt-1">{item.podcast.title}</p>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500/80">
                                    <span><i className="far fa-clock mr-1"></i> {item.episode.duration}</span>
                                    <span><i className="far fa-calendar-alt mr-1"></i> {formatPersianDate(item.episode.date)}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                      </div>
                  ) : (
                      <div className="text-center py-10 text-gray-500">
                          <i className="fas fa-link-slash text-3xl mb-3"></i>
                          <p>جلسه صوتی مرتبطی برای این کتاب یافت نشد.</p>
                      </div>
                  )}
              </section>
            )}

            {activeTab === 'comments' && (
               <section className="animate-fadeIn">
                   <div className="text-center py-10 text-gray-500">
                      <i className="fas fa-comments text-3xl mb-3"></i>
                      <p>بخش گفتگوها به زودی فعال خواهد شد.</p>
                  </div>
               </section>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
