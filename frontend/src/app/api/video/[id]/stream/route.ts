import { type NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyJWT } from "@/lib/jwt";

// Interface for data from your external API, updated to match your documentation
interface ApiVideoData {
    id: string;
    title: string;
    description?: string;
    access_level: number; // API sends a number (0, 1, or 2)
    price: string;        // ❗️ API sends price as a string
    preview_url?: string;
    hls_url: string;
    duration?: number;    // Keeping as optional in case it's added later
}

// Internal data structure
interface VideoData {
    id: string;
    title: string;
    price: number;        // We will use price as a number internally
    access: number;
    spacesPath: string;
    duration?: number;
    previewUrl: string;
}

// The shape of the JSON response sent to the client
interface StreamResponse {
    streamUrl: string;
    expiresAt: number;
    previewUrl: string;
    videoInfo: {
        title: string;
        duration?: number;
    }
}

const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT!,
    region: process.env.DO_SPACES_REGION!,
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
});

const SIGNED_URL_EXPIRES_IN = 3600;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET!;

// This logic remains the same
const extractTokenFromHeader = (authHeader: string | null): string | null => {
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.split(" ")[1] || null;
};

// This logic correctly handles any non-zero access level as private
const checkVideoAccess = async (video: VideoData, videoId: string, token: string): Promise<boolean> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}/access`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );
    return response.status === 200;
};


// This logic remains the same
const generateSignedUrl = async (spacesPath: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: spacesPath,
        ResponseContentDisposition: "inline",
        ResponseContentType: "video/mp4",
    });
    return getSignedUrl(s3Client, command, {
        expiresIn: SIGNED_URL_EXPIRES_IN,
    });
};


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const videoId = params.id;
        const authHeader = request.headers.get("authorization");
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
        }

        const user = await verifyJWT(token);
        if (!user) {
            return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
            }
            if (response.status === 403) {
                const data = await response.json();
                return NextResponse.json({
                    error: "Нет доступа к видео",
                    needsPurchase: true,
                    price: data.price ? parseFloat(data.price) : 0,
                }, { status: 403 });
            }
            throw new Error("Failed to fetch video");
        }

        const apiVideoData: ApiVideoData = await response.json();
        const DEFAULT_PREVIEW_URL = "/images/default-preview.jpg";

        const video: VideoData = {
            id: apiVideoData.id,
            title: apiVideoData.title,
            price: parseFloat(apiVideoData.price) || 0,
            access: apiVideoData.access_level,
            spacesPath: apiVideoData.hls_url,
            duration: apiVideoData.duration,
            previewUrl: apiVideoData.preview_url || DEFAULT_PREVIEW_URL,
        };

        // Check access for non-public videos
        if (video.access !== 0 && !(await checkVideoAccess(video, videoId, token))) {
            return NextResponse.json({
                error: "Нет доступа к видео",
                needsPurchase: true,
                price: video.price,
            }, { status: 403 });
        }

        // Public video: direct CDN URL
        if (video.access === 0) {
            const streamResponse: StreamResponse = {
                streamUrl: `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${video.spacesPath}`,
                expiresAt: 0,
                previewUrl: video.previewUrl,
                videoInfo: {
                    title: video.title,
                    duration: video.duration,
                }
            };
            return NextResponse.json(streamResponse);
        }

        // Private video: signed URL
        const signedUrl = await generateSignedUrl(video.spacesPath);
        const streamResponse: StreamResponse = {
            streamUrl: signedUrl,
            expiresAt: Date.now() + (SIGNED_URL_EXPIRES_IN * 1000),
            previewUrl: video.previewUrl,
            videoInfo: {
                title: video.title,
                duration: video.duration,
            }
        };

        return NextResponse.json(streamResponse);

    } catch (error) {
        console.error("Stream API Error:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}