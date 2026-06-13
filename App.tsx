
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Podcast, Episode, Comment, Page, Post, Book, Author, PublishedBook, User, Video } from './types';
import { getPodcasts, getBooks, getAuthors, getVideos, getComments, getPosts, getPublishedBooks, createPost, deletePost as apiDeletePost, addPostComment, updatePost, deleteComment as apiDeleteComment, addComment, likeComment, updateLibrary, prefetchStream, getMe } from './services/api';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { OfflineDetector, NetworkErrorPage } from './components/ErrorPages';
import SearchModal from './components/SearchModal';

import Sidebar from './components/Sidebar';
import BottomTabs from './components/BottomTabs';
import MahfelSidebar from './components/MahfelSidebar';
import Toast from './components/Toast';
import LoadingPage from './pages/LoadingPage';
import NashrPage, { NoteDetailView, BookDetailView } from './pages/NashrPage';
import MinimizedPlayer from './components/MinimizedPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import IranAccessWarning from './components/IranAccessWarning';
import InstantView from './components/InstantView';

const SowtPage = React.lazy(() => import('./pages/SowtPage'));
const MatnPage = React.lazy(() => import('./pages/MatnPage'));
const VideoListPage = React.lazy(() => import('./pages/VideoListPage'));
const VideoPlayerPage = React.lazy(() => import('./pages/VideoPlayerPage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage'));
const MahfelPage = React.lazy(() => import('./pages/CommentsCommunityPage'));
const PlaylistPage = React.lazy(() => import('./pages/PlaylistPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const InterestsPage = React.lazy(() => import('./pages/InterestsPage'));
const AuthorPage = React.lazy(() => import('./pages/AuthorPage'));
const BookPage = React.lazy(() => import('./pages/BookPage'));
const PostCommentsPage = React.lazy(() => import('./pages/PostCommentsPage'));
import { formatTime } from './utils/helpers';

const AppInner: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [appState, setAppState] = useState<'initializing' | 'login' | 'interests' | 'ready'>('initializing');
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [publishedBooks, setPublishedBooks] = useState<PublishedBook[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [networkError, setNetworkError] = useState(false);
    const [activeTab, setActiveTab] = useState<Page>('mahfel');
    const [playlistTab, setPlaylistTab] = useState<'about' | 'episodes' | 'comments'>('episodes');
    
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    const [currentTrack, setCurrentTrack] = useState<{ podcast: Podcast; episode: Episode; episodeIndex: number } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(() => { try { return parseFloat(localStorage.getItem('soha_volume') || '0.8'); } catch { return 0.8; } });
    const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
    const [isShuffle, setIsShuffle] = useState(false);
    const [sleepTimer, setSleepTimer] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isWriting, setIsWriting] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    const [isPublicPost, setIsPublicPost] = useState(true);
    const [selectedAttachment, setSelectedAttachment] = useState<{ type: 'audio' | 'video' | 'book' | 'image', data: any, timestamp?: number } | null>(null);
    const [postMedia, setPostMedia] = useState<{ type: 'image' | 'video' | 'audio'; url: string }[]>([]);
    
    const [toast, setToast] = useState<{ id: number; message: string; image?: string; name?: string } | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tabsHidden, setTabsHidden] = useState(false);
    const [mahfelSidebarOpen, setMahfelSidebarOpen] = useState(false);
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
    const [showChatInput, setShowChatInput] = useState(false);
    const [chatInputText, setChatInputText] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const [instantView, setInstantView] = useState<{title: string, content: string} | null>(null);
    const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
    const [selectedPostPodcast, setSelectedPostPodcast] = useState<Podcast | null>(null);
    const [selectedVideoComment, setSelectedVideoComment] = useState<{ comment: Comment; video: Video } | null>(null);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [isVideoMini, setIsVideoMini] = useState(false);
    const [selectedPublishedBook, setSelectedPublishedBook] = useState<PublishedBook | null>(null);
    const [localVideoLibrary, setLocalVideoLibrary] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('soha_video_library') || '[]'); } catch { return []; }
    });
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

    const videoCurrentTimeRef = useRef(0);
    const videoPlayingRef = useRef(true);

    const handleVideoTimeUpdate = useCallback((time: number) => {
        videoCurrentTimeRef.current = time;
    }, []);

    const handleVideoPlay = useCallback(() => {
        videoPlayingRef.current = true;
    }, []);

    const handleVideoPause = useCallback(() => {
        videoPlayingRef.current = false;
    }, []);

    useEffect(() => {
        const newId = activeVideo ? (activeVideo.id || (activeVideo as any)._id) : null;
        if (newId !== activeVideoId) {
            setActiveVideoId(newId);
            videoCurrentTimeRef.current = 0;
            videoPlayingRef.current = true;
        }
    }, [activeVideo?.id, (activeVideo as any)?._id, activeVideoId]);

    // Author post editing state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editPostText, setEditPostText] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [p, b, a, v, c, po, pb] = await Promise.all([
                    getPodcasts(), getBooks(), getAuthors(), getVideos(), getComments(), getPosts(), getPublishedBooks(),
                ]);
                setPodcasts(p); setBooks(b); setAuthors(a); setVideos(v); setComments(c); setPublishedBooks(pb);
                setPosts([...po].sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()));
                
                const savedUser = localStorage.getItem('user_data');
                if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
                    const userData = JSON.parse(savedUser);
                    if (userData && userData.name) {
                        if (userData.library?.podcasts) {
                            userData.library.podcasts = userData.library.podcasts.filter((id: any) => id !== null && id !== undefined && String(id) !== 'NaN');
                        }
                        if (!userData.library?.episodes) {
                            if (!userData.library) userData.library = { podcasts: [], episodes: [], videos: [], books: [], notes: [] };
                            userData.library.episodes = [];
                        }
                        setUser(userData);
                        setIsAuthenticated(true);
                        setAppState(userData.interests && userData.interests.length > 0 ? 'ready' : 'interests');
                    } else {
                        setAppState('login');
                    }
                } else {
                    setAppState('login');
                }
            } catch (error) {
                console.error("Initialization error:", error);
                if (!navigator.onLine) {
                    setNetworkError(true);
                } else {
                    setAppState('login');
                }
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const syncLibrary = async () => {
            try {
                const res = await getMe();
                if (res?.user) {
                    setUser(prev => {
                        if (!prev) return prev;
                        const updated = { ...prev, library: res.user.library || prev.library };
                        localStorage.setItem('user_data', JSON.stringify(updated));
                        return updated;
                    });
                }
            } catch {}
        };
        if (isAuthenticated) syncLibrary();
    }, [isAuthenticated]);

    useEffect(() => {
        let mounted = true;
        const interval = setInterval(async () => {
            try {
                const fresh = await getComments();
                if (!mounted) return;
                setComments(prev => {
                    const prevStr = JSON.stringify(prev.map(c => ({ _id: (c as any)._id || c.id, text: c.text, likes: c.likes })));
                    const freshStr = JSON.stringify(fresh.map(c => ({ _id: (c as any)._id || c.id, text: c.text, likes: c.likes })));
                    if (prevStr === freshStr) return prev;
                    const merged = fresh.map(fc => {
                        const existing = prev.find(c => String((c as any)._id || c.id) === String(fc._id || fc.id));
                        return existing && existing.replies && existing.replies.length > 0
                            ? { ...fc, replies: existing.replies }
                            : fc;
                    });
                    merged.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
                    const replyMap = new Map<string, Comment[]>();
                    merged.forEach(c => {
                        if (c.parentId) {
                            if (!replyMap.has(c.parentId)) replyMap.set(c.parentId, []);
                            replyMap.get(c.parentId)!.push(c);
                        }
                    });
                    const roots = merged.filter(c => !c.parentId);
                    const addReplies = (list: Comment[]): Comment[] =>
                        list.map(c => {
                            const cid = String((c as any)._id || c.id);
                            const replies = replyMap.get(cid) || c.replies || [];
                            return { ...c, replies: addReplies(replies) };
                        });
                    return addReplies(roots);
                });
            } catch {}
        }, 5000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    useEffect(() => {
        if (!selectedVideoComment) return;
        const findInTree = (list: Comment[], targetId: string): Comment | null => {
            for (const c of list) {
                const cid = String((c as any)._id || c.id);
                if (cid === targetId) return c;
                if (c.replies) { const found = findInTree(c.replies, targetId); if (found) return found; }
            }
            return null;
        };
        const targetId = String((selectedVideoComment.comment as any)._id || selectedVideoComment.comment.id);
        const updated = findInTree(comments, targetId);
        if (updated && updated !== selectedVideoComment.comment) {
            setSelectedVideoComment({ comment: updated, video: selectedVideoComment.video });
        }
    }, [comments, selectedVideoComment]);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.ontimeupdate = () => {
                if(!audioRef.current) return;
                setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
            };
            audioRef.current.onloadedmetadata = () => {
                if(!audioRef.current) return;
                setAudioDuration(audioRef.current.duration);
            };
            audioRef.current.onended = () => {
                if (repeatMode === 'one') { audioRef.current?.play(); return; }
                if (repeatMode === 'all' || isShuffle) { playNext(); return; }
                setIsPlaying(false);
            };
        }
        audioRef.current.volume = volume;
    }, [repeatMode, isShuffle, volume]);

    // Close sidebar when image/video lightbox opens
    const prevCollapsedRef = useRef(desktopSidebarCollapsed);
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.open) {
                prevCollapsedRef.current = desktopSidebarCollapsed;
                setIsSidebarOpen(false);
                setDesktopSidebarCollapsed(true);
            } else {
                setDesktopSidebarCollapsed(prevCollapsedRef.current);
            }
        };
        window.addEventListener('lightbox-change', handler);
        return () => window.removeEventListener('lightbox-change', handler);
    }, [desktopSidebarCollapsed]);

    const handleLogin = (u: User, token?: string) => {
        setUser(u);
        setIsAuthenticated(true);
        if (token) localStorage.setItem('soha_token', token);
        localStorage.setItem('user_data', JSON.stringify(u));
        if (u.role === 'admin') setIsAdminOpen(true);
        setAppState(u.interests && u.interests.length > 0 ? 'ready' : 'interests');
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('soha_token');
        localStorage.removeItem('user_data');
        setAppState('login');
        setIsProfileOpen(false);
    };

    const playEpisode = useCallback((podcast: Podcast, index: number) => {
        const episode = podcast.episodes[index];
        if (!episode || !episode.audioUrl) return;
        setActiveVideo(null);
        setIsVideoMini(false);
        setCurrentTrack({ podcast, episode, episodeIndex: index });
        setIsPlayerExpanded(true);
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.ontimeupdate = () => {
                if(!audioRef.current) return;
                setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
            };
            audioRef.current.onloadedmetadata = () => {
                if(!audioRef.current) return;
                setAudioDuration(audioRef.current.duration);
            };
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onerror = () => {
                console.error('Audio error:', audioRef.current?.error?.message || 'unknown error', 'src:', audioRef.current?.src);
            };
        }
        try {
            const audioUrl = episode.audioUrl;
            const proxyUrl = `/api/proxy/audio?url=${encodeURIComponent(audioUrl)}`;
            console.log('Playing audio via proxy:', proxyUrl);
            audioRef.current.src = proxyUrl;
            audioRef.current.load();
            audioRef.current.play().then(() => {
                console.log('Playback started successfully');
                setIsPlaying(true);
            }).catch(e => console.error('Playback error:', e, proxyUrl));
        } catch(e) {
            console.error('Audio play failed:', e);
        }
    }, []);

    const togglePlay = () => {
        if (!currentTrack) return;
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.ontimeupdate = () => {
                if(!audioRef.current) return;
                setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
            };
            audioRef.current.onloadedmetadata = () => {
                if(!audioRef.current) return;
                setAudioDuration(audioRef.current.duration);
            };
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onerror = () => {
                console.error('Audio error:', audioRef.current?.error?.message || 'unknown');
            };
        }
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error); }
    };

    const playNext = useCallback(() => {
        if (!currentTrack) return;
        const { podcast, episodeIndex } = currentTrack;
        let nextIndex: number;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * podcast.episodes.length);
            if (nextIndex === episodeIndex && podcast.episodes.length > 1) {
                nextIndex = (nextIndex + 1) % podcast.episodes.length;
            }
        } else {
            nextIndex = episodeIndex + 1;
            if (repeatMode === 'all' && nextIndex >= podcast.episodes.length) nextIndex = 0;
        }
        if (nextIndex < podcast.episodes.length) {
            playEpisode(podcast, nextIndex);
        }
    }, [currentTrack, playEpisode, isShuffle, repeatMode]);

    const playPrev = useCallback(() => {
        if (!currentTrack) return;
        const { podcast, episodeIndex } = currentTrack;
        let prevIndex = episodeIndex - 1;
        if (prevIndex < 0 && repeatMode === 'all') prevIndex = podcast.episodes.length - 1;
        if (prevIndex >= 0) {
            playEpisode(podcast, prevIndex);
        }
    }, [currentTrack, playEpisode, repeatMode]);

    // Volume handler
    const handleVolumeChange = useCallback((v: number) => {
        setVolume(v);
        localStorage.setItem('soha_volume', String(v));
        if (audioRef.current) audioRef.current.volume = v;
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // Sleep timer
    useEffect(() => {
        if (sleepTimer === null) return;
        const id = setTimeout(() => {
            if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
            setSleepTimer(null);
        }, sleepTimer);
        return () => clearTimeout(id);
    }, [sleepTimer]);

    const handleClosePlayer = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); }
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioDuration(0);
        setCurrentTrack(null);
        setIsPlayerExpanded(false);
    }, []);

    const handlePlayVideo = useCallback((v: Video | null) => {
        if (audioRef.current) { audioRef.current.pause(); }
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioDuration(0);
        setCurrentTrack(null);
        setIsPlayerExpanded(false);
        setActiveVideo(v);
    }, []);

    const openWriteModalWithAttachment = (type: 'audio' | 'video' | 'book', data: any, timestamp?: number) => {
        setSelectedAttachment({ type, data, timestamp });
        setIsPublicPost(true);
        setIsWriting(true);
    };

    const handlePublishPost = async () => {
        if (!user) return;

        if (isPublicPost) {
            const postData: any = {
                text: newPostText,
                videoId: selectedAttachment?.type === 'video' ? selectedAttachment.data.id : undefined,
                podcastId: selectedAttachment?.type === 'audio' ? selectedAttachment.data.podcast.id : undefined,
                episodeIndex: selectedAttachment?.type === 'audio' ? selectedAttachment.data.episodeIndex : undefined,
                bookId: selectedAttachment?.type === 'book' ? selectedAttachment.data.id : undefined,
                timestamp: selectedAttachment?.timestamp,
                media: (selectedAttachment?.type === 'image' ? [{ type: 'image', url: selectedAttachment.data }] : postMedia.length > 0 ? postMedia : undefined),
            };
            const newPost = await createPost(postData);
            if (newPost) {
                setPosts([newPost, ...posts]);
            }
            if (selectedAttachment?.type === 'book') {
                const newComment = await addComment({ type: 'book', bookId: selectedAttachment.data.id, author: user.name, text: newPostText, authorAvatarUrl: user.avatar });
                if (newComment) {
                    setComments(prev => [newComment, ...prev]);
                }
            }
            setToast({ id: Date.now(), message: 'یادداشت شما در محفل منتشر شد' });
        } else {
            setToast({ id: Date.now(), message: 'یادداشت شما در بایگانی شخصی ذخیره شد' });
        }

        setIsWriting(false);
        setNewPostText('');
        setSelectedAttachment(null);
        setPostMedia([]);
        setActiveTab('mahfel');
    };

    const handleChatSend = async () => {
        if (!chatInputText.trim() || chatSending || !user) return;
        setChatSending(true);
        const postData = { text: chatInputText.trim() };
        const newPost = await createPost(postData);
        if (newPost) {
            setPosts([newPost, ...posts]);
            setChatInputText('');
        }
        setChatSending(false);
    };

    // Author: Edit own post
    const handleEditPost = async () => {
        if (!editingPost || !editPostText.trim()) return;
        const updated = await updatePost(String(editingPost.id), { text: editPostText });
        if (updated) {
            setPosts(posts.map(p => String(p.id) === String(editingPost.id) ? { ...p, text: editPostText, isEdited: true } : p));
            setToast({ id: Date.now(), message: 'پست ویرایش شد' });
        }
        setEditingPost(null);
        setEditPostText('');
    };

    // Author: Delete own post
    const handleDeletePost = async (postId: number) => {
        const ok = await apiDeletePost(String(postId));
        if (ok) {
            setPosts(posts.filter(p => p.id !== postId));
            setToast({ id: Date.now(), message: 'پست حذف شد' });
        }
    };

    // Delete a comment
    const handleDeleteComment = async (commentId: string) => {
        const ok = await apiDeleteComment(commentId);
        if (ok) {
            const removeFromTree = (list: Comment[]): Comment[] =>
                list.filter(c => {
                    const cid = String((c as any)._id || c.id);
                    return cid !== commentId;
                }).map(c => ({
                    ...c,
                    replies: c.replies ? removeFromTree(c.replies) : []
                }));
            setComments(prev => removeFromTree(prev));
            setToast({ id: Date.now(), message: 'نظر حذف شد' });
        }
    };

    const handleUpdateComment = (commentId: string, newText: string) => {
        const updateInTree = (list: Comment[]): Comment[] =>
            list.map(c => {
                const cid = String((c as any)._id || c.id);
                if (cid === commentId) return { ...c, text: newText, isEdited: true };
                if (c.replies && c.replies.length > 0) return { ...c, replies: updateInTree(c.replies) };
                return c;
            });
        setComments(prev => updateInTree(prev));
    };

    const handleLikeComment = async (commentId: string) => {
        const likedComments = new Set<string>(JSON.parse(localStorage.getItem('soha_liked_comments') || '[]'));
        const isLiked = likedComments.has(commentId);
        const newLikes = await likeComment(commentId);
        if (newLikes !== null) {
            const updateInTree = (list: Comment[]): Comment[] =>
                list.map(c => {
                    const cid = String((c as any)._id || c.id);
                    if (cid === commentId) return { ...c, likes: newLikes };
                    if (c.replies && c.replies.length > 0) return { ...c, replies: updateInTree(c.replies) };
                    return c;
                });
            setComments(prev => updateInTree(prev));
            if (isLiked) likedComments.delete(commentId); else likedComments.add(commentId);
            localStorage.setItem('soha_liked_comments', JSON.stringify([...likedComments]));
        }
    };

    const insertCommentIntoTree = (prev: Comment[], newComment: Comment): Comment[] => {
        const nc = { ...newComment, id: (newComment as any)._id || newComment.id, replies: [] as Comment[] };
        if (!nc.parentId) return [...prev, nc];
        const addReply = (list: Comment[]): Comment[] =>
            list.map(c => {
                const cid = String((c as any)._id || c.id);
                if (cid === String(nc.parentId)) {
                    return { ...c, replies: [...(c.replies || []), nc] };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: addReply(c.replies) };
                }
                return c;
            });
        return addReply(prev);
    };

    const handleVideoLike = useCallback((videoId: string, newLikes: number) => {
        setVideos(prev => prev.map(v => (String(v.id) === videoId || String((v as any)._id) === videoId) ? { ...v, likes: newLikes } : v));
    }, []);

    const handleToggleLibrary = async (videoId: string) => {
        const vid = String(videoId);
        const currentList = user?.library?.videos || localVideoLibrary;
        const isInLibrary = currentList.some(id => String(id) === vid);

        if (user) {
            const next = isInLibrary ? currentList.filter(id => String(id) !== vid) : [...currentList, vid];
            const updatedUser = { ...user, library: { ...user.library, videos: next } };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            try { await updateLibrary({ videos: next }); } catch {}
        } else {
            const next = isInLibrary ? localVideoLibrary.filter(id => String(id) !== vid) : [...localVideoLibrary, vid];
            setLocalVideoLibrary(next);
            localStorage.setItem('soha_video_library', JSON.stringify(next));
        }
    };

    const handleTogglePodcastLibrary = async () => {
        if (!currentTrack) return;
        const podcast = currentTrack.podcast;
        togglePodcastLibrary(podcast);
    };

    const togglePodcastLibrary = async (podcast: Podcast) => {
        const podcastId = String(podcast.id || (podcast as any)._id);
        const currentList: string[] = (user?.library?.podcasts || []).map(String);
        const isIn = currentList.includes(podcastId);
        const next = isIn ? currentList.filter(id => id !== podcastId) : [...currentList, podcastId];
        if (user) {
            const updatedUser = { ...user, library: { ...user.library, podcasts: next } };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            try { await updateLibrary({ podcasts: next }); } catch {}
        }
        setToast({ id: Date.now(), message: isIn ? 'پلی‌لیست از کتابخانه حذف شد' : 'پلی‌لیست در کتابخانه ذخیره گردید', image: String(podcast.cover || ''), name: String(podcast.title || '') });
    };

    const toggleEpisodeLibrary = async (podcastId: string, episodeIndex: number) => {
        const pid = String(podcastId);
        const currentList: { podcastId: string; episodeIndex: number }[] = user?.library?.episodes || [];
        const key = (e: { podcastId: string; episodeIndex: number }) => String(e.podcastId) === pid && e.episodeIndex === episodeIndex;
        const isIn = currentList.some(key);
        const next = isIn ? currentList.filter(e => !key(e)) : [...currentList, { podcastId: pid, episodeIndex }];
        if (user) {
            const updatedUser = { ...user, library: { ...user.library, episodes: next } };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            try { await updateLibrary({ episodes: next }); } catch {}
        }
        setToast({ id: Date.now(), message: isIn ? 'صوت از کتابخانه حذف شد' : 'صوت در کتابخانه ذخیره گردید', image: String((() => { const p = podcasts.find(p => String(p.id || (p as any)._id) === pid); return p?.episodes[episodeIndex]?.cover || p?.cover || ''; })()), name: String((() => { const p = podcasts.find(p => String(p.id || (p as any)._id) === pid); return p?.episodes[episodeIndex]?.title || ''; })()) });
    };

    const renderActivePage = () => {
        if (selectedPostForComments) {
            const freshPost = posts.find(p => String(p.id) === String(selectedPostForComments.id)) || selectedPostForComments;
            return <PostCommentsPage post={freshPost} video={videos.find(v => String(v.id) === String(freshPost.videoId))} podcast={selectedPostPodcast || podcasts.find(p => String(p.id) === String(freshPost.podcastId))} authors={authors} currentUser={user?.name} userRole={user?.role} onBack={() => { setSelectedPostForComments(null); setSelectedPostPodcast(null); }} onAddComment={async (postId, text, replyTo, media, quotedText, audioTimestamp, videoTimestamp) => {
                const updatedPost = await addPostComment(String(postId), text, replyTo as any, media, quotedText, audioTimestamp, videoTimestamp);
                if (updatedPost) {
                    setPosts(prev => {
                        const next = prev.map(p => String(p.id) === String(postId) ? { ...p, comments: updatedPost.comments } : p);
                        return next;
                    });
                    setSelectedPostForComments({ ...freshPost, comments: updatedPost.comments });
                }
            }} onUpdatePost={(p) => {
                setPosts(prev => prev.map(post => String(post.id) === String(p.id) ? p : post));
                setSelectedPostForComments(p);
            }} publishedBooks={publishedBooks} onShowBook={(book) => {}} onPlayEpisode={(p: Podcast, idx: number) => {
              if (currentTrack && String(currentTrack.podcast.id) === String(p.id) && currentTrack.episodeIndex === idx && audioRef.current) {
                audioRef.current.play().catch(()=>{});
                setIsPlaying(true);
              } else {
                const episode = p.episodes[idx];
                if (!episode || !episode.audioUrl) return;
                setCurrentTrack({ podcast: p, episode, episodeIndex: idx });
                if (!audioRef.current) {
                  audioRef.current = new Audio();
                  audioRef.current.ontimeupdate = () => { if(!audioRef.current) return; setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1)); };
                  audioRef.current.onloadedmetadata = () => { if(!audioRef.current) return; setAudioDuration(audioRef.current.duration); };
                  audioRef.current.onended = () => setIsPlaying(false);
                }
                const proxyUrl = `/api/proxy/audio?url=${encodeURIComponent(episode.audioUrl)}`;
                audioRef.current.src = proxyUrl;
                audioRef.current.load();
                audioRef.current.play().then(() => { setIsPlaying(true); }).catch(()=>{});
              }
              setIsPlayerExpanded(true);
            }} onSeekAudio={(seconds: number) => { if (audioRef.current) { audioRef.current.currentTime = seconds; audioRef.current.play().catch(()=>{}); setIsPlaying(true); } }} miniPlayerProps={currentTrack ? { track: currentTrack, isPlaying: isPlaying, progress: audioProgress, duration: audioDuration, onPlayPause: togglePlay, onNext: playNext, onPrev: playPrev, onExpand: () => setIsPlayerExpanded(true), onClose: handleClosePlayer, onSelectPodcast: setSelectedPodcast, isVisible: !isPlayerExpanded, theme } : undefined} />;
        }
        if (selectedVideoComment) {
            const vc = selectedVideoComment.comment;
            const v = selectedVideoComment.video;
            const virtualPost: Post = {
                id: 0,
                author: vc.author,
                authorAvatarUrl: (vc as any).authorAvatarUrl || '',
                date: vc.date || '',
                isoDate: vc.isoDate || '',
                text: vc.text,
                media: (vc as any).media || [],
                videoId: String(v._id || v.id),
                comments: (vc.replies || []).map((r: any) => ({ id: r._id || r.id, author: r.author, authorAvatarUrl: r.authorAvatarUrl || '', text: r.text, date: r.date || '', isoDate: r.isoDate || '', replyTo: r.parentId, quotedText: r.quotedText, likes: r.likes || 0, media: r.media || [], videoTimestamp: r.videoTimestamp, audioTimestamp: r.audioTimestamp })),
                likes: 0,
            };
            return <PostCommentsPage post={virtualPost} video={v} authors={authors} currentUser={user?.name} userRole={user?.role} onBack={() => setSelectedVideoComment(null)} onAddComment={async (_postId, text, replyTo, media, quoteText, _audioTimestamp) => {
                const newComment = await addComment({ type: 'video', videoId: String(v._id || v.id), author: user?.name || 'کاربر', text, parentId: replyTo ? String(replyTo) : vc._id || String(vc.id), authorAvatarUrl: user?.avatar, media: media as any, quotedText: quoteText } as any);
                if (newComment) {
                    setComments(prev => insertCommentIntoTree(prev, newComment));
                    setSelectedVideoComment(prev => {
                      if (!prev) return null;
                      const updatedReplies = [...(prev.comment.replies || []), newComment];
                      return { ...prev, comment: { ...prev.comment, replies: updatedReplies } };
                    });
                }
            }} onDeleteComment={handleDeleteComment} onLikeComment={handleLikeComment} onUpdateComment={handleUpdateComment} publishedBooks={publishedBooks} onShowBook={(book) => {}} onPlayEpisode={playEpisode} miniPlayerProps={currentTrack ? { track: currentTrack, isPlaying: isPlaying, progress: audioProgress, duration: audioDuration, onPlayPause: togglePlay, onNext: playNext, onPrev: playPrev, onExpand: () => setIsPlayerExpanded(true), onClose: handleClosePlayer, onSelectPodcast: setSelectedPodcast, isVisible: !isPlayerExpanded, theme } : undefined} />;
        }
        if (selectedPodcast) return <PlaylistPage podcast={selectedPodcast} author={authors.find(a => String(a.id) === String(selectedPodcast.speakerId))} comments={comments} onBack={() => { setSelectedPodcast(null); setSelectedAuthor(null); }} onPlayEpisode={playEpisode} onAuthorSelect={setSelectedAuthor} onAddComment={async (text, p, episodeIndex, parentId, audioTimestamp) => { const newComment = await addComment({ type: 'podcast', podcastId: p.id || (p as any)._id, author: user?.name || 'کاربر', text, episodeIndex, parentId, audioTimestamp, authorAvatarUrl: user?.avatar }); if (newComment) { setComments(prev => insertCommentIntoTree(prev, newComment)); } }} onDeleteComment={handleDeleteComment} onLikeComment={handleLikeComment} onUpdateComment={handleUpdateComment} currentUserName={user?.name} currentUserAvatar={user?.avatar} currentAudioTime={audioProgress * audioDuration} onSeekToTime={(s) => { if(audioRef.current) { audioRef.current.currentTime = s; audioRef.current.play().catch(()=>{}); } }} onPlayEpisodeAtTime={(p, epIdx, seekTime) => {
  const episode = p.episodes[epIdx];
  if (!episode || !episode.audioUrl) return;
  setCurrentTrack({ podcast: p, episode, episodeIndex: epIdx });
  setIsPlayerExpanded(false);
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.ontimeupdate = () => { if(!audioRef.current) return; setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1)); };
    audioRef.current.onloadedmetadata = () => { if(!audioRef.current) return; setAudioDuration(audioRef.current.duration); };
    audioRef.current.onended = () => setIsPlaying(false);
  }
  const proxyUrl = `/api/proxy/audio?url=${encodeURIComponent(episode.audioUrl)}`;
  audioRef.current.src = proxyUrl;
  audioRef.current.load();
  audioRef.current.play().then(() => {
    setIsPlaying(true);
    audioRef.current!.currentTime = seekTime;
  }).catch(()=>{});
}} hasPlayer={currentTrack !== null} isPlaying={isPlaying} onTogglePlay={togglePlay} onOpenPlayer={() => setIsPlayerExpanded(true)} onPlaylistTabChange={setPlaylistTab} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedPodcast(null); setSelectedAuthor(null); setSelectedBook(null); setSelectedPublishedBook(null); setShowChatInput(false); }} theme={theme} onToggleTheme={toggleTheme} onOpenProfile={() => setIsProfileOpen(true)} onToggleLibrary={(podcast: Podcast) => togglePodcastLibrary(podcast)} isInLibrary={selectedPodcast ? (user?.library?.podcasts || []).includes(String(selectedPodcast.id || (selectedPodcast as any)._id)) : false} onPrev={playPrev} onNext={playNext} audioProgress={audioProgress} audioDuration={audioDuration} isSidebarOpen={isSidebarOpen} onCloseSidebar={() => setIsSidebarOpen(false)} onOpenSearch={() => setIsSearchOpen(true)} onOpenAdmin={() => setIsAdminOpen(true)} user={user} isAuthenticated={isAuthenticated} isSidebarCollapsed={desktopSidebarCollapsed} onToggleSidebarCollapsed={setDesktopSidebarCollapsed} />;
        if (selectedAuthor) return <AuthorPage author={selectedAuthor} allBooks={books} allPodcasts={podcasts} allVideos={videos} onBack={() => setSelectedAuthor(null)} onBookSelect={setSelectedBook} onPlayEpisode={playEpisode} />;
        if (selectedBook) return <BookPage book={selectedBook} allPodcasts={podcasts} authors={authors} onBack={() => setSelectedBook(null)} onPlayEpisode={playEpisode} onAuthorSelect={setSelectedAuthor} />;
        if (selectedPublishedBook) {
            if (selectedPublishedBook.type === 'note') return <NoteDetailView note={selectedPublishedBook} allPodcasts={podcasts} comments={comments} onAddComment={(text, n) => openWriteModalWithAttachment('book', n)} onClose={() => setSelectedPublishedBook(null)} />;
            return <BookDetailView book={selectedPublishedBook} allPodcasts={podcasts} onClose={() => setSelectedPublishedBook(null)} comments={comments} onAddComment={(text, b) => openWriteModalWithAttachment('book', b)} />;
        }
        const currentVideoId = activeVideo ? (activeVideo.id || (activeVideo as any)._id) : null;
        const renderVideoInitialTime = currentVideoId === activeVideoId ? videoCurrentTimeRef.current : 0;

        if (activeVideo && !isVideoMini) {
            return <VideoPlayerPage video={activeVideo} allVideos={videos} comments={comments} authors={authors} isMini={false} initialTime={renderVideoInitialTime} onBack={() => { setIsVideoMini(true); }} onVideoSelect={handlePlayVideo} onAddComment={async (text, v, videoTimestamp, parentId, _audioTimestamp) => {
                const newComment = await addComment({ type: 'video', videoId: v.id || (v as any)._id, author: user?.name || 'کاربر', text, videoTimestamp, parentId, authorAvatarUrl: user?.avatar });
                if (newComment) {
                    setComments(prev => insertCommentIntoTree(prev, newComment));
                }
            }} onAuthorSelect={setSelectedAuthor} onPlayVideo={(v) => { handlePlayVideo(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }} userLibrary={user?.library?.videos || localVideoLibrary} onToggleLibrary={handleToggleLibrary} onShare={(t, s) => {}} onShowInstantView={(t, c) => setInstantView({ title: t, content: c })} userRole={user?.role} currentUserName={user?.name} onDeleteComment={handleDeleteComment} onLikeComment={handleLikeComment} onUpdateComment={handleUpdateComment} onVideoTimeUpdate={handleVideoTimeUpdate} onVideoPlay={handleVideoPlay} onVideoPause={handleVideoPause} onVideoLike={handleVideoLike} />;
        }

        switch (activeTab) {
            case 'mahfel': return <MahfelPage tabsHidden={tabsHidden} showInput={showChatInput} onToggleInput={setShowChatInput} posts={posts} videos={videos} podcasts={podcasts} authors={authors} publishedBooks={publishedBooks} comments={comments} currentUser={user?.name} userRole={user?.role} onPlayVideoFromFeed={(v: Video) => { setIsVideoMini(false); handlePlayVideo(v);             }} onPlayPodcastFromFeed={playEpisode} onPlayPodcastComment={(p: Podcast, epIdx: number, seekTime?: number, expandPlayer: boolean = true) => {
              if (currentTrack && String(currentTrack.podcast.id) === String(p.id) && currentTrack.episodeIndex === epIdx && audioRef.current) {
                if (seekTime != null) audioRef.current.currentTime = seekTime;
                audioRef.current.play().catch(()=>{});
                setIsPlaying(true);
              } else {
                const episode = p.episodes[epIdx];
                if (!episode || !episode.audioUrl) return;
                setCurrentTrack({ podcast: p, episode, episodeIndex: epIdx });
                if (!audioRef.current) {
                  audioRef.current = new Audio();
                  audioRef.current.ontimeupdate = () => { if(!audioRef.current) return; setAudioProgress(audioRef.current.currentTime / (audioRef.current.duration || 1)); };
                  audioRef.current.onloadedmetadata = () => { if(!audioRef.current) return; setAudioDuration(audioRef.current.duration); };
                  audioRef.current.onended = () => setIsPlaying(false);
                }
                const proxyUrl = `/api/proxy/audio?url=${encodeURIComponent(episode.audioUrl)}`;
                audioRef.current.src = proxyUrl;
                audioRef.current.load();
                audioRef.current.play().then(() => {
                  setIsPlaying(true);
                  if (seekTime != null) audioRef.current!.currentTime = seekTime;
                }).catch(()=>{});
              }
              if (expandPlayer) setIsPlayerExpanded(true);
            }} onShowComments={(p: Post, podcast?: Podcast) => { setSelectedPostForComments(p); setSelectedPostPodcast(podcast || null); }} onShowVideoDiscussion={(c: Comment, v: Video) => setSelectedVideoComment({ comment: c, video: v })} onDeletePost={handleDeletePost} onShowBook={(b: PublishedBook) => { setSelectedPublishedBook(b); }} onShowInstantView={(title: string, content: string) => setInstantView({ title, content })} onDeleteComment={handleDeleteComment} onLikeComment={handleLikeComment} onUpdateComment={handleUpdateComment} onAddComment={async (text: string, v: any, videoTimestamp?: number, parentId?: string, audioTimestamp?: number) => {
                const newComment = await addComment({ type: 'video', videoId: v.id || v._id, author: user?.name || 'کاربر', text, videoTimestamp, parentId, authorAvatarUrl: user?.avatar, audioTimestamp });
                if (newComment) {
                    setComments(prev => insertCommentIntoTree(prev, newComment));
                }
            }} onNewPost={(p: Post) => setPosts([p, ...posts])} onUpdatePost={(p: Post) => setPosts(posts.map(post => post.id === p.id ? p : post))} user={user} onOpenSearch={() => setIsSearchOpen(true)} onOpenProfile={() => setIsProfileOpen(true)}             onToggleSidebar={() => {
              if (window.innerWidth >= 1024) {
                setDesktopSidebarCollapsed(v => !v);
              } else {
                setMahfelSidebarOpen(v => !v);
              }
            }}
            miniPlayerProps={currentTrack ? {
              track: currentTrack, isPlaying, progress: audioProgress,
              onPlayPause: togglePlay, onNext: playNext, onPrev: playPrev,
              onExpand: () => setIsPlayerExpanded(true), onClose: handleClosePlayer,
              onSelectPodcast: setSelectedPodcast, isVisible: true,
              onToggleLibrary: () => togglePodcastLibrary(currentTrack.podcast),
              isInLibrary: (user?.library?.podcasts || []).includes(String(currentTrack.podcast.id || (currentTrack.podcast as any)._id)),
              theme,
            } : null}
            />;
            case 'sowt': return <SowtPage podcasts={podcasts} authors={authors} liveStream={{ isLive: false, title: '', url: '' }} onPodcastSelect={setSelectedPodcast} onPlay={playEpisode} userInterests={user?.interests || []} isHeaderVisible={true} onAuthorSelect={setSelectedAuthor} userLibrary={user?.library?.podcasts || []} onToggleLibrary={(id: number) => {}} onShare={(t: string, s: string) => {}} onToggleSidebar={() => setDesktopSidebarCollapsed(v => !v)} theme={theme} onToggleTheme={toggleTheme} onOpenProfile={() => setIsProfileOpen(true)} user={user} />;
            case 'matn': return <MatnPage authors={authors} books={books} onBookSelect={setSelectedBook} onAuthorSelect={setSelectedAuthor} />;
            case 'videos': return <VideoListPage videos={videos} initialVideoToPlay={null} onVideoPlayed={() => {}} isHeaderVisible={true} onVideoSelect={(v) => { setIsVideoMini(false); handlePlayVideo(v); }} activeVideo={null} isPlayerInline={false} allVideos={videos} comments={comments} onAddComment={async (text: string, v: any, videoTimestamp?: number, parentId?: string, _audioTimestamp?: number) => {
                const newComment = await addComment({ type: 'video', videoId: v.id || (v as any)._id, author: user?.name || 'کاربر', text, videoTimestamp, parentId, authorAvatarUrl: user?.avatar });
                if (newComment) {
                    setComments(prev => insertCommentIntoTree(prev, newComment));
                }
            }} onEnterStandalone={() => {}} onShowInstantView={(t, c) => setInstantView({ title: t, content: c })} userLibrary={user?.library?.videos || localVideoLibrary} onToggleLibrary={handleToggleLibrary} onShare={(t: string, s: string) => {}} onOpenSearch={() => setIsSearchOpen(true)} onOpenSidebar={() => setDesktopSidebarCollapsed(v => !v)} onProfileClick={() => setIsProfileOpen(true)} user={user} theme={theme} onToggleTheme={toggleTheme} />;
            case 'nashr': return <NashrPage publishedBooks={publishedBooks} allPodcasts={podcasts} comments={comments} onAddComment={(text, book) => openWriteModalWithAttachment('book', book)} user={user} onUpdateUser={(u) => { setUser(u); localStorage.setItem('user_data', JSON.stringify(u)); }} onDeleteComment={handleDeleteComment} onLikeComment={handleLikeComment} onUpdateComment={handleUpdateComment} onToggleSidebar={() => setDesktopSidebarCollapsed(v => !v)} />;
            case 'library': return <LibraryPage savedVideoIds={user?.library?.videos || localVideoLibrary} allVideos={videos} onPlayVideo={(v) => { setIsVideoMini(false); handlePlayVideo(v); }} onRemoveVideo={(id) => handleToggleLibrary(id)} savedPodcastIds={user?.library?.podcasts || []} savedEpisodes={user?.library?.episodes || []} allPodcasts={podcasts} authors={authors} onSelectPodcast={setSelectedPodcast} onRemovePodcast={(p) => togglePodcastLibrary(p)} onRemoveEpisode={(podcastId, episodeIndex) => toggleEpisodeLibrary(podcastId, episodeIndex)} onPlayPodcast={(podcast, idx) => playEpisode(podcast, idx)} theme={theme} onToggleTheme={toggleTheme} user={user} onOpenProfile={() => setIsProfileOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} onToggleSidebar={() => setDesktopSidebarCollapsed(v => !v)} />;
            default: return null;
        }
    };

    if (appState === 'initializing' || isLoadingData) return <LoadingPage />;
    if (networkError) return <NetworkErrorPage onRetry={() => { setNetworkError(false); window.location.reload(); }} />;
    if (appState === 'login') return <LoginPage onLoginSuccess={handleLogin} />;
    if (appState === 'interests') return <InterestsPage onInterestsSelected={(interests) => { if(user) { const u = {...user, interests}; setUser(u); handleLogin(u); } }} />;

    const miniPlayerVideoId = activeVideo ? (activeVideo.id || (activeVideo as any)._id) : null;
    const miniPlayerInitialTime = miniPlayerVideoId === activeVideoId ? videoCurrentTimeRef.current : 0;

    return (
        <div className={`bg-background flex flex-col relative font-sans text-text-primary ${theme === 'dark' ? 'dark' : ''}`} dir="rtl" style={{ height: '100vh', overflow: 'hidden' }}>
             <IranAccessWarning />
             <div className="app-container bg-background flex-1 flex min-h-0">
             
             {/* Desktop Sidebar */}
              <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedPodcast(null); setSelectedAuthor(null); setSelectedBook(null); setSelectedPublishedBook(null); setIsPlayerExpanded(false); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} theme={theme} onToggleTheme={toggleTheme} onOpenSearch={() => setIsSearchOpen(true)} onOpenAdmin={() => setIsAdminOpen(true)} onOpenProfile={() => setIsProfileOpen(true)} user={user} isAuthenticated={isAuthenticated} collapsed={desktopSidebarCollapsed} onToggleCollapsed={setDesktopSidebarCollapsed} />

              {/* Main Content */}
               <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

              
               <div className={`flex-1 ${activeTab === 'mahfel' ? 'pb-0' : 'pb-16 lg:pb-0'}`}>
                 <Suspense fallback={<LoadingPage />}>{renderActivePage()}</Suspense>
             </div>
             
              {isWriting && (
                <div className="fixed inset-0 z-[5000] animate-fadeIn flex flex-col bg-white dark:bg-gray-900">
                    <header className="flex justify-between items-center p-6 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
                        <button onClick={() => { setIsWriting(false); setSelectedAttachment(null); setPostMedia([]); }} className="text-gray-400 text-xl w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-all">&times;</button>
                        <h3 className="font-black text-sm text-gray-800 dark:text-gray-100">نوشتن یادداشت / پست</h3>
                        <button onClick={handlePublishPost} disabled={!newPostText.trim() && !selectedAttachment && postMedia.length === 0} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all">انتشار</button>
                    </header>
                    <div className="flex-1 p-8 flex flex-col no-scrollbar bg-white dark:bg-gray-900 overflow-y-auto">
                        <textarea autoFocus value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="نکته یا اندیشه خود را بنویسید..." className="w-full text-lg outline-none resize-none text-right font-medium min-h-[150px] mb-6 text-gray-900 dark:text-gray-100 bg-transparent flex-1" />
                        <div className="space-y-6">
                            {selectedAttachment && selectedAttachment.type !== 'image' && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] flex items-center gap-4 animate-scaleIn shadow-sm">
                                    <div className="flex-1 flex items-center gap-4">
                                        <img src={selectedAttachment.type === 'audio' ? selectedAttachment.data.episode.cover || selectedAttachment.data.podcast.cover : (selectedAttachment.type === 'video' ? selectedAttachment.data.thumbnailUrl : selectedAttachment.data.cover)} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                        <div className="text-right flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                                                {selectedAttachment.type === 'audio' ? `صوت (لحظه ${formatTime(selectedAttachment.timestamp || 0)})` : (selectedAttachment.type === 'video' ? 'ویدیو' : 'نشر سرای هنر و اندیشه')}
                                            </p>
                                            <p className="font-black text-gray-800 dark:text-gray-100 text-[12px] mt-1 truncate leading-tight">
                                                {selectedAttachment.type === 'audio' ? selectedAttachment.data.episode.title : selectedAttachment.data.title}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedAttachment(null)} className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center text-gray-400">&times;</button>
                                </div>
                            )}
                            {postMedia.map((m, i) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center gap-3 animate-scaleIn">
                                    {m.type === 'image' ? (
                                        <img src={m.url} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="" />
                                    ) : m.type === 'audio' ? (
                                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg shadow-sm"><i className="fas fa-music"></i></div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg shadow-sm"><i className="fas fa-video"></i></div>
                                    )}
                                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-right">{m.type === 'image' ? 'تصویر' : m.type === 'audio' ? 'صوت' : 'ویدیو'}</span>
                                    <button onClick={() => setPostMedia(prev => prev.filter((_, j) => j !== i))} className="w-8 h-8 rounded-full bg-gray-200/50 flex items-center justify-center text-gray-400 text-sm">&times;</button>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <span className="text-xs font-black text-gray-700 dark:text-gray-300">انتشار عمومی در محفل سرای هنر و اندیشه</span>
                                <button onClick={() => setIsPublicPost(!isPublicPost)} className={`w-12 h-6 rounded-full relative transition-colors ${isPublicPost ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublicPost ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            {selectedAttachment?.type !== 'book' && (
                            <div className="flex gap-3 flex-wrap">
                                <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 text-xs font-black border-2 border-dashed min-w-[120px]" style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>
                                    <i className="fas fa-image"></i>
                                    تصویر
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const dataUrl = ev.target?.result as string;
                                            setPostMedia(prev => [...prev, { type: 'image', url: dataUrl }]);
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                    }} />
                                </label>
                                <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 text-xs font-black border-2 border-dashed min-w-[120px]" style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>
                                    <i className="fas fa-microphone"></i>
                                    صوت
                                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const dataUrl = ev.target?.result as string;
                                            setPostMedia(prev => [...prev, { type: 'audio', url: dataUrl }]);
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                    }} />
                                </label>
                                <button onClick={() => {
                                    const url = prompt('لینک ویدیو را وارد کنید:');
                                    if (url && url.trim()) {
                                        setPostMedia(prev => [...prev, { type: 'video', url: url.trim() }]);
                                    }
                                }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 text-xs font-black border-2 border-dashed min-w-[120px]" style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>
                                    <i className="fas fa-video"></i>
                                    ویدیو
                                </button>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
             )}

             {/* Edit Post Modal (Author) */}
             {editingPost && (
                <div className="fixed inset-0 z-[5000] animate-fadeIn flex flex-col bg-white dark:bg-gray-900">
                    <header className="flex justify-between items-center p-6 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
                        <button onClick={() => { setEditingPost(null); setEditPostText(''); }} className="text-gray-400 text-xl w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-all">&times;</button>
                        <h3 className="font-black text-sm text-gray-800 dark:text-gray-100">ویرایش پست</h3>
                        <button onClick={handleEditPost} disabled={!editPostText.trim()} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">ذخیره</button>
                    </header>
                    <div className="flex-1 p-8">
                        <textarea autoFocus value={editPostText} onChange={(e) => setEditPostText(e.target.value)} className="w-full text-lg outline-none resize-none text-right font-medium min-h-[200px] text-gray-900 dark:text-gray-100 bg-transparent" />
                    </div>
                </div>
             )}

             {currentTrack && (
                <>
                    {(!selectedPodcast || playlistTab !== 'comments') && !(activeTab === 'mahfel' && window.innerWidth >= 1024) && <MinimizedPlayer track={currentTrack} isPlaying={isPlaying} progress={audioProgress} onPlayPause={togglePlay} onNext={playNext} onPrev={playPrev} onExpand={() => setIsPlayerExpanded(true)} onClose={handleClosePlayer} onSelectPodcast={setSelectedPodcast} isVisible={!isPlayerExpanded} onToggleLibrary={() => togglePodcastLibrary(currentTrack.podcast)} isInLibrary={(user?.library?.podcasts || []).includes(String(currentTrack.podcast.id || (currentTrack.podcast as any)._id))} bottomOffset={selectedPodcast ? 24 : 70} theme={theme} />}
                    {isPlayerExpanded && (
                      <FullScreenPlayer 
                        track={currentTrack} isPlaying={isPlaying} progress={audioProgress} duration={audioDuration || 1} authors={authors} onPlayPause={togglePlay} 
                        onSeek={(p) => { if(audioRef.current) audioRef.current.currentTime = p * audioDuration; }} 
                        onMinimize={() => setIsPlayerExpanded(false)} onClose={handleClosePlayer} onNext={playNext} onPrev={playPrev} 
                        comments={comments.filter(c => c.type === 'podcast' && c.podcastId === (currentTrack.podcast.id || (currentTrack.podcast as any)._id))}
                        onAddComment={async (text, track, ts, parentId) => {
                          const newComment = await addComment({ type: 'podcast', podcastId: track.podcast.id || (track.podcast as any)._id, episodeIndex: track.episodeIndex, author: user?.name || 'کاربر', text, timestamp: ts, parentId, authorAvatarUrl: user?.avatar });
                          if (newComment) { setComments(prev => insertCommentIntoTree(prev, newComment)); }
                        }}
                        playbackRate={playbackRate} onPlaybackRateChange={setPlaybackRate} onOpenFile={()=>{}} 
                        onShowInstantView={(t,c)=>setInstantView({title:t,content:c})} onToggleLibrary={handleTogglePodcastLibrary}
                        isInLibrary={(user?.library?.podcasts || []).includes(String(currentTrack.podcast.id || (currentTrack.podcast as any)._id))}
                        onDeleteComment={handleDeleteComment} onUpdateComment={handleUpdateComment} onLikeComment={handleLikeComment} currentUserName={user?.name}
                        volume={volume} onVolumeChange={handleVolumeChange}
                        repeatMode={repeatMode} onRepeatModeChange={setRepeatMode}
                        isShuffle={isShuffle} onShuffleToggle={() => setIsShuffle(v => !v)}
                        sleepTimer={sleepTimer} onSleepTimer={setSleepTimer}
                        onPlayEpisode={(podcast, idx) => { setIsPlayerExpanded(true); playEpisode(podcast, idx); }}
                        activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedPodcast(null); setSelectedAuthor(null); setSelectedBook(null); setSelectedPublishedBook(null); setShowChatInput(false); }} theme={theme} onToggleTheme={toggleTheme} onOpenProfile={() => setIsProfileOpen(true)}
                        podcasts={podcasts}
                        onToggleEpisode={(podcastId: string, episodeIndex: number) => toggleEpisodeLibrary(podcastId, episodeIndex)}
                        isEpisodeInLibrary={(podcastId: string, episodeIndex: number) => (user?.library?.episodes || []).some(e => String(e.podcastId) === String(podcastId) && e.episodeIndex === episodeIndex)}
                      />
                    )}
                </>
             )}

              {activeVideo && isVideoMini && (
                <VideoPlayerPage
                  video={activeVideo}
                  allVideos={videos}
                  comments={comments}
                  authors={authors}
                  isMini={true}
                  initialTime={miniPlayerInitialTime}
                  onBack={() => setIsVideoMini(false)}
                  onCloseMini={() => { setActiveVideo(null); setIsVideoMini(false); }}
                  onVideoSelect={(v) => { setIsVideoMini(false); handlePlayVideo(v); }}
                  onAddComment={async (text, v, videoTimestamp, parentId, _audioTimestamp) => {
                    const newComment = await addComment({ type: 'video', videoId: v.id || (v as any)._id, author: user?.name || 'کاربر', text, videoTimestamp, parentId, authorAvatarUrl: user?.avatar });
                    if (newComment) {
                      setComments(prev => insertCommentIntoTree(prev, newComment));
                    }
                  }}
                  onAuthorSelect={setSelectedAuthor}
onPlayVideo={(v) => { setIsVideoMini(false); handlePlayVideo(v); }}
                  userLibrary={user?.library?.videos || localVideoLibrary}
                  onToggleLibrary={handleToggleLibrary}
                  onShare={() => {}}
                  onShowInstantView={(t, c) => setInstantView({ title: t, content: c })}
                  userRole={user?.role}
                  currentUserName={user?.name}
                  onDeleteComment={handleDeleteComment}
                  onLikeComment={handleLikeComment}
                  onVideoTimeUpdate={handleVideoTimeUpdate}
                  onVideoPlay={handleVideoPlay}
                  onVideoPause={handleVideoPause}
                  onVideoLike={handleVideoLike}
                />
              )}
             {instantView && <InstantView title={instantView.title} content={instantView.content} onClose={() => setInstantView(null)} />}
             {isAdminOpen && <AdminPage onClose={() => setIsAdminOpen(false)} currentPodcasts={podcasts} currentVideos={videos} currentPublishedBooks={publishedBooks} currentAuthors={authors} currentBooks={books} currentComments={comments} currentPosts={posts} onSave={(data: any) => { setPodcasts(data.podcasts); setVideos(data.videos); setPublishedBooks(data.publishedBooks); setAuthors(data.authors); setBooks(data.books); setPosts(data.posts); setComments(data.comments); }} />}
             {isProfileOpen && user && <UserProfilePage onClose={() => setIsProfileOpen(false)} onLogout={handleLogout} user={user} allPodcasts={podcasts} allVideos={videos} onPlayPodcast={playEpisode} onPlayVideo={(v) => { handlePlayVideo(v); setIsProfileOpen(false); }} onEditPost={(post: Post) => { setEditingPost(post); setEditPostText(post.text || ''); setIsProfileOpen(false); }} onDeletePost={handleDeletePost} onUpdateUser={(u) => { setUser(u); localStorage.setItem('user_data', JSON.stringify(u)); }} />}
             
             <SearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                podcasts={podcasts}
                videos={videos}
                books={books}
                authors={authors}
                publishedBooks={publishedBooks}
                onPodcastSelect={setSelectedPodcast}
                onVideoSelect={(v) => { handlePlayVideo(v); setIsSearchOpen(false); }}
                onBookSelect={setSelectedBook}
                onAuthorSelect={setSelectedAuthor}
             />
             
                {appState === 'ready' && !isWriting && activeTab !== 'mahfel' && !selectedPodcast && !isPlayerExpanded && (
                   <BottomTabs activeTab={activeTab} onTabChange={(tab) => {
                       if (tab === 'mahfel' && activeTab === 'mahfel') {
                           setShowChatInput(v => !v);
                       } else {
                           setActiveTab(tab);
                           setShowChatInput(false);
                       }
                   }} onLongPressCentral={() => setIsWriting(true)} newMahfelMessages={0} userRole={user?.role} hidden={tabsHidden || !!selectedPodcast || isPlayerExpanded} onToggle={setTabsHidden} chatInput={showChatInput && activeTab === 'mahfel'} chatInputText={chatInputText} onChatInputChange={setChatInputText} onChatSend={handleChatSend} onChatClose={() => setShowChatInput(false)} chatSending={chatSending} theme={theme} />
              )}
              {appState === 'ready' && activeTab === 'mahfel' && (
                 <MahfelSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedPodcast(null); setSelectedAuthor(null); setSelectedBook(null); setSelectedPublishedBook(null); setShowChatInput(false); }} open={mahfelSidebarOpen} onOpenChange={setMahfelSidebarOpen} theme={theme} onToggleTheme={toggleTheme} onOpenProfile={() => setIsProfileOpen(true)} />
              )}
             
              {toast && <Toast key={toast.id} message={toast.message} image={toast.image} name={toast.name} onClose={() => setToast(null)} />}
              </div>
             </div>
        </div>
    );
};

const App: React.FC = () => (
    <ErrorBoundary>
        <ThemeProvider>
            <OfflineDetector>
                <AppInner />
            </OfflineDetector>
        </ThemeProvider>
    </ErrorBoundary>
);

export default App;
