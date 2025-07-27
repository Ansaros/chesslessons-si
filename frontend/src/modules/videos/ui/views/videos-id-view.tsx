"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
    Star,
    Eye,
    Clock,
    User,
    ArrowLeft
} from "lucide-react"

import { VideoPlayer } from "../components/video-player"

// API Types
interface VideoAttribute {
    type: string;
    value: string;
}

interface VideoDetails {
    id: string;
    title: string;
    description: string;
    access_level: 0 | 1 | 2;
    price: string;
    preview_url: string;
    hls_url: string;
    created_at: string;
    attributes: VideoAttribute[];
    hls_segments: Record<string, unknown>;
    views_count: number;
}

// Helper function to get attribute value
const getAttributeValue = (attributes: VideoAttribute[], type: string): string => {
    return attributes.find(attr => attr.type === type)?.value || "";
}

const getCategoryLabel = (value: string): string => {
    const categories: { [key: string]: string } = {
        "debuts": "Дебюты",
        "strategy": "Стратегии", 
        "tactics": "Тактика",
        "endgame": "Эндшпиль"
    };
    return categories[value] || value;
}

export const VideosIdView = ({ params }: { params: { id: string } }) => {
    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);

    const videoId = params.id;

    // Fetch video details from API
    const fetchVideoDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos/${videoId}`);
            
            if (response.status === 404) {
                setError("Видео не найдено");
                return;
            }
            
            if (response.status === 403) {
                setVideo(prev => prev ? { ...prev, access_level: 1 as const } : null);
                setError("Нет доступа к видео");
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const videoData: VideoDetails = await response.json();
            setVideo(videoData);
            
            // Check if user has purchased this video (you'll need to implement this logic)
            // For now, we'll assume free videos are "purchased"
            setIsPurchased(videoData.access_level === 0);
            
            setError(null);
        } catch (err) {
            console.error("Error fetching video details:", err);
            setError("Ошибка при загрузке видео");
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId, fetchVideoDetails]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center space-x-2">
                                <Image
                                    src="/images/chess-logo.png"
                                    alt="Chester Chess Club"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                                </div>
                            </Link>
                            <nav className="flex items-center space-x-6">
                                <Button variant="ghost" asChild>
                                    <Link href="/videos">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Назад
                                    </Link>
                                </Button>
                            </nav>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Загрузка видео...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state or video not found
    if (error || !video) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        {error || "Видео не найдено"}
                    </h1>
                    <Link href="/videos">
                        <Button>Вернуться к видео</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Extract video attributes
    const category = getAttributeValue(video.attributes, "category");
    const instructor = getAttributeValue(video.attributes, "instructor");
    const duration = getAttributeValue(video.attributes, "duration");
    const rating = getAttributeValue(video.attributes, "rating");
    const skillLevel = getAttributeValue(video.attributes, "skill_level");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/images/chess-logo.png"
                                alt="Chester Chess Club"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                            </div>
                        </Link>
                        <nav className="flex items-center space-x-6">
                            <Button variant="ghost" asChild>
                                <Link href="/videos">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад
                                </Link>
                            </Button>
                            <Link href="/profile" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Профиль
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Video Player */}
                    <div className="mb-6">
                        <VideoPlayer
                            videoId={video.id}
                            isPurchased={video.access_level === 0 || isPurchased}
                            onPurchaseClick={() => setShowPurchaseModal(true)}
                            title={video.title}
                            price={video.price ? Number(video.price) : 0}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant="outline">{getCategoryLabel(category)}</Badge>
                                    {video.access_level === 0 ? (
                                        <Badge className="bg-green-500">Бесплатно</Badge>
                                    ) : (
                                        <Badge className="bg-amber-500">
                                            {video.price ? `${Number(video.price).toLocaleString()} ₸` : "Платно"}
                                        </Badge>
                                    )}
                                    {isPurchased && video.access_level > 0 && (
                                        <Badge className="bg-blue-500">Куплено</Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">{video.title}</h1>
                                <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{instructor || "Не указан"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span>{rating || "0.0"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{video.views_count.toLocaleString()} просмотров</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{duration || "00:00"}</span>
                                    </div>
                                </div>
                            </div>
                            {!isPurchased && video.access_level > 0 && video.price && (
                                <Button
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-3"
                                >
                                    Купить за {Number(video.price).toLocaleString()} ₸
                                </Button>
                            )}
                        </div>

                        <p className="text-slate-700 leading-relaxed text-lg">{video.description}</p>
                    </div>
                </div>
            </div>

            {showPurchaseModal && video.price && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Приобрести доступ</h3>
                        <p className="text-slate-600 mb-6">
                            Получите доступ к видео &quot;{video.title}&quot; за {Number(video.price).toLocaleString()} ₸
                        </p>
                        <div className="flex gap-3">
                            <Button
                                className="flex-1 bg-amber-600 hover:bg-amber-700"
                                onClick={() => {
                                    window.location.href = `/payment?video=${video.id}`
                                }}
                            >
                                Купить
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPurchaseModal(false)}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}