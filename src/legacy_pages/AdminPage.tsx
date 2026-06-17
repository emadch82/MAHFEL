
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Podcast, Episode, Video, PublishedBook, Book } from '../types'; 
import { formatPersianDateForInput, parsePersianDateInput, toPersianDigits } from '../utils/helpers';
import { fetchAparatVideoDetails, extractAparatId } from '../utils/aparatApi';

interface AdminPageProps {
  onClose: () => void;
  currentPodcasts: Podcast[];
  currentVideos: Video[];
  currentPublishedBooks: PublishedBook[];
  onSave: (data: { podcasts: Podcast[], videos: Video[], publishedBooks: PublishedBook[] }) => void;
}

const contentCategories = [
    "گفتمان پیشرفت",
    "مدرسه سیاست",
    "قصه مقاومت",
    "روضه سرای هنر و اندیشه",
    "هیئت کتاب",
    "پادکست"
];

const AdminPage: React.FC<AdminPageProps> = ({ onClose, currentPodcasts, currentVideos, currentPublishedBooks, onSave }) => {
    const [activeTab, setActiveTab] = useState<'podcasts' | 'videos' | 'books' | 'matn'>('podcasts'); 
    const modalRef = useRef<HTMLDivElement>(null);
    const [initialPodcastsJSON] = useState(() => JSON.stringify(currentPodcasts));
    const [initialVideosJSON] = useState(() => JSON.stringify(currentVideos));
    const [initialPublishedBooksJSON] = useState(() => JSON.stringify(currentPublishedBooks));

    const [localPodcasts, setLocalPodcasts] = useState(() => JSON.parse(initialPodcastsJSON));
    const [localVideos, setLocalVideos] = useState(() => JSON.parse(initialVideosJSON));
    const [localPublishedBooks, setLocalPublishedBooks] = useState(() => JSON.parse(initialPublishedBooksJSON));
    
    const [editingPodcastId, setEditingPodcastId] = useState<number | null>(null);
    const [editingVideoId, setEditingVideoId] = useState<string | 'new' | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const hasChanges = useCallback(() => {
        return JSON.stringify(localPodcasts) !== initialPodcastsJSON ||
               JSON.stringify(localVideos) !== initialVideosJSON ||
               JSON.stringify(localPublishedBooks) !== initialPublishedBooksJSON;
    }, [localPodcasts, localVideos, localPublishedBooks, initialPodcastsJSON, initialVideosJSON, initialPublishedBooksJSON]);

    const handleSaveChangesAndClose = () => {
        onSave({ podcasts: localPodcasts, videos: localVideos, publishedBooks: localPublishedBooks });
        onClose();
    };

    const handleDiscardAndClose = useCallback(() => {
        if (hasChanges()) {
            if (window.confirm('شما تغییرات ذخیره‌نشده‌ای دارید. خارج می‌شوید؟')) onClose();
        } else {
            onClose();
        }
    }, [hasChanges, onClose]);

    const handleAddNewPodcast = () => {
        const newPodcast: Podcast = {
            id: Date.now(), title: 'پادکست جدید', description: '', cover: '', speakerId: 2, year: 1403,
            categories: [], episodes: [], duration: '00:00:00'
        };
        setLocalPodcasts(prev => [newPodcast, ...prev]);
        setEditingPodcastId(newPodcast.id);
    };

    const handleFetchVideoDetails = async () => {
        const extractedId = extractAparatId(videoUrl);
        if (!extractedId) return;
        setIsFetching(true);
        try {
            const { details } = await fetchAparatVideoDetails(extractedId);
            const newVideo: Video = { id: details.uid, embedId: details.uid, title: details.title, description: details.description, thumbnailUrl: details.big_poster, viewCount: details.visit_cnt, uploadDate: details.sdate, duration: details.duration, categories: ["ویدیو"] };
            setLocalVideos(prev => [newVideo, ...prev]);
            setVideoUrl('');
        } catch (e) { alert("خطا در دریافت ویدیو"); } finally { setIsFetching(false); }
    };

    const handleAddNewVideo = () => {
        const newVideo: Video = { id: 'new-' + Date.now(), embedId: '', title: 'ویدیوی جدید', description: '', thumbnailUrl: '', viewCount: 0, uploadDate: 'همین الان', duration: 0, categories: ['ویدیو'] };
        setLocalVideos(prev => [newVideo, ...prev]);
        setEditingVideoId(newVideo.id);
    };

    const handleEditVideo = (video: Video) => { setEditingVideoId(video.id); };

    const TabButton: React.FC<{ tab: 'podcasts' | 'videos' | 'books' | 'matn'; label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`py-2 px-4 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-background rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-3 border-b border-border-color bg-white"><h2 className="font-bold text-lg">پنل مدیریت محتوا</h2><button onClick={handleDiscardAndClose} className="text-text-secondary text-xl">&times;</button></header>
                <div className="border-b flex gap-2 p-2 bg-gray-50"><TabButton tab="podcasts" label="پادکست‌ها" /><TabButton tab="videos" label="ویدیوها" /><TabButton tab="matn" label="متن (کتابخانه)" /><TabButton tab="books" label="نشر (فروشگاه)" /></div>
                <main className="flex-grow p-4 overflow-y-auto bg-gray-50">
                    {activeTab === 'podcasts' && (
                        <div className="space-y-2">
                        <button onClick={handleAddNewPodcast} className="bg-primary text-white text-xs font-semibold py-2 px-4 rounded-full mb-4">+ پادکست جدید</button>
                        {localPodcasts.map((p:any) => (
                            <div key={p.id} className="bg-white p-3 rounded-lg border flex justify-between items-center"><span className="text-sm font-bold">{p.title}</span><button onClick={() => setEditingPodcastId(p.id)} className="text-blue-600 text-sm">ویرایش</button></div>
                        ))}
                        </div>
                    )}
                    {activeTab === 'videos' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="لینک آپارات..." className="flex-1 bg-white px-3 py-2 border rounded-md text-sm" />
                                <button onClick={handleFetchVideoDetails} disabled={isFetching} className="bg-secondary text-white px-4 py-2 rounded-md text-sm">{isFetching ? '...' : 'دریافت'}</button>
                            </div>
                            <div className="space-y-2">
                                {localVideos.map((v:any) => (
                                    <div key={v.id} className="bg-white p-3 rounded-lg border flex justify-between items-center"><span className="text-sm font-bold">{v.title}</span><button onClick={() => handleEditVideo(v)} className="text-blue-600 text-sm">ویرایش</button></div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
                <footer className="p-3 border-t bg-white flex justify-end gap-3"><button onClick={handleDiscardAndClose} className="px-4 py-2 text-sm bg-gray-200 rounded-md">لغو</button><button onClick={handleSaveChangesAndClose} disabled={!hasChanges()} className="px-6 py-2 text-sm bg-primary text-white rounded-md disabled:opacity-50">ذخیره و بستن</button></footer>
            </div>
        </div>
    );
};

export default AdminPage;
