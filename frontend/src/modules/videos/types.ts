export interface VideoData {
    id: string;
    title: string;
    price: number;
    access: 0 | 1;
    spacesPath: string;
    duration?: number;
}

export interface StreamResponse {
    streamUrl: string;
    expiresAt: number;
    videoInfo: {
        title: string;
        duration?: number;
    }
}
