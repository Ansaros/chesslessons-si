"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Search,
    Filter,
    Play,
    Lock
} from "lucide-react"

// API Types
interface VideoAttribute {
    type: string;
    value: string;
}

interface VideoPreview {
    id: string;
    title: string;
    preview_url: string;
    access_level: 0 | 1 | 2;
    price: string;
    attributes: VideoAttribute[];
}

interface VideosResponse {
    data: VideoPreview[];
    total: number;
}

// Helper functions
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

const categories = [
    { value: "all", label: "Все категории" },
    { value: "debuts", label: "Дебюты" },
    { value: "strategy", label: "Стратегии" },
    { value: "tactics", label: "Тактика" },
    { value: "endgame", label: "Эндшпиль" },
]

const accessTypes = [
    { value: "all", label: "Все видео" },
    { value: "0", label: "Бесплатные" },
    { value: "1", label: "Платные" },
]

const skillLevels = [
    { value: "all", label: "Все уровни" },
    { value: "beginner", label: "Начинающий" },
    { value: "rank-4-3", label: "4-3 разряд" },
    { value: "rank-2-1", label: "2-1 разряд" },
    { value: "master", label: "КМС и выше" },
]

export const VideosView = () => {
    const [videos, setVideos] = useState<VideoPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedAccess, setSelectedAccess] = useState("all");
    const [selectedSkillLevel, setSelectedSkillLevel] = useState("all");

    // Fetch videos from API
    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            // Add access level filter if selected
            if (selectedAccess !== "all") {
                params.append("access_level", selectedAccess);
            }

            // Add attribute filters if needed
            const attributeFilters: string[] = [];
            if (selectedCategory !== "all") {
                attributeFilters.push(`category:${selectedCategory}`);
            }
            if (selectedSkillLevel !== "all") {
                attributeFilters.push(`skill_level:${selectedSkillLevel}`);
            }
            
            if (attributeFilters.length > 0) {
                params.append("attribute_value_ids", attributeFilters.join(","));
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/videos?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VideosResponse = await response.json();
            setVideos(data.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching videos:", err);
            setError("Ошибка при загрузке видео");
        } finally {
            setLoading(false);
        }
    }, [selectedAccess, selectedCategory, selectedSkillLevel]);

    // Fetch videos on component mount and when filters change
    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Client-side filtering for search query
    const filteredVideos = videos.filter((video) => {
        const matchesSearch =
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getAttributeValue(video.attributes, "description").toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    });

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
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                                </div>
                            </Link>
                            <nav className="hidden md:flex items-center space-x-6">
                                <Link href="/videos" className="text-amber-600 font-medium">
                                    Видеоуроки
                                </Link>
                                <Link href="/profile" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Профиль
                                </Link>
                                <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Войти
                                </Link>
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



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/images/chess-logo.png"
                                alt="Chester Chess Club"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                            </div>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/videos" className="text-amber-600 font-medium">
                                Видеоуроки
                            </Link>
                            <Link href="/profile" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Профиль
                            </Link>
                            <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Войти
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Видеоуроки</h1>
                    <p className="text-slate-600">Изучайте шахматы с профессиональными тренерами</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Поиск по названию или описанию..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedAccess} onValueChange={setSelectedAccess}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {accessTypes.map((access) => (
                                        <SelectItem key={access.value} value={access.value}>
                                            {access.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {skillLevels.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-slate-600">
                        Найдено {filteredVideos.length} {filteredVideos.length === 1 ? "видео" : "видео"}
                    </p>
                </div>

                {error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={fetchVideos}>Попробовать снова</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => {
                                const category = getAttributeValue(video.attributes, "category");
                                const instructor = getAttributeValue(video.attributes, "instructor");
                                const duration = getAttributeValue(video.attributes, "duration");
                                const rating = getAttributeValue(video.attributes, "rating");
                                const views = getAttributeValue(video.attributes, "views");
                                const description = getAttributeValue(video.attributes, "description");

                                return (
                                    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                        <div className="relative">
                                            <Image
                                                src={video.preview_url || "/placeholder.svg"}
                                                alt={video.title}
                                                width={600}
                                                height={192}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                                {duration || "00:00"}
                                            </div>
                                            <div className="absolute top-2 left-2 flex gap-2">
                                                {video.access_level === 0 ? (
                                                    <Badge className="bg-green-500">Бесплатно</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500">
                                                        <Lock className="w-3 h-3 mr-1" />
                                                        Платно
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>

                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {getCategoryLabel(category)}
                                                </Badge>
                                                {video.access_level > 0 && video.price && (
                                                    <span className="text-lg font-bold text-amber-600">
                                                        {Number(video.price).toLocaleString()} ₸
                                                    </span>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
                                                {video.title}
                                            </CardTitle>
                                            <p className="text-sm text-slate-600 line-clamp-2">
                                                {description}
                                            </p>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                                                <span>{instructor}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>★ {rating || "0.0"}</span>
                                                    <span>•</span>
                                                    <span>{views || "0"} просмотров</span>
                                                </div>
                                            </div>

                                            <Button className="w-full" asChild>
                                                <Link href={`/video/${video.id}`}>
                                                    {video.access_level === 0 ? (
                                                        <>
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Смотреть
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-4 h-4 mr-2" />
                                                            Купить и смотреть
                                                        </>
                                                    )}
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {filteredVideos.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-slate-400 mb-4">
                                    <Search className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-600 mb-2">Видео не найдены</h3>
                                <p className="text-slate-500">Попробуйте изменить параметры поиска или фильтры</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}