import React, { useState } from 'react';
import type { Podcast } from '../types';
import PodcastCard from '../components/PodcastCard';
import NewEpisodeCard from '../components/NewEpisodeCard';
import LiveBanner from '../components/LiveBanner';
import { SohaIcon } from '../components/SohaLogo';

interface HomePageProps {
  podcasts: Podcast[];
  liveStream: { isLive: boolean; title: string; url: string; };
  onPodcastSelect: (podcast: Podcast) => void;
  onPlay: (podcast: Podcast, episodeIndex: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ podcasts, liveStream, onPodcastSelect, onPlay }) => {
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  
  const regularPodcasts = podcasts.filter(p => !p.isSquare);
  const squarePodcasts = podcasts.filter(p => p.isSquare);
  const categories = [...new Set(regularPodcasts.flatMap(p => p.categories))];

  const newEpisodes = regularPodcasts
    .flatMap(podcast => podcast.episodes.map((episode, index) => ({ podcast, episode, episodeIndex: index })))
    .filter(item => item.episode.isNew)
    .sort((a, b) => new Date(b.episode.date).getTime() - new Date(a.episode.date).getTime())
    .slice(0, 3);

  return (
    <main className="pb-10">
      {liveStream.isLive && !isBannerDismissed && (
        <div className="px-4 pt-4">
          <LiveBanner 
            title={liveStream.title} 
            url={liveStream.url}
            onDismiss={() => setIsBannerDismissed(true)} 
          />
        </div>
      )}
      <div className="p-[15px]">
        <section className="p-2.5 mb-4">
          <h2 className="text-base font-bold mb-3 text-text-primary pr-2.5 border-r-4 border-primary flex items-center gap-2">
            <i className="fas fa-headphones"></i>
            آخرین صوت‌ها
          </h2>
          <div className="flex flex-col gap-2">
            {newEpisodes.length > 0 ? (
              newEpisodes.map(item => (
                <NewEpisodeCard
                  key={`${item.podcast.id}-${item.episodeIndex}`}
                  podcast={item.podcast}
                  episode={item.episode}
                  episodeIndex={item.episodeIndex}
                  onSelect={onPodcastSelect}
                  onPlay={onPlay}
                />
              ))
            ) : (
              <div className="text-center py-8 text-text-secondary w-full">
                <i className="fas fa-clock text-2xl mb-2.5"></i>
                <p>هنوز محتوای جدیدی وجود ندارد</p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 text-text-primary pr-2.5 border-r-4 border-primary">جدیدترین‌ها</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
            {regularPodcasts.slice(0, 6).map(p => (
              <PodcastCard key={p.id} podcast={p} onClick={() => onPodcastSelect(p)} />
            ))}
          </div>
        </section>
        
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 text-text-primary pr-2.5 border-r-4 border-primary">پادکست‌ها</h2>
          <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar snap-x snap-mandatory">
            {squarePodcasts.map(p => (
              <div key={p.id} className="w-[31%] sm:w-[23%] flex-shrink-0 snap-start">
                <PodcastCard podcast={p} isSquare onClick={() => onPodcastSelect(p)} />
              </div>
            ))}
          </div>
        </section>

        <div id="categoriesContainer">
          {categories.map(category => (
            <section key={category} className="mb-6">
              <h2 className="text-base font-bold mb-3 text-text-primary pr-2.5 border-r-4 border-primary">{category}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
                {regularPodcasts.filter(p => p.categories.includes(category)).map(p => (
                  <PodcastCard key={p.id} podcast={p} onClick={() => onPodcastSelect(p)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <footer className="text-center py-[30px] px-[15px] bg-card-bg border-t border-border-color mt-5">
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          <SohaIcon size={40} />
          <h2 className="text-lg text-primary font-bold font-nastaliq">سرای هنر و اندیشه</h2>
        </div>
        <p className="text-xs text-text-secondary leading-normal">اپلیکیشن پادکست‌های تفکر و اندیشه</p>
      </footer>
    </main>
  );
};

export default HomePage;