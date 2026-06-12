import type { Video } from '../types';

export interface AparatVideoData {
    uid: string;
    title: string;
    description: string;
    username: string;
    big_poster: string;
    visit_cnt: number;
    sdate: string;
    duration: number;
}

export interface AparatVideoLink {
    profile: string;
    url: string;
}

interface AparatApiResponse {
    video: AparatVideoData & {
        file_link_all: AparatVideoLink[];
        file_link?: string;
    };
}

export interface AparatApiResult {
    details: AparatVideoData;
    links: AparatVideoLink[];
}


export const fetchAparatVideoDetails = async (videoId: string, signal?: AbortSignal): Promise<AparatApiResult> => {
    try {
        const aparatApiUrl = `https://www.aparat.com/etc/api/video/videohash/${videoId}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(aparatApiUrl)}`;

        const response = await fetch(proxyUrl, { signal });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}. Check if the video exists and is public.`);
        }

        const data: AparatApiResponse = await response.json();
        
        if (!data || !data.video || !data.video.uid) {
             throw new Error('Video not found or invalid data format from Aparat API.');
        }
        
        const videoData = data.video;

        const links = videoData.file_link_all && videoData.file_link_all.length > 0
            ? videoData.file_link_all
            : videoData.file_link ? [{ profile: 'default', url: videoData.file_link }] : [];

        if (links.length === 0) {
            throw new Error('No video file URL found in API response.');
        }

        const details: AparatVideoData = {
            uid: videoData.uid,
            title: videoData.title,
            description: videoData.description,
            username: videoData.username,
            big_poster: videoData.big_poster,
            visit_cnt: videoData.visit_cnt,
            sdate: videoData.sdate,
            duration: videoData.duration,
        };

        if (details.description) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = details.description;
            details.description = tempDiv.textContent || tempDiv.innerText || '';
        }

        return { details, links };

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            // This is expected when a new request is made before the old one finishes.
            // We re-throw it so the calling component can handle its cleanup.
            throw error;
        }
        console.error("Error fetching Aparat video details:", error);
        if (error instanceof Error && (error.message.includes('Failed to fetch') || error.name === 'NetworkError')) {
             throw new Error('Network error. Check your internet connection or if the CORS proxy is down.');
        }
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse API response. The format may have changed.');
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching video details.');
    }
};

export const extractAparatId = (url: string): string | null => {
    if (!url) return null;
    if (!url.includes('/') && url.length > 3 && url.length < 15) {
        return url;
    }
    const regex = /(?:v|video\/video\/embed\/videohash)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};