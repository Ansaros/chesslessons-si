import axiosInstance from "@/utils/axiosInstance";
import type { VideosResponse, VideoDetail, VideoFilters } from "@/types/video";

export const videoService = {
  async getVideos(filters?: VideoFilters): Promise<VideosResponse> {
    const params = new URLSearchParams();

    if (filters?.access_level !== undefined && filters.access_level !== null) {
      params.append("access_level", filters.access_level.toString());
    }

    if (filters?.attribute_value_ids?.length) {
      filters.attribute_value_ids.forEach((id) => {
        params.append("attribute_value_ids", id);
      });
    }

    const queryString = params.toString();
    const url = `/videos${queryString ? `?${queryString}` : ""}`;

    const response = await axiosInstance.get<VideosResponse>(url);
    return response.data;
  },

  async getVideoById(videoId: string): Promise<VideoDetail> {
    const response = await axiosInstance.get<VideoDetail>(`/videos/${videoId}`);
    return response.data;
  },
};
