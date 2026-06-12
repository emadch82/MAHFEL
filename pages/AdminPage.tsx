
import React, { useState, useMemo } from 'react';
import type { Podcast, Episode, Video, PublishedBook, Author, Book } from '../types';
import { toPersianDigits } from '../utils/helpers';
import { uploadFile } from '../services/api';
import { fetchAparatVideoDetails, extractAparatId } from '../utils/aparatApi';
import { GoogleGenAI } from "@google/genai";

// --- Shared UI Components ---

const FormField = ({ label, children }: any) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black text-gray-400 mb-1.5 mr-1 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const TextInput = (props: any) => (
  <input {...props} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300 shadow-sm" />
);

const TextArea = (props: any) => (
  <textarea {...props} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] placeholder:text-gray-300 shadow-sm" />
);

const UploadButton = ({ onUpload, icon = "fa-cloud-upload-alt", accept = "image/*" }: any) => {
    const [uploading, setUploading] = useState(false);
    return (
        <label className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${uploading ? 'bg-gray-50 text-gray-400' : 'bg-white text-primary border-primary/10 hover:bg-primary/5 shadow-sm'}`}>
            <i className={`fas ${uploading ? 'fa-spinner fa-spin' : icon}`}></i>
            <input type="file" accept={accept} hidden onChange={async (e:any) => {
                const f = e.target.files[0]; if(!f) return;
                setUploading(true); try { const url = await uploadFile(f); onUpload(url); } finally { setUploading(false); }
            }} />
        </label>
    );
};

const SmartEditButton = ({ text, onEdited }: { text: string, onEdited: (newText: string) => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSmartEdit = async () => {
        if (!text || text.trim().length < 5) return;
        setIsProcessing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: text,
                config: {
                    systemInstruction: "شما یک ویراستار حرفه‌ای هستید. وظیفه شما این است که متن فارسی ارائه شده را به صورت بسیار جزیی ویرایش کنید تا فقط رسمی و از نظر نگارشی صحیح شود. محتوا، معنا و لحن اصلی باید کاملاً حفظ شود. هیچ اطلاعاتی اضافه یا کم نکنید. فقط کلمات را به معادل رسمی تبدیل کرده و علائم نگارشی را اصلاح کنید. متن خروجی باید کاملاً شبیه اصل باشد اما با ساختار رسمی.",
                },
            });
            if (response.text) {
                onEdited(response.text);
            }
        } catch (error) {
            console.error("Smart Edit Error:", error);
            alert("خطا در ویراستاری هوشمند. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button 
            onClick={handleSmartEdit}
            disabled={isProcessing || !text}
            title="ویراستار هوشمند سرای هنر و اندیشه (رسمی‌سازی جزیی)"
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${isProcessing ? 'bg-primary/10 text-primary' : 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100 shadow-sm disabled:opacity-30'}`}
        >
            <i className={`fas ${isProcessing ? 'fa-wand-magic-sparkles fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
        </button>
    );
};

declare const mammoth: any;

const WordToHtmlButton = ({ onConverted }: any) => {
    const [processing, setProcessing] = useState(false);
    return (
        <label className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${processing ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 shadow-sm'}`}>
            <i className={`fas ${processing ? 'fa-spinner fa-spin' : 'fa-file-word'}`}></i>
            <input type="file" accept=".docx" hidden onChange={async (e:any) => {
                const f = e.target.files[0]; if(!f) return;
                setProcessing(true);
                try {
                    const arrayBuffer = await f.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    onConverted(result.value);
                } catch (err) { alert("خطا در پردازش ورد"); } finally { setProcessing(false); }
            }} />
        </label>
    );
};

// --- Simple Jalali Date Input ---
const PersianDateInput = ({ value, onChange }: any) => {
    return (
        <div className="relative group">
            <TextInput value={value} onChange={onChange} placeholder="۱۴۰۳/۰۱/۰۱" />
            <i className="fas fa-calendar-day absolute left-3 top-3.5 text-gray-300 group-focus-within:text-primary transition-colors"></i>
        </div>
    );
};

