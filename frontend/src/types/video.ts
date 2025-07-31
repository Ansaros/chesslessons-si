export interface VideoAttribute {
  type: string;
  value: string;
}

export interface VideoPreview {
  id: string;
  title: string;
  preview_url: string;
  access_level: 0 | 1 | 2; // 0 - бесплатно, 1 - платно, 2 - подписка
  price: string;
  attributes: VideoAttribute[];
}

export interface VideoDetail extends VideoPreview {
  description: string;
  hls_url: string;
  created_at: string;
  hls_segments: Record<string, string>;
  views_count: number;
}

export interface VideosResponse {
  data: VideoPreview[];
  total: number;
}

export interface VideoFilters {
  access_level?: 0 | 1 | 2 | null;
  attribute_value_ids?: string[];
  search?: string;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
}
