"use client"

import { useState } from "react"

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

const videoData = {
    1: {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        description: "Подробный разбор одного из самых популярных вариантов сицилианской защиты.",
        price: 2500,
        access: 1,
        category: "Дебюты",
        instructor: "ГМ Иванов А.С.",
        rating: 4.8,
        views: 1250,
        duration: "15:30",
        isPurchased: false,
    },
    3: {
        id: 3,
        title: "Тактика: Двойной удар",
        description: "Мастер-класс по одному из самых эффективных тактических приемов.",
        price: 1800,
        access: 1,
        category: "Тактика",
        instructor: "ГМ Сидоров В.П.",
        rating: 4.7,
        views: 890,
        duration: "12:45",
        isPurchased: true, // Для демо
    },
}

export const VideosIdView = ({ params }: { params: { id: string } }) => {
    const videoId = Number.parseInt(params.id)
    const video = videoData[videoId as keyof typeof videoData]
    const [showPurchaseModal, setShowPurchaseModal] = useState(false)

    if (!video) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Видео не найдено</h1>
                    <Link href="/videos">
                        <Button>Вернуться к видео</Button>
                    </Link>
                </div>
            </div>
        )
    }

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
                            videoId={video.id.toString()}
                            isPurchased={video.access === 0 || video.isPurchased}
                            onPurchaseClick={() => setShowPurchaseModal(true)}
                            title={video.title}
                            price={video.price}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant="outline">{video.category}</Badge>
                                    {video.access === 0 ? (
                                        <Badge className="bg-green-500">Бесплатно</Badge>
                                    ) : (
                                        <Badge className="bg-amber-500">{video.price.toLocaleString()} ₸</Badge>
                                    )}
                                    {video.isPurchased && video.access === 1 && <Badge className="bg-blue-500">Куплено</Badge>}
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">{video.title}</h1>
                                <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{video.instructor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span>{video.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{video.views.toLocaleString()} просмотров</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{video.duration}</span>
                                    </div>
                                </div>
                            </div>
                            {!video.isPurchased && video.access === 1 && (
                                <Button
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-3"
                                >
                                    Купить за {video.price.toLocaleString()} ₸
                                </Button>
                            )}
                        </div>

                        <p className="text-slate-700 leading-relaxed text-lg">{video.description}</p>
                    </div>
                </div>
            </div>

            {showPurchaseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Приобрести доступ</h3>
                        <p className="text-slate-600 mb-6">
                            Получите доступ к видео &quot;{video.title}&quot; за {video.price.toLocaleString()} ₸
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
