import React, { useState, useCallback, useMemo } from 'react';
import type { Podcast, Video, Book, Author, PublishedBook } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcasts: Podcast[];
  videos: Video[];
  books: Book[];
  authors: Author[];
  publishedBooks: PublishedBook[];
  onPodcastSelect: (p: Podcast) => void;
  onVideoSelect: (v: Video) => void;
  onBookSelect: (b: Book) => void;
  onAuthorSelect: (a: Author) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen, onClose, podcasts, videos, books, authors, publishedBooks,
  onPodcastSelect, onVideoSelect, onBookSelect, onAuthorSelect,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'podcast' | 'video' | 'book' | 'author'>('all');

  const results = useMemo(() => {
    if (!query.trim()) return { podcasts: [], videos: [], books: [], authors: [], publishedBooks: [] };
    const q = query.toLowerCase();
    return {
      podcasts: podcasts.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)),
      videos: videos.filter(v => v.title.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q)),
      books: books.filter(b => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)),
      authors: authors.filter(a => a.name.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q)),
      publishedBooks: publishedBooks.filter(b => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)),
    };
  }, [query, podcasts, videos, books, authors, publishedBooks]);

  const totalResults = results.podcasts.length + results.videos.length + results.books.length + results.authors.length + results.publishedBooks.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
            <i className="fas fa-search text-gray-400"></i>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="جستجو در پادکست، ویدیو، کتاب، نویسنده..."
              className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400"
            />
            {query && <button onClick={() => setQuery('')} className="text-gray-400"><i className="fas fa-times"></i></button>}
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'همه' },
              { id: 'podcast', label: 'صوت' },
              { id: 'video', label: 'ویدیو' },
              { id: 'book', label: 'کتاب' },
              { id: 'author', label: 'نویسنده' },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="text-center py-20 text-gray-300">
              <i className="fas fa-search text-5xl mb-4"></i>
              <p className="text-sm font-black">عبارتی برای جستجو وارد کنید</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <i className="fas fa-face-sad-tear text-5xl mb-4"></i>
              <p className="text-sm font-black">نتیجه‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.podcasts.length > 0 && (activeFilter === 'all' || activeFilter === 'podcast') && (
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">مجموعه‌های صوتی ({results.podcasts.length})</h3>
                  {results.podcasts.map(p => (
                    <div key={p.id} onClick={() => { onPodcastSelect(p); onClose(); }} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all mb-2">
                      <img src={p.cover} className="w-12 h-12 rounded-xl object-cover" alt={p.title} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-black text-xs text-gray-800 truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{p.episodes.length} جلسه</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {results.videos.length > 0 && (activeFilter === 'all' || activeFilter === 'video') && (
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ویدیوها ({results.videos.length})</h3>
                  {results.videos.map(v => (
                    <div key={v.id} onClick={() => { onVideoSelect(v); onClose(); }} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all mb-2">
                      <img src={v.thumbnailUrl} className="w-20 h-12 rounded-xl object-cover" alt={v.title} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-black text-xs text-gray-800 truncate">{v.title}</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {results.authors.length > 0 && (activeFilter === 'all' || activeFilter === 'author') && (
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">نویسندگان ({results.authors.length})</h3>
                  {results.authors.map(a => (
                    <div key={a.id} onClick={() => { onAuthorSelect(a); onClose(); }} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all mb-2">
                      <img src={a.avatar} className="w-12 h-12 rounded-full object-cover" alt={a.name} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-black text-xs text-gray-800">{a.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold truncate">{a.bio}</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {(results.books.length > 0 || results.publishedBooks.length > 0) && (activeFilter === 'all' || activeFilter === 'book') && (
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">کتاب‌ها ({results.books.length + results.publishedBooks.length})</h3>
                  {results.books.map(b => (
                    <div key={b.id} onClick={() => { onBookSelect(b); onClose(); }} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all mb-2">
                      <img src={b.cover} className="w-10 h-14 rounded-lg object-cover" alt={b.title} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-black text-xs text-gray-800 truncate">{b.title}</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
