
// hooks/useAdmin.ts
import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";
import { useAuth } from "./useAuth";
import { AdminService } from "@/services/admin";
import { attributesService } from "@/services/auth";
import type { AdminVideo } from "@/types/admin";
import type { AttributeType } from "@/types/auth";

export const useAdmin = () => {
  const { isAuthenticated } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAdminData = useCallback(async () => {
    try {
      const [videosResponse, attributesResponse] = await Promise.all([
        AdminService.getVideos(0, 100),
        attributesService.getAttributeTypes(),
      ]);
      setVideos(videosResponse.data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setTotalVideos(videosResponse.total);
      setAttributes(attributesResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to load admin data.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // This guard waits if we're logged in but don't have a profile object yet.
    // This prevents the hook from deciding we're not an admin prematurely on page load.
    if (isAuthenticated && !isProfileLoading && !profile) {
      setIsLoading(true);
      return;
    }

    if (isProfileLoading) {
      setIsLoading(true);
      return;
    }

    const checkAdmin = profile?.email === "admin@chess.com";
    setIsAdmin(checkAdmin);

    if (checkAdmin) {
      fetchAllAdminData().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isProfileLoading, profile, fetchAllAdminData]);

  const handleAdminAction = useCallback(async <T,>(
    action: () => Promise<T>
  ): Promise<T> => {
    if (!isAdmin) {
      throw new Error("Access Denied: User is not an admin.");
    }
    const result = await action();
    setIsLoading(true); // Set loading state while refreshing data
    await fetchAllAdminData();
    setIsLoading(false);
    return result;
  }, [isAdmin, fetchAllAdminData]);

  const uploadVideo = (formData: FormData) => handleAdminAction(() => AdminService.uploadVideo(formData));
  const updateVideo = (videoId: string, formData: FormData) => handleAdminAction(() => AdminService.updateVideo(videoId, formData));
  const deleteVideo = (videoId: string) => handleAdminAction(() => AdminService.deleteVideo(videoId));
  const createAttributeType = (name: string) => handleAdminAction(() => AdminService.createAttributeType(name));
  const deleteAttributeType = (id: string) => handleAdminAction(() => AdminService.deleteAttributeType(id));
  const createAttributeValue = (value: string, type_id: string) => handleAdminAction(() => AdminService.createAttributeValue(value, type_id));
  const deleteAttributeValue = (id:string) => handleAdminAction(() => AdminService.deleteAttributeValue(id));

  return {
    isAdmin,
    isLoading,
    error,
    videos,
    totalVideos,
    attributes,
    uploadVideo,
    updateVideo,
    deleteVideo,
    createAttributeType,
    deleteAttributeType,
    createAttributeValue,
    deleteAttributeValue,
  };
};
