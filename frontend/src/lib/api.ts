export interface VideoAttribute {
    type: string;
    value: string;
}

export interface VideoPreview {
    id: string;
    title: string;
    preview_url: string;
    access_level: 0 | 1 | 2;
    price: string;
    attributes: VideoAttribute[];
}

export interface VideoDetails {
    id: string;
    title: string;
    description: string;
    access_level: 0 | 1 | 2;
    price: string;
    preview_url: string;
    hls_url: string;
    created_at: string;
    attributes: VideoAttribute[];
    hls_segments: Record<string, unknown>;
    views_count: number;
}

export interface VideosResponse {
    data: VideoPreview[];
    total: number;
}

export interface StreamResponse {
    streamUrl: string;
    expiresAt: number;
    videoInfo: {
        title: string;
        duration?: string;
    }
}

export const getAttributeValue = (attributes: VideoAttribute[], type: string): string => {
    return attributes.find(attr => attr.type === type)?.value || "";
}

export const getCategoryLabel = (value: string): string => {
    const categories: { [key: string]: string } = {
        "debuts": "Дебюты",
        "strategy": "Стратегии",
        "tactics": "Тактика",
        "endgame": "Эндшпиль"
    };
    return categories[value] || value;
}

export const getSkillLevelLabel = (value: string): string => {
    const skillLevels: { [key: string]: string } = {
        "beginner": "Начинающий",
        "rank-4-3": "4-3 разряд",
        "rank-2-1": "2-1 разряд",
        "master": "КМС и выше"
    };
    return skillLevels[value] || value;
}

export class VideoAPI {
    private baseUrl: string;
    private token?: string;

    constructor(baseUrl?: string, token?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BACKEND_URL || '';
        this.token = token;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async getVideos(params?: {
        access_level?: string;
        attribute_value_ids?: string[];
    }): Promise<VideosResponse> {
        const urlParams = new URLSearchParams();
        
        if (params?.access_level && params.access_level !== 'all') {
            urlParams.append('access_level', params.access_level);
        }

        if (params?.attribute_value_ids && params.attribute_value_ids.length > 0) {
            urlParams.append('attribute_value_ids', params.attribute_value_ids.join(','));
        }

        const url = `${this.baseUrl}/videos${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getVideo(id: string): Promise<VideoDetails> {
        const response = await fetch(`${this.baseUrl}/videos/${id}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Видео не найдено');
            }
            if (response.status === 403) {
                throw new Error('Нет доступа к видео');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getVideoStream(id: string): Promise<StreamResponse> {
        const response = await fetch(`/api/stream/${id}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка получения потока');
        }

        return response.json();
    }

    async checkPurchase(videoId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/user/purchases/${videoId}`, {
                headers: this.getHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                return data.purchased === true;
            }

            return false;
        } catch (error) {
            console.error('Error checking purchase:', error);
            return false;
        }
    }

    setToken(token: string) {
        this.token = token;
    }
}
export const videoAPI = new VideoAPI();

export const CATEGORIES = [
    { value: "all", label: "Все категории" },
    { value: "debuts", label: "Дебюты" },
    { value: "strategy", label: "Стратегии" },
    { value: "tactics", label: "Тактика" },
    { value: "endgame", label: "Эндшпиль" },
];

export const ACCESS_TYPES = [
    { value: "all", label: "Все видео" },
    { value: "0", label: "Бесплатные" },
    { value: "1", label: "Платные" },
];

export const SKILL_LEVELS = [
    { value: "all", label: "Все уровни" },
    { value: "beginner", label: "Начинающий" },
    { value: "rank-4-3", label: "4-3 разряд" },
    { value: "rank-2-1", label: "2-1 разряд" },
    { value: "master", label: "КМС и выше" },
];

export const useVideoAPI = (token?: string) => {
    const api = new VideoAPI(undefined, token);
    return api;
};

export const fetchVideos = async () => {
  const res = await fetch("/admin/videos?limit=100");
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
};

export const fetchAttributeTypes = async () => {
  const res = await fetch("/admin/attribute/types");
  if (!res.ok) throw new Error("Failed to fetch attribute types");
  return res.json();
};

export const uploadVideo = async (formData: FormData) => {
  const res = await fetch("/admin/videos", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Video upload failed");
  return res.json();
};