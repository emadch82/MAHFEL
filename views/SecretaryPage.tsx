
import React, { useMemo } from 'react';
import type { Author, Podcast } from '../types';
import { toPersianDigits } from '../utils/helpers';

interface SecretaryPageProps {
  secretary: Author;
  allPodcasts: Podcast[];
  onBack: () => void;
  onPodcastSelect: (podcast: Podcast) => void;
  onPlayEpisode: (podcast: Podcast, episodeIndex: number) => void;
}

const SecretaryPage: React.FC<SecretaryPageProps> = ({ secretary, allPodcasts, onBack, onPodcastSelect, onPlayEpisode }) => {
  const relatedPodcasts = useMemo(() => {
    return allPodcasts.filter(podcast => podcast.speakerId === secretary.id);
  }, [allPodcasts, secretary.id]);

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-[400] overflow-y-auto animate-fadeIn pb-32">
      <header className="relative h-64 flex flex-col justify-end p-6 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img src={secretary.coverImage || secretary.avatar} className="w-full h-full object-cover blur-xl scale-110" alt="bg"/>
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>
        
        <button onClick={onBack} className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform z-20">
          <i className="fas fa-arrow-right"></i>
        </button>

        <div className="relative z-10 flex items-center gap-5">
            <img src={secretary.avatar} className="w-20 h-20 rounded-3xl object-cover border-2 border-white/20 shadow-2xl shadow-black/50" alt={secretary.name} />
            <div className="text-right">
                <h1 className="text-xl font-black text-white mb-1">{secretary.name}</h1>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full inline-block border border-primary/20">دبیر و ارائه‌دهنده جلسات</p>
            </div>
        </div>
      </header>

      <main className="p-4 -mt-6 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-6">
            <p className="text-xs text-gray-500 leading-[2] text-justify font-medium">{secretary.bio}</p>
        </div>

        <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-sm font-black text-gray-800">مجموعه‌های صوتی با دبیری {secretary.name}</h2>
                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{toPersianDigits(relatedPodcasts.length)} مجموعه</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {relatedPodcasts.length > 0 ? relatedPodcasts.map(pod => (
                    <div key={pod.id} onClick={() => onPodcastSelect(pod)} className="bg-white p-3 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all group">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                            <img src={pod.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={pod.title}/>
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fas fa-play text-white text-xs"></i>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[12px] font-black text-gray-800 line-clamp-1">{pod.title}</h3>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">سال {toPersianDigits(pod.year)}</span>
                                <span className="text-[9px] text-gray-400 font-bold">{toPersianDigits(pod.episodes.length)} جلسه</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors">
                            <i className="fas fa-chevron-left text-xs"></i>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-300">
                        <i className="fas fa-microphone-slash text-4xl mb-4 opacity-20"></i>
                        <p className="text-xs font-black">هنوز مجموعه‌ای برای این دبیر ثبت نشده است.</p>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default SecretaryPage;
