
// src/services/admin/AdminService.ts
import axiosInstance from "@/utils/axiosInstance";
import { axiosMultipart } from "@/utils/axiosMultiPart";
import type {
    AdminVideo,
    AdminVideosResponse,
    AdminAttributeType,
    AdminAttributeValue,
    StatusResponse,
} from "@/types/admin";

export const AdminService = {
    // Video Management
    async uploadVideo(formData: FormData): Promise<AdminVideo> {
        const response = await axiosMultipart.post<AdminVideo>(
            "/admin/videos/",
            formData
        );
        return response.data;
    },

    async getVideos(skip = 0, limit = 100): Promise<AdminVideosResponse> {
        const response = await axiosInstance.get<AdminVideosResponse>(
            "/admin/videos/",
            {
                params: { skip, limit },
            }
        );
        return response.data;
    },

    async updateVideo(videoId: string, formData: FormData): Promise<AdminVideo> {
        const response = await axiosMultipart.put<AdminVideo>(
            `/admin/videos/${videoId}`,
            formData
        );
        return response.data;
    },

    async deleteVideo(videoId: string): Promise<AdminVideo> {
        const response = await axiosInstance.delete<AdminVideo>(
            `/admin/videos/${videoId}`
        );
        return response.data;
    },

    // Attribute Management
    async createAttributeType(name: string): Promise<AdminAttributeType> {
        const response = await axiosInstance.post<AdminAttributeType>(
            "/admin/attribute/types",
            { name }
        );
        return response.data;
    },

    async createAttributeValue(
        value: string,
        type_id: string
    ): Promise<AdminAttributeValue> {
        const response = await axiosInstance.post<AdminAttributeValue>(
            "/admin/attribute/values",
            { value, type_id }
        );
        return response.data;
    },

    async deleteAttributeType(id: string): Promise<StatusResponse> {
        const response = await axiosInstance.delete<StatusResponse>(
            `/admin/attribute/types/${id}`
        );
        return response.data;
    },

    async deleteAttributeValue(id: string): Promise<StatusResponse> {
        const response = await axiosInstance.delete<StatusResponse>(
            `/admin/attribute/values/${id}`
        );
        return response.data;
    },
};