// --- Two-Step Audio Picker Modal ---
const AudioPickerModal = ({ podcasts, onSelect, onClose }: any) => {
    const [step, setStep] = useState<'podcast' | 'episode'>('podcast');
    const [selectedPod, setSelectedPod] = useState<Podcast | null>(null);
    const [search, setSearch] = useState('');

    const filteredPodcasts = podcasts.filter((p: Podcast) => p.title.includes(search));
    const filteredEpisodes = selectedPod ? selectedPod.episodes.filter(e => e.title.includes(search)) : [];

    return (
        <div className="fixed inset-0 bg-black/60 z-[9000] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-fadeIn">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-black text-gray-800 text-xs">
                        {step === 'podcast' ? 'مرحله ۱: انتخاب مجموعه' : `مرحله ۲: انتخاب جلسه از ${selectedPod?.title}`}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
                </div>
                <div className="p-4 bg-white border-b">
                    <TextInput placeholder="جستجو در لیست..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2 no-scrollbar bg-gray-50">
                    {step === 'podcast' ? (
                        filteredPodcasts.map((p: Podcast) => (
                            <div key={p.id} onClick={() => { setSelectedPod(p); setStep('episode'); setSearch(''); }} className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all flex items-center gap-3 shadow-sm">
                                <img src={p.cover} className="w-10 h-10 rounded-xl object-cover" />
                                <div>
                                    <p className="text-[11px] font-black text-gray-800">{p.title}</p>
                                    <p className="text-[9px] text-gray-400 font-bold">{toPersianDigits(p.episodes.length)} جلسه</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <button onClick={() => { setStep('podcast'); setSelectedPod(null); }} className="text-primary font-black text-[10px] mb-3 flex items-center gap-1 hover:underline">
                                <i className="fas fa-arrow-right"></i> بازگشت به لیست مجموعه‌ها
                            </button>
                            {filteredEpisodes.map((ep: Episode, idx: number) => (
                                <div key={idx} onClick={() => { onSelect({ podcastId: selectedPod?.id, episodeIndex: idx, title: ep.title }); onClose(); }} className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary cursor-pointer transition-all shadow-sm">
                                    <p className="text-[10px] font-black text-gray-800">{ep.title}</p>
                                    <p className="text-[8px] text-gray-400 font-bold mt-1">{ep.duration}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminPage = ({ onClose, currentPodcasts, currentVideos, currentPublishedBooks, currentAuthors, currentBooks, currentComments, currentPosts, onSave }: any) => {
    const [activeTab, setActiveTab] = useState<'sowt' | 'library' | 'nashr' | 'videos' | 'community'>('sowt');
    const [librarySubTab, setLibrarySubTab] = useState<'masters' | 'books' | 'secretaries'>('masters');
    const [communitySubTab, setCommunitySubTab] = useState<'comments' | 'posts'>('comments');
    
    const [localData, setLocalData] = useState({
        podcasts: JSON.parse(JSON.stringify(currentPodcasts)),
        videos: JSON.parse(JSON.stringify(currentVideos)),
        publishedBooks: JSON.parse(JSON.stringify(currentPublishedBooks)),
        authors: JSON.parse(JSON.stringify(currentAuthors)),
        books: JSON.parse(JSON.stringify(currentBooks)),
        posts: JSON.parse(JSON.stringify(currentPosts)),
        comments: JSON.parse(JSON.stringify(currentComments))
    });

    const [editingItem, setEditingItem] = useState<{ type: string, id: any } | null>(null);
    const [pickerConfig, setPickerConfig] = useState<any>(null);
    const [aparatUrl, setAparatUrl] = useState('');
    const [podcastSearch, setPodcastSearch] = useState('');
    const [podcastSort, setPodcastSort] = useState<'newest' | 'year' | 'master'>('newest');
    const [selectedMasterFilter, setSelectedMasterFilter] = useState<number | 'all'>('all');
    const [communitySearch, setCommunitySearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ key: string, id: any } | null>(null);

    const updateTable = (key: keyof typeof localData, val: any) => setLocalData(prev => ({ ...prev, [key]: val }));

    const handleDelete = (key: keyof typeof localData, id: any) => {
        setConfirmDelete({ key, id });
    };
    const confirmDeleteItem = () => {
        if (!confirmDelete) return;
        updateTable(confirmDelete.key as any, localData[confirmDelete.key as keyof typeof localData].filter((x: any) => x.id !== confirmDelete.id));
        setConfirmDelete(null);
    };

    const sortedPodcasts = useMemo(() => {
        let list = [...localData.podcasts].filter(p => p.title.includes(podcastSearch));
        
        if (selectedMasterFilter !== 'all') {
            list = list.filter(p => p.speakerId === selectedMasterFilter || p.authorId === selectedMasterFilter);
        }

        if (podcastSort === 'newest') list.sort((a,b) => b.id - a.id);
        if (podcastSort === 'year') list.sort((a,b) => b.year - a.year);
        if (podcastSort === 'master') {
            list.sort((a, b) => {
                const authorA = localData.authors.find((au: any) => au.id === a.speakerId)?.name || '';
                const authorB = localData.authors.find((au: any) => au.id === b.speakerId)?.name || '';
                return authorA.localeCompare(authorB);
            });
        }
        return list;
    }, [localData.podcasts, podcastSearch, podcastSort, selectedMasterFilter, localData.authors]);

    // --- Renderers ---

    const renderSowtPanel = () => {
        if (editingItem?.type === 'Podcast') {
            const p = localData.podcasts.find((x: any) => x.id === editingItem.id);
            if (!p) return null;
            const setField = (f: keyof Podcast, v: any) => updateTable('podcasts', localData.podcasts.map((i: any) => i.id === p.id ? { ...i, [f]: v } : i));

            return (
                <div className="p-4 space-y-6 animate-fadeIn pb-40">
                    <button onClick={() => setEditingItem(null)} className="text-primary font-black text-[10px]">&larr; بازگشت به لیست</button>
                    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                        <FormField label="عنوان مجموعه صوتی"><TextInput value={p.title} onChange={(e:any)=>setField('title', e.target.value)} /></FormField>
                        <div className="grid grid-cols-2 gap-3">
                             <FormField label="دبیر (ارائه‌دهنده)">
                                <select className="w-full bg-white border border-gray-200 rounded-xl h-11 px-2 text-[11px] font-black outline-none shadow-sm" value={p.speakerId} onChange={(e:any)=>setField('speakerId', Number(e.target.value))}>
                                    {localData.authors.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </FormField>
                             <FormField label="سال برگزاری (شمسی)"><TextInput type="number" value={p.year} onChange={(e:any)=>setField('year', Number(e.target.value))} /></FormField>
                        </div>
                        <FormField label="کاور مجموعه">
                            <div className="flex gap-2">
                                <TextInput value={p.cover} onChange={(e:any)=>setField('cover', e.target.value)} />
                                <UploadButton onUpload={(url:string)=>setField('cover', url)} />
                            </div>
                        </FormField>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 pr-3 uppercase tracking-widest">جلسات مجموعه</h3>
                        {p.episodes.map((ep: Episode, idx: number) => (
                            <div key={idx} className="bg-white p-5 rounded-[2rem] border shadow-sm space-y-3 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 px-4 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-bl-2xl">جلسه {toPersianDigits(idx + 1)}</div>
                                <div className="pt-2 flex gap-2">
                                    <div className="flex-1"><FormField label="زیرعنوان جلسه"><TextInput value={ep.subtitle || ''} onChange={(e:any)=>{ const n=[...p.episodes]; n[idx].subtitle=e.target.value; setField('episodes', n); }}/></FormField></div>
                                    <div className="w-10"><FormField label="آپلود صوت"><UploadButton accept="audio/*" icon="fa-microphone" onUpload={(url:string)=>{ const n=[...p.episodes]; n[idx].audioUrl=url; setField('episodes', n); }} /></FormField></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="لینک صوت"><TextInput value={ep.audioUrl} onChange={(e:any)=>{ const n=[...p.episodes]; n[idx].audioUrl=e.target.value; setField('episodes', n); }}/></FormField>
                                    <FormField label="تاریخ انتشار"><PersianDateInput value={ep.date} onChange={(e:any)=>{ const n=[...p.episodes]; n[idx].date=e.target.value; setField('episodes', n); }}/></FormField>
                                </div>
                                <FormField label="متن جلسه (مطالعه)">
                                    <div className="flex gap-2 items-start">
                                        <TextArea placeholder="متن مطالعه این جلسه..." value={ep.fullText || ''} onChange={(e:any)=>{ const n=[...p.episodes]; n[idx].fullText=e.target.value; setField('episodes', n); }} />
                                        <div className="flex flex-col gap-2">
                                            <WordToHtmlButton onConverted={(html:string)=>{ const n=[...p.episodes]; n[idx].fullText=html; setField('episodes', n); }} />
                                            <SmartEditButton text={ep.fullText || ''} onEdited={(newText) => { const n=[...p.episodes]; n[idx].fullText=newText; setField('episodes', n); }} />
                                        </div>
                                    </div>
                                </FormField>
                                <button onClick={()=>{const n=[...p.episodes]; n.splice(idx,1); setField('episodes', n);}} className="text-red-400 text-[9px] font-black w-full text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">حذف این جلسه</button>
                            </div>
                        ))}
                        <button onClick={()=>{ const n=[...p.episodes, {title: `جلسه ${p.episodes.length+1}`, duration:'0', audioUrl:'', date:'۱۴۰۳/۰۱/۰۱', isNew:true, viewCount:0}]; setField('episodes', n); }} className="w-full py-4 border-2 border-dashed border-primary/20 text-primary rounded-[2rem] font-black text-xs bg-primary/5 active:scale-95 transition-all shadow-sm">+ افزودن جلسه جدید</button>
                    </div>
                </div>
            );
        }
        return (
            <div className="p-4 space-y-4">
                <button onClick={()=>{
                    const id = Date.now();
                    const n: Podcast = { id, title: '', description: '', cover: '', speakerId: localData.authors[0]?.id || 1, duration: '0', episodes: [], year: 1403, categories: ["پادکست"] };
                    updateTable('podcasts', [n, ...localData.podcasts]);
                    setEditingItem({ type: 'Podcast', id });
                }} className="w-full py-4 bg-primary text-white rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">+ ایجاد مجموعه صوتی جدید</button>
                
                <div className="space-y-2 bg-white p-3 rounded-[2rem] border shadow-sm">
                    <div className="relative">
                        <TextInput placeholder="جستجو در مجموعه‌ها..." value={podcastSearch} onChange={(e:any)=>setPodcastSearch(e.target.value)} />
                        <i className="fas fa-search absolute left-3 top-3.5 text-gray-300"></i>
                    </div>
                    <div className="flex gap-2">
                        <select className="flex-1 bg-gray-50 border-none rounded-xl px-3 h-10 text-[10px] font-black text-gray-500 outline-none" value={podcastSort} onChange={(e:any)=>setPodcastSort(e.target.value as any)}>
                            <option value="newest">سورت: جدیدترین</option>
                            <option value="year">سورت: سال برگزاری</option>
                            <option value="master">سورت: نام استاد</option>
                        </select>
                        <select className="flex-1 bg-gray-50 border-none rounded-xl px-3 h-10 text-[10px] font-black text-gray-500 outline-none" value={selectedMasterFilter} onChange={(e:any)=>setSelectedMasterFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                            <option value="all">همه اساتید</option>
                            {localData.authors.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    {sortedPodcasts.map((p: any) => (
                        <div key={p.id} className="bg-white p-3 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                            <div className="flex items-center gap-3">
                                <img src={p.cover} className="w-11 h-11 rounded-xl object-cover shadow-sm"/>
                                <div>
                                    <p className="font-black text-[11px] text-gray-700">{p.title || 'بی‌عنوان'}</p>
                                    <p className="text-[9px] text-gray-400 font-bold">{toPersianDigits(p.year)} • {toPersianDigits(p.episodes.length)} جلسه</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingItem({ type: 'Podcast', id: p.id })} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black transition-colors hover:bg-blue-100">ویرایش</button>
                                <button onClick={() => handleDelete('podcasts', p.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[10px]"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderLibraryPanel = () => {
        if (editingItem?.type === 'Author') {
            const a = localData.authors.find((x: any) => x.id === editingItem.id);
            if (!a) return null;
            const setField = (f: keyof Author, v: any) => updateTable('authors', localData.authors.map((i: any) => i.id === a.id ? { ...i, [f]: v } : i));
            return (
                <div className="p-4 space-y-4 animate-fadeIn pb-40">
                    <button onClick={() => setEditingItem(null)} className="text-orange-600 font-black text-[10px]">&larr; بازگشت</button>
                    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                        <FormField label="نام استاد/دبیر"><TextInput value={a.name} onChange={(e:any)=>setField('name', e.target.value)} /></FormField>
                        <FormField label="نقش">
                            <select className="w-full bg-white border border-gray-200 rounded-xl h-11 px-2 text-[11px] font-black outline-none shadow-sm" value={a.role} onChange={(e:any)=>setField('role', e.target.value)}>
                                <option value="master">استاد (مولف)</option>
                                <option value="secretary">دبیر (ارائه‌دهنده)</option>
                            </select>
                        </FormField>
                        <FormField label="تصویر آواتار">
                            <div className="flex gap-2"><TextInput value={a.avatar} onChange={(e:any)=>setField('avatar', e.target.value)} /><UploadButton onUpload={(url:string)=>setField('avatar', url)} /></div>
                        </FormField>
                        <TextArea label="بایوگرافی" value={a.bio} onChange={(e:any)=>setField('bio', e.target.value)} />
                    </div>
                </div>
            );
        }

        if (editingItem?.type === 'Book') {
            const b = localData.books.find((x: any) => x.id === editingItem.id);
            if (!b) return null;
            const setField = (f: keyof Book, v: any) => updateTable('books', localData.books.map((i: any) => i.id === b.id ? { ...i, [f]: v } : i));
            return (
                <div className="p-4 space-y-4 animate-fadeIn pb-40">
                    <button onClick={() => setEditingItem(null)} className="text-orange-600 font-black text-[10px]">&larr; بازگشت</button>
                    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                        <FormField label="عنوان کتاب"><TextInput value={b.title} onChange={(e:any)=>setField('title', e.target.value)} /></FormField>
                        <FormField label="انتخاب استاد (مولف)">
                            <select className="w-full bg-white border border-gray-200 rounded-xl h-11 px-2 text-[11px] font-black outline-none shadow-sm" value={b.authorId} onChange={(e:any)=>setField('authorId', Number(e.target.value))}>
                                {localData.authors.filter((a:any)=>a.role === 'master').map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="کاور کتاب">
                            <div className="flex gap-2"><TextInput value={b.cover} onChange={(e:any)=>setField('cover', e.target.value)} /><UploadButton onUpload={(url:string)=>setField('cover', url)} /></div>
                        </FormField>
                        <div className="pt-4 border-t">
                            <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">صوت‌های متصل شده</p>
                            <div className="space-y-1 mb-3">
                                {b.relatedEpisodes?.map((re:any, i:number)=>(
                                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <span className="text-[9px] font-bold text-gray-600">صوت شماره {toPersianDigits(i+1)}</span>
                                        <button onClick={()=>{const n=[...b.relatedEpisodes]; n.splice(i,1); setField('relatedEpisodes', n);}} className="text-red-400 text-xs p-1 hover:text-red-600 transition-colors"><i className="fas fa-times-circle"></i></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={()=>setPickerConfig({ podcasts: localData.podcasts, onSelect: (ep:any)=>{ const n=[...(b.relatedEpisodes||[]), {podcastId: ep.podcastId, episodeIndex: ep.episodeIndex}]; setField('relatedEpisodes', n); } })} className="w-full py-3 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black border-2 border-dashed border-orange-100 hover:bg-orange-100 transition-colors shadow-sm">+ اتصال صوت جدید (مرورگر دو مرحله‌ای)</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 space-y-6 pb-40">
                {/* Library Tabs Selector */}
                <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
                    {[
                        { id: 'masters', label: 'اساتید', icon: 'fa-user-tie' },
                        { id: 'books', label: 'کتابخانه', icon: 'fa-book' },
                        { id: 'secretaries', label: 'دبیران', icon: 'fa-user-graduate' }
                    ].map(sub => (
                        <button key={sub.id} onClick={() => setLibrarySubTab(sub.id as any)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${librarySubTab === sub.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 grayscale opacity-60'}`}>
                            <i className={`fas ${sub.icon}`}></i>
                            <span>{sub.label}</span>
                        </button>
                    ))}
                </div>

                {librarySubTab === 'masters' && (
                    <section className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لیست اساتید</h3>
                            <button onClick={()=>{
                                 const id = Date.now();
                                 const n: Author = { id, name: '', avatar: '', bio: '', role: 'master' };
                                 updateTable('authors', [n, ...localData.authors]);
                                 setEditingItem({ type: 'Author', id });
                            }} className="text-[9px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full">+ استاد جدید</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {localData.authors.filter((a:any)=>a.role === 'master').map((a:any) => (
                                <div key={a.id} className="bg-white p-3 rounded-2xl border flex items-center gap-3 cursor-pointer hover:border-orange-500 shadow-sm transition-all group" onClick={() => setEditingItem({ type: 'Author', id: a.id })}>
                                    <img src={a.avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                    <span className="text-[10px] font-black text-gray-700 truncate flex-1">{a.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete('authors', a.id); }} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[8px]"></i></button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {librarySubTab === 'secretaries' && (
                    <section className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لیست دبیران</h3>
                            <button onClick={()=>{
                                 const id = Date.now();
                                 const n: Author = { id, name: '', avatar: '', bio: '', role: 'secretary' };
                                 updateTable('authors', [n, ...localData.authors]);
                                 setEditingItem({ type: 'Author', id });
                            }} className="text-[9px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full">+ دبیر جدید</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {localData.authors.filter((a:any)=>a.role === 'secretary').map((a:any) => (
                                <div key={a.id} onClick={() => setEditingItem({ type: 'Author', id: a.id })} className="bg-white p-3 rounded-2xl border flex items-center gap-3 cursor-pointer hover:border-primary shadow-sm transition-all group">
                                    <img src={a.avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                    <span className="text-[10px] font-black text-gray-700 truncate flex-1">{a.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete('authors', a.id); }} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[8px]"></i></button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {librarySubTab === 'books' && (
                    <section className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لیست کتاب‌های متنی</h3>
                            <button onClick={()=>{
                                const id = Date.now();
                                const n: Book = { id, title: '', authorId: localData.authors.find((a:any)=>a.role==='master')?.id || 1, cover: '', relatedEpisodes: [], categories: ["فلسفه"] };
                                updateTable('books', [n, ...localData.books]);
                                setEditingItem({ type: 'Book', id });
                            }} className="text-[9px] font-black text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full">+ کتاب جدید</button>
                        </div>
                        <div className="space-y-2">
                            {localData.books.map((bk: any) => (
                                <div key={bk.id} className="bg-white p-3 rounded-2xl border flex justify-between items-center shadow-sm hover:border-orange-200 transition-all group">
                                    <div className="flex items-center gap-4"><img src={bk.cover} className="w-9 h-12 rounded-lg object-cover shadow-sm" /><p className="text-[10px] font-black text-gray-800">{bk.title}</p></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingItem({ type: 'Book', id: bk.id })} className="bg-orange-50 text-orange-600 px-5 py-2 rounded-xl text-[10px] font-black hover:bg-orange-100 transition-colors">ویرایش</button>
                                        <button onClick={() => handleDelete('books', bk.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[10px]"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        );
    };

    const renderNashrPanel = () => {
        if (editingItem?.type === 'PublishedBook') {
            const b = localData.publishedBooks.find((x: any) => x.id === editingItem.id);
            if (!b) return null;
            const setField = (f: keyof PublishedBook, v: any) => updateTable('publishedBooks', localData.publishedBooks.map((i: any) => i.id === b.id ? { ...i, [f]: v } : i));
            return (
                <div className="p-4 space-y-4 animate-fadeIn pb-40">
                    <button onClick={() => setEditingItem(null)} className="text-blue-600 font-black text-[10px]">&larr; بازگشت</button>
                    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                        <FormField label="نوع اثر">
                            <select className="w-full bg-white border border-gray-200 rounded-xl h-11 px-2 text-[11px] font-black outline-none shadow-sm" value={b.type || 'book'} onChange={(e:any)=>setField('type', e.target.value)}>
                                <option value="book">کتاب</option>
                                <option value="note">یادداشت</option>
                            </select>
                        </FormField>
                        <FormField label="عنوان"><TextInput value={b.title} onChange={(e:any)=>setField('title', e.target.value)} /></FormField>
                        <FormField label="زیرعنوان"><TextInput value={b.subtitle} onChange={(e:any)=>setField('subtitle', e.target.value)} /></FormField>
                        {b.type !== 'note' && (
                            <FormField label="کاور اثر">
                                <div className="flex gap-2"><TextInput value={b.cover} onChange={(e:any)=>setField('cover', e.target.value)} /><UploadButton onUpload={(url:string)=>setField('cover', url)} /></div>
                            </FormField>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="قیمت (تومان)"><TextInput value={b.price} onChange={(e:any)=>setField('price', e.target.value)} /></FormField>
                            <FormField label="لینک فایل PDF">
                                <div className="flex gap-2">
                                    <TextInput value={b.pdfUrl} onChange={(e:any)=>setField('pdfUrl', e.target.value)} />
                                    <UploadButton accept=".pdf" icon="fa-file-pdf" onUpload={(url:string)=>setField('pdfUrl', url)} />
                                </div>
                            </FormField>
                        </div>
                        <FormField label="فهرست مطالب"><TextArea value={b.tableOfContents} onChange={(e:any)=>setField('tableOfContents', e.target.value)} rows={4} /></FormField>
                        <FormField label="مقدمه / متن محصول">
                            <div className="flex gap-2">
                                <TextArea label="توضیحات اثر" value={b.contentHtml || b.description} onChange={(e:any)=>setField('contentHtml', e.target.value)} />
                                <WordToHtmlButton onConverted={(html:string)=>setField('contentHtml', html)} />
                            </div>
                        </FormField>

                        <div className="pt-4 border-t">
                            <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">صوت‌های متصل شده</p>
                            <div className="space-y-1 mb-3">
                                {b.relatedAudioIds?.map((pid:number, i:number)=>(
                                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <span className="text-[9px] font-bold text-gray-600">شناسه مجموعه: {toPersianDigits(pid)}</span>
                                        <button onClick={()=>{const n=[...b.relatedAudioIds]; n.splice(i,1); setField('relatedAudioIds', n);}} className="text-red-400 text-xs p-1"><i className="fas fa-times-circle"></i></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={()=>setPickerConfig({ podcasts: localData.podcasts, onSelect: (ep:any)=>{ const n=[...(b.relatedAudioIds||[]), ep.podcastId]; setField('relatedAudioIds', Array.from(new Set(n))); } })} className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black border-2 border-dashed border-blue-100 hover:bg-blue-100 transition-colors shadow-sm">+ اتصال صوت جدید (مرورگر دو مرحله‌ای)</button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="p-4 space-y-4 pb-40">
                <button onClick={()=>{
                    const id = Date.now();
                    const n: PublishedBook = { id, title: '', subtitle: '', description: '', authorName: 'نشر سرای هنر و اندیشه', cover: '', price: '۰', type: 'book', relatedAudioIds: [] };
                    updateTable('publishedBooks', [n, ...localData.publishedBooks]);
                    setEditingItem({ type: 'PublishedBook', id });
                }} className="w-full py-4 bg-blue-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">+ محصول جدید در نشر</button>
                {localData.publishedBooks.map((b: any) => (
                    <div key={b.id} className="bg-white p-3 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-3">
                            <img src={b.cover || 'https://via.placeholder.com/100'} className="w-10 h-14 rounded-lg object-cover shadow-sm" />
                            <p className="font-black text-[11px] text-gray-800">{b.title || 'بی‌عنوان'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setEditingItem({ type: 'PublishedBook', id: b.id })} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-100 transition-colors">ویرایش</button>
                            <button onClick={() => handleDelete('publishedBooks', b.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[10px]"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderVideoPanel = () => {
        if (editingItem?.type === 'Video') {
            const v = localData.videos.find((x: any) => x.id === editingItem.id);
            if (!v) return null;
            const setField = (f: keyof Video, val: any) => updateTable('videos', localData.videos.map((i: any) => i.id === v.id ? { ...i, [f]: val } : i));
            return (
                <div className="p-4 space-y-4 animate-fadeIn pb-40">
                    <button onClick={() => setEditingItem(null)} className="text-secondary font-black text-[10px]">&larr; بازگشت</button>
                    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
                        <FormField label="عنوان ویدیو"><TextInput value={v.title} onChange={(e:any)=>setField('title', e.target.value)} /></FormField>
                        <FormField label="کاور ویدیو">
                            <div className="flex gap-2"><TextInput value={v.thumbnailUrl} onChange={(e:any)=>setField('thumbnailUrl', e.target.value)} /><UploadButton onUpload={(url:string)=>setField('thumbnailUrl', url)} /></div>
                        </FormField>
                        <FormField label="شناسه امبد (Aparat UID)"><TextInput value={v.embedId} onChange={(e:any)=>setField('embedId', e.target.value)} /></FormField>
                        <TextArea label="توضیحات" value={v.description} onChange={(e:any)=>setField('description', e.target.value)} />
                    </div>
                </div>
            );
        }
        return (
            <div className="p-4 space-y-4 pb-40">
                <div className="flex gap-2">
                    <div className="flex-1 bg-secondary/5 p-4 rounded-[2.5rem] border border-secondary/10 flex gap-2 shadow-inner">
                        <TextInput placeholder="لینک آپارات برای دریافت خودکار..." value={aparatUrl} onChange={(e: any) => setAparatUrl(e.target.value)} />
                        <button onClick={async () => {
                            const id = extractAparatId(aparatUrl); if (!id) return alert("لینک نامعتبر");
                            try {
                                const { details } = await fetchAparatVideoDetails(id);
                                const nv: Video = { id: details.uid, embedId: details.uid, title: details.title, description: details.description, thumbnailUrl: details.big_poster, viewCount: details.visit_cnt, uploadDate: details.sdate, duration: details.duration, categories: ["ویدیو"] };
                                updateTable('videos', [nv, ...localData.videos]); setAparatUrl(''); setEditingItem({ type: 'Video', id: nv.id });
                            } catch (e) { alert("خطا در دریافت"); }
                        }} className="bg-secondary text-white px-6 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all">دریافت</button>
                    </div>
                    <button onClick={() => {
                        const id = String(Date.now());
                        const nv: Video = { id, title: '', description: '', thumbnailUrl: '', embedId: '', viewCount: 0, uploadDate: '', duration: 0, categories: ["ویدیو"] };
                        updateTable('videos', [nv, ...localData.videos]); setEditingItem({ type: 'Video', id });
                    }} className="bg-gray-100 text-gray-600 px-4 rounded-2xl font-black text-[10px] transition-all hover:bg-gray-200 active:scale-95 shadow-sm flex items-center gap-1"><i className="fas fa-plus"></i> جدید</button>
                </div>
                {localData.videos.map((v: any) => (
                    <div key={v.id} className="bg-white p-2 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-secondary transition-all">
                        <div className="flex items-center gap-3"><img src={v.thumbnailUrl} className="w-16 h-10 rounded-lg object-cover shadow-sm"/><p className="text-[10px] font-black text-gray-700 truncate max-w-[150px]">{v.title}</p></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setEditingItem({ type: 'Video', id: v.id })} className="text-blue-500 font-black text-[9px] bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 transition-colors">ویرایش</button>
                            <button onClick={() => handleDelete('videos', v.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-trash text-[10px]"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCommunityPanel = () => {
        const filteredComments = localData.comments.filter((c: any) => c.text?.includes(communitySearch) || c.author?.includes(communitySearch));
        const filteredPosts = localData.posts.filter((p: any) => p.text?.includes(communitySearch) || p.author?.includes(communitySearch));
        return (
            <div className="p-4 space-y-4 pb-40">
                <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
                    {[
                        { id: 'comments', label: 'نظرات', icon: 'fa-comment-dots' },
                        { id: 'posts', label: 'پست‌ها', icon: 'fa-newspaper' }
                    ].map(sub => (
                        <button key={sub.id} onClick={() => setCommunitySubTab(sub.id as any)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${communitySubTab === sub.id ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 grayscale opacity-60'}`}>
                            <i className={`fas ${sub.icon}`}></i>
                            <span>{sub.label}</span>
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <TextInput placeholder="جستجو..." value={communitySearch} onChange={(e:any)=>setCommunitySearch(e.target.value)} />
                    <i className="fas fa-search absolute left-3 top-3.5 text-gray-300"></i>
                </div>
                {communitySubTab === 'comments' && (
                    <div className="space-y-3">
                        {filteredComments.length === 0 && <p className="text-center text-gray-400 text-[10px] font-black py-10">نظری یافت نشد</p>}
                        {filteredComments.map((c:any)=>(
                            <div key={c.id} className="bg-white p-4 rounded-3xl border shadow-sm flex items-start gap-4 animate-fadeIn group">
                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-[11px] flex-shrink-0 shadow-lg">{c.author?.charAt(0) || '?'}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-black text-gray-800">{c.author}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-gray-400 font-bold">{c.date}</span>
                                            {c.type && <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: c.type === 'podcast' ? '#fef3c7' : c.type === 'book' ? '#dbeafe' : '#fce7f3', color: c.type === 'podcast' ? '#d97706' : c.type === 'book' ? '#2563eb' : '#db2777' }}>{c.type}</span>}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{c.text}</p>
                                </div>
                                <button onClick={() => handleDelete('comments', c.id)} className="text-red-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"><i className="fas fa-times-circle"></i></button>
                            </div>
                        ))}
                    </div>
                )}
                {communitySubTab === 'posts' && (
                    <div className="space-y-3">
                        {filteredPosts.length === 0 && <p className="text-center text-gray-400 text-[10px] font-black py-10">پستی یافت نشد</p>}
                        {filteredPosts.map((p:any)=>(
                            <div key={p.id} className="bg-white p-4 rounded-3xl border shadow-sm flex items-start gap-4 animate-fadeIn group">
                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-[11px] flex-shrink-0 shadow-lg">{p.author?.charAt(0) || '?'}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-black text-gray-800">{p.author}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-gray-400 font-bold">{p.date}</span>
                                            {p.comments && <span className="text-[7px] text-gray-400 font-bold">{toPersianDigits(p.comments.length)} نظر</span>}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{p.text || '(بدون متن)'}</p>
                                    {p.media && p.media.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                            {p.media.map((m: any, i: number) => (
                                                m.type === 'image' ? <img key={i} src={m.url} className="w-12 h-12 rounded-lg object-cover border" /> : <span key={i} className="text-[8px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg"><i className="fas fa-video"></i></span>
                                            ))}
                                        </div>
                                    )}
                                    {p.videoId && <span className="text-[8px] text-blue-500 mt-1 inline-block"><i className="fas fa-video"></i> ویدیو</span>}
                                    {p.podcastId && <span className="text-[8px] text-amber-500 mt-1 inline-block mr-2"><i className="fas fa-podcast"></i> صوت</span>}
                                    {p.bookId && <span className="text-[8px] text-purple-500 mt-1 inline-block mr-2"><i className="fas fa-book"></i> کتاب</span>}
                                </div>
                                <button onClick={() => handleDelete('posts', p.id)} className="text-red-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"><i className="fas fa-times-circle"></i></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const isEditing = editingItem !== null;

    return (
        <div className="fixed inset-0 bg-gray-950/98 z-[4500] backdrop-blur-3xl flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-[#fcfdfe] w-full max-w-4xl h-full sm:h-[90vh] rounded-none sm:rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/5">
                <header className={`bg-white px-10 transition-all duration-300 border-b flex justify-between items-center flex-shrink-0 overflow-hidden ${isEditing ? 'h-0 opacity-0 py-0' : 'py-6 opacity-100'}`}>
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-900 rounded-[1.25rem] flex items-center justify-center text-white rotate-3 shadow-xl"><i className="fas fa-sliders-h"></i></div>
                        <div>
                            <h2 className="font-black text-gray-800 text-lg font-nastaliq">کنسول مدیریت سرای هنر و اندیشه</h2>
                            <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5 tracking-widest">Saraye Honar CMS V25.5</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 font-black text-xl transition-all">&times;</button>
                </header>

                <div className={`flex gap-1.5 bg-gray-50 border-b overflow-x-auto no-scrollbar flex-shrink-0 justify-center transition-all duration-300 ${isEditing ? 'h-0 opacity-0 p-0' : 'p-3 opacity-100'}`}>
                    {[
                        { id: 'sowt', label: 'صوت', icon: 'fa-microphone-alt', color: '#1ab394' },
                        { id: 'library', label: 'کتابخانه', icon: 'fa-book-open', color: '#f97316' },
                        { id: 'nashr', label: 'نشر', icon: 'fa-shopping-cart', color: '#2563eb' },
                        { id: 'videos', label: 'ویدیو', icon: 'fa-video', color: '#2e86c1' },
                        { id: 'community', label: 'محفل', icon: 'fa-comments', color: '#0d9488' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-[1.25rem] transition-all border-2 flex-shrink-0 w-20 ${activeTab === tab.id ? 'bg-white shadow-lg scale-105 active:scale-95' : 'bg-transparent border-transparent text-gray-300 grayscale opacity-60'}`}
                            style={{ borderColor: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? tab.color : '' }}
                        >
                            <i className={`fas ${tab.icon} text-base mb-1`}></i>
                            <span className="text-[9px] font-black uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar bg-[#f8f9fa] pb-40">
                    <div className="max-w-2xl mx-auto">
                        {activeTab === 'sowt' && renderSowtPanel()}
                        {activeTab === 'library' && renderLibraryPanel()}
                        {activeTab === 'nashr' && renderNashrPanel()}
                        {activeTab === 'videos' && renderVideoPanel()}
                        {activeTab === 'community' && renderCommunityPanel()}
                    </div>
                </div>

                <footer className="bg-white px-8 py-4 border-t flex gap-4 flex-shrink-0 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black hover:bg-gray-100 transition-all active:scale-95">انصراف</button>
                    <button onClick={() => { onSave(localData); onClose(); }} className="flex-[2] py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black shadow-xl shadow-primary/20 active:scale-95 transition-all">ذخیره و اعمال نهایی در دیتابیس</button>
                </footer>
            </div>
            {pickerConfig && <AudioPickerModal podcasts={localData.podcasts} onSelect={pickerConfig.onSelect} onClose={()=>setPickerConfig(null)} />}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white max-w-xs w-full rounded-[2rem] shadow-2xl p-6 text-center animate-slideInUp">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4"><i className="fas fa-exclamation-triangle text-xl"></i></div>
                        <h3 className="font-black text-gray-800 text-sm mb-2">تایید حذف</h3>
                        <p className="text-[10px] text-gray-500 font-bold mb-6">آیا از حذف این آیتم اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black hover:bg-gray-100 transition-all active:scale-95">انصراف</button>
                            <button onClick={confirmDeleteItem} className="flex-[2] py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black shadow-lg active:scale-95 transition-all hover:bg-red-600">حذف کن</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
