import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";
import { AdminService } from "@/services/admin/adminService";
import { attributesService } from "@/services/auth";
import type { AdminVideo } from "@/types/admin";
import type { AttributeType } from "@/types/auth";


export const useAdmin = () => {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = useCallback(async () => {
    if (profile?.email !== "admin@chess.com") return;
    try {
      const response = await attributesService.getAttributeTypes();
      setAttributes(response.data);
    } catch (err) {
      setError((prev) =>
        prev
          ? `${prev}\nFailed to fetch attributes.`
          : "Failed to fetch attributes."
      );
      console.error(err);
    }
  }, [profile]);

  const fetchVideos = useCallback(async (skip = 0, limit = 100) => {
    // Re-check admin status before fetching
    if (profile?.email !== "admin@chess.com") {
      setError("Unauthorized to fetch admin data.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await AdminService.getVideos(skip, limit);
      setVideos(response.data);
      setTotalVideos(response.total);
      setError(null);
    } catch (err) {
      setError("Failed to fetch videos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!isProfileLoading) {
      const checkAdmin = profile?.email === "admin@chess.com";
      setIsAdmin(checkAdmin);
      if (checkAdmin) {
        fetchVideos();
        fetchAttributes();
      } else {
        setIsLoading(false);
      }
    }
  }, [profile, isProfileLoading, fetchAttributes, fetchVideos]);

  const handleAdminAction = useCallback(async <T,>(
    action: () => Promise<T>
  ): Promise<T> => {
    if (!isAdmin) {
      throw new Error("Access Denied: User is not an admin.");
    }
    return action();
  }, [isAdmin]);

  const uploadVideo = useCallback(
    async (formData: FormData) => {
      const newVideo = await handleAdminAction(() =>
        AdminService.uploadVideo(formData)
      );
      setVideos((prev) => [newVideo, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setTotalVideos((prev) => prev + 1);
      return newVideo;
    },
    [handleAdminAction]
  );

  const updateVideo = useCallback(
    async (videoId: string, formData: FormData) => {
      const updatedVideo = await handleAdminAction(() =>
        AdminService.updateVideo(videoId, formData)
      );
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? updatedVideo : v))
      );
      return updatedVideo;
    },
    [handleAdminAction]
  );

  const deleteVideo = useCallback(
    async (videoId: string) => {
      await handleAdminAction(() => AdminService.deleteVideo(videoId));
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setTotalVideos((prev) => prev - 1);
    },
    [handleAdminAction]
  );

  const createAttributeType = useCallback(
    async (name: string) => {
      return handleAdminAction(() => AdminService.createAttributeType(name));
    },
    [handleAdminAction]
  );

  const deleteAttributeType = useCallback(
    async (id: string) => {
      return handleAdminAction(() => AdminService.deleteAttributeType(id));
    },
    [handleAdminAction]
  );

  return {
    isAdmin,
    isLoading: isLoading || isProfileLoading,
    error,
    videos,
    totalVideos,
    attributes,
    fetchVideos,
    uploadVideo,
    updateVideo,
    deleteVideo,
    createAttributeType,
    deleteAttributeType,
  };
};
