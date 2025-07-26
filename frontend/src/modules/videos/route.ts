import { type NextRequest, NextResponse } from "next/server";

import { verifyJWT } from "@/lib/jwt";

import { VideoData } from "./types";
import { VideoService } from "./services/video";


const extractTokenFromHeader = (authHeader: string | null): string | null => {
    if (!authHeader?.startsWith("Bearer ")) return null
    return authHeader.split(" ")[1] || null;
}

const videoService = new VideoService();

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

        if (!videoService.checkVideoAccess(video, videoId)) {
            return NextResponse.json(
                {
                    error: "Нет доступа к видео",
                    needsPurchase: true,
                    price: video.price,
                },
                { status: 403 }
            );
        }

        const streamResponse = await videoService.generateStreamResponse(video);
        return NextResponse.json(streamResponse);

    } catch (error) {
        console.error("Stream API Error:", error)
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        )
    }
}
