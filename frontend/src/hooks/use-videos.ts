import { useState, useEffect, useCallback } from 'react';
import { VideoAPI, VideoPreview, VideoDetails, videoAPI } from '@/lib/api';

interface UseVideosParams {
    accessLevel?: string;
    category?: string;
    skillLevel?: string;
    searchQuery?: string;
}

interface UseVideosResult {
    videos: VideoPreview[];
    loading: boolean;
    error: string | null;
    total: number;
    refetch: () => void;
}

export const useVideos = (params: UseVideosParams = {}): UseVideosResult => {
    const [videos, setVideos] = useState<VideoPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const { accessLevel, category, skillLevel, searchQuery } = params;

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const attributeFilters: string[] = [];
            if (category && category !== 'all') {
                attributeFilters.push(`category:${category}`);
            }
            if (skillLevel && skillLevel !== 'all') {
                attributeFilters.push(`skill_level:${skillLevel}`);
            }

            const response = await videoAPI.getVideos({
                access_level: accessLevel,
                attribute_value_ids: attributeFilters.length > 0 ? attributeFilters : undefined,
            });

            let filteredVideos = response.data;

            if (searchQuery && searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filteredVideos = response.data.filter(video => {
                    const title = video.title.toLowerCase();
                    const description = video.attributes
                        .find(attr => attr.type === 'description')?.value.toLowerCase() || '';
                    
                    return title.includes(query) || description.includes(query);
                });
            }

            setVideos(filteredVideos);
            setTotal(filteredVideos.length);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке видео');
            setVideos([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [accessLevel, category, skillLevel, searchQuery]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    return {
        videos,
        loading,
        error,
        total,
        refetch: fetchVideos,
    };
};

interface UseVideoResult {
    video: VideoDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useVideo = (id: string): UseVideoResult => {
    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVideo = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const videoData = await videoAPI.getVideo(id);
            setVideo(videoData);
        } catch (err) {
            console.error('Error fetching video:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке видео');
            setVideo(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchVideo();
    }, [fetchVideo]);

    return {
        video,
        loading,
        error,
        refetch: fetchVideo,
    };
};

interface UseVideoStreamResult {
    streamUrl: string | null;
    loading: boolean;
    error: string | null;
    expiresAt: number;
    loadStream: () => Promise<void>;
}

export const useVideoStream = (videoId: string): UseVideoStreamResult => {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState(0);

    const loadStream = useCallback(async () => {
        if (!videoId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await videoAPI.getVideoStream(videoId);
            setStreamUrl(response.streamUrl);
            setExpiresAt(response.expiresAt);
        } catch (err) {
            console.error('Error loading video stream:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке потока');
            setStreamUrl(null);
            setExpiresAt(0);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (expiresAt > 0 && streamUrl) {
            const timeUntilExpiry = expiresAt - Date.now();
            const refreshTime = Math.max(timeUntilExpiry - 300000, 60000);

            if (refreshTime > 0) {
                const timer = setTimeout(() => {
                    loadStream();
                }, refreshTime);

                return () => clearTimeout(timer);
            }
        }
    }, [expiresAt, streamUrl, loadStream]);

    return {
        streamUrl,
        loading,
        error,
        expiresAt,
        loadStream,
    };
};

interface UsePurchaseStatusResult {
    isPurchased: boolean;
    loading: boolean;
    error: string | null;
    checkPurchase: () => Promise<void>;
}

export const usePurchaseStatus = (videoId: string): UsePurchaseStatusResult => {
    const [isPurchased, setIsPurchased] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkPurchase = useCallback(async () => {
        if (!videoId) return;

        try {
            setLoading(true);
            setError(null);

            const purchased = await videoAPI.checkPurchase(videoId);
            setIsPurchased(purchased);
        } catch (err) {
            console.error('Error checking purchase status:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при проверке покупки');
            setIsPurchased(false);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        checkPurchase();
    }, [checkPurchase]);

    return {
        isPurchased,
        loading,
        error,
        checkPurchase,
    };
};