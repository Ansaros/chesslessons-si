import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { VideoData, StreamResponse }from "@/modules/videos/types";


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

    async getVideo(videoId: string, token: string): Promise<VideoData> {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Видео не найдено");
            }
            if (response.status === 403) {
                throw new Error("Нет доступа к видео");
            }
            throw new Error("FETCH_FAILED");
        }

        const videoData = await response.json();
        return {
            id: videoData.id,
            title: videoData.title,
            price: videoData.price || 0,
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