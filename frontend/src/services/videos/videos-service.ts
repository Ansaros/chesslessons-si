import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { VideoData, StreamResponse } from "@/modules/videos/types";
import { authApi, authService, TokenResponse, TokenStorage } from "../auth/auth-service";
import { VideoDetails } from "@/lib/api";


export class VideoService {
    private s3Client: S3Client;
    private SIGNED_URL_EXPIRES_IN = 3600;
    private BUCKET_NAME = process.env.DO_SPACES_BUCKET!;

    constructor() {
        this.s3Client = new S3Client({
            endpoint: process.env.DO_SPACES_ENDPOINT!,
            region: process.env.DO_SPACES_REGION!,
            credentials: {
                accessKeyId: process.env.DO_SPACES_KEY!,
                secretAccessKey: process.env.DO_SPACES_SECRET!,
            },
        });
    }

    async getVideo(videoId: string): Promise<VideoDetails> {
        try {
            console.log("[VideoService] Getting video:", videoId);
            const token = await authService.ensureValidToken();
            console.log("[VideoService] Token retrieved:", token ? token.substring(0, 10) + "..." : "null");

            if (!token) {
                console.error("[VideoService] No valid token available");
                throw new Error("SESSION_EXPIRED");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token || "",
                    },
                }
            );

            console.log("[VideoService] Response status:", response.status);
            console.log("[VideoService] Response headers:", Object.fromEntries(response.headers.entries()));

            if (response.status === 401) {
                console.log("[VideoService] Token expired, attempting refresh...");
                try {
                    const newTokens = await authService.refreshToken();
                    console.log("[VideoService] Token refreshed successfully");

                    const retryResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${newTokens.access_token}`,
                            },
                        }
                    );

                    if (!retryResponse.ok) {
                        console.error("[VideoService] Retry failed with status:", retryResponse.status);
                        const errorText = await retryResponse.text();
                        console.error("[VideoService] Retry error response:", errorText);
                        throw new Error("REFRESH_FAILED");
                    }

                    return await retryResponse.json() as VideoDetails;
                } catch (refreshError) {
                    console.error("[VideoService] Token refresh failed:", refreshError);
                    throw new Error("SESSION_EXPIRED");
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[VideoService] Request failed:", response.status, errorText);
                throw new Error(`HTTP_ERROR_${response.status}`);
            }

            const videoData = await response.json();
            console.log("[VideoService] Video data received:", videoData);
            return videoData as VideoDetails;
        } catch (error) {
            console.error("[VideoService] Error in getVideo:", error);
            if (error instanceof Error && (error.message === "SESSION_EXPIRED" || error.message === "REFRESH_FAILED")) {
                throw error;
            }
            throw new Error("FETCH_FAILED");
        }
    }
    async refreshToken(): Promise<TokenResponse> {
        try {
            const refreshToken = TokenStorage.getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            const response = await authApi.post('/token/refresh', {}, {
                headers: { Authorization: `Bearer ${refreshToken}` }
            });

            console.log("[AuthService] Token refreshed successfully");
            const rememberMe = TokenStorage.isRemembered();
            TokenStorage.setTokens(
                response.data.access_token,
                response.data.refresh_token,
                rememberMe
            );

            return response.data;
        } catch (error) {
            console.error("[AuthService] Token refresh failed:", error);
            TokenStorage.clearTokens();
            throw new Error("REFRESH_FAILED");
        }
    }
    private parseVideoData(videoData: VideoDetails): VideoData {
        return {
            id: videoData.id,
            title: videoData.title,
            price: Number(videoData.price),
            access: videoData.access_level as 0 | 1,
            spacesPath: videoData.hls_url,
            duration: videoData.duration,
        };
    }

    checkVideoAccess(video: VideoData, videoId: string): boolean {
        const userPurchases = new Set(["1", "3", "5"]);
        return video.access === 0 || userPurchases.has(videoId);
    }

    private async generateSignedUrl(spacesPath: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: spacesPath,
            ResponseContentDisposition: "inline",
            ResponseContentType: "video/mp4",
        });

        return getSignedUrl(this.s3Client, command, {
            expiresIn: this.SIGNED_URL_EXPIRES_IN,
        });
    }

    async generateStreamResponse(video: VideoData): Promise<StreamResponse> {
        if (video.access === 0) {
            return {
                streamUrl: `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${video.spacesPath}`,
                expiresAt: 0,
                videoInfo: {
                    title: video.title,
                    duration: video.duration,
                },
            };
        }

        const signedUrl = await this.generateSignedUrl(video.spacesPath);
        return {
            streamUrl: signedUrl,
            expiresAt: Date.now() + this.SIGNED_URL_EXPIRES_IN * 1000,
            videoInfo: {
                title: video.title,
                duration: video.duration,
            },
        };
    }
}