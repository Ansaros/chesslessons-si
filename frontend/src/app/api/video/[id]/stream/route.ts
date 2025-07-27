import { type NextRequest, NextResponse } from "next/server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { verifyJWT } from "@/lib/jwt";

interface VideoData {
    id: string;
    title: string;
    price: number;
    access: 0 | 1; // 0 = public, 1 = private - тут сдела так
    spacesPath: string;
    duration?: number;
}

interface StreamResponse {
    streamUrl: string;
    expiresAt: number;
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

const SIGNED_URL_EXPIRES_IN = 3600
const BUCKET_NAME = process.env.DO_SPACES_BUCKET!


const extractTokenFromHeader = (authHeader: string | null): string | null => {
    if (!authHeader?.startsWith("Bearer ")) return null
    return authHeader.split(" ")[1] || null;
}

const checkVideoAccess = (video: VideoData, videoId: string): boolean => {
    const userPurchases = new Set(["1", "3", "5"])
    return video.access === 0 || userPurchases.has(videoId) // || тут надо в куери чекать есть ли покупка. потом сделаете ||
}

const generateSignedUrl = async (spacesPath: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: spacesPath,
        ResponseContentDisposition: "inline",
        ResponseContentType: "video/mp4",
    })

    return getSignedUrl(s3Client, command, {
        expiresIn: SIGNED_URL_EXPIRES_IN,
    })
}


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const videoId = params.id;
        const authHeader = request.headers.get("authorization")

        const token = extractTokenFromHeader(authHeader)

        if (!token) {
            return NextResponse.json(
                { error: "Требуется авторизация" },
                { status: 401 }
            )
        }

        const user = await verifyJWT(token);
        if (!user) {
            return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: "Видео не найдено" },
                    { status: 404 },
                )
            }
            if (response.status === 403) {
                const data = await response.json();
                return NextResponse.json(
                    {
                        error: "Нет доступа к видео",
                        needsPurchase: true,
                        price: data.price,
                    },
                    { status: 403 }
                )
            }
            throw new Error("Failed to fetch video")
        }

        const videoData = await response.json();
        
        const video: VideoData = {
            id: videoData.id,
            title: videoData.title,
            price: videoData.price || 0,
            access: videoData.access_level as 0 | 1,
            spacesPath: videoData.hls_url,
            duration: videoData.duration
        };

        if (!checkVideoAccess(video, videoId)) {
            return NextResponse.json(
                {
                    error: "Нет доступа к видео",
                    needsPurchase: true,
                    price: video.price,
                },
                { status: 403 }
            );
        }

        if (video.access === 0) {
            const streamResponse: StreamResponse = {
                streamUrl: `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${video.spacesPath}`,
                expiresAt: 0,
                videoInfo: {
                    title: video.title,
                    duration: video.duration,
                }
            };
            return NextResponse.json(streamResponse);
        }

        const signedUrl = await generateSignedUrl(video.spacesPath);

        const streamResponse: StreamResponse = {
            streamUrl: signedUrl,
            expiresAt: Date.now() + (SIGNED_URL_EXPIRES_IN * 1000),
            videoInfo: {
                title: video.title,
                duration: video.duration,
            }
        };

        return NextResponse.json(streamResponse);

    } catch (error) {
        console.error("Stream API Error:", error)
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        )
    }
}
