"use client"

import { useState } from "react"

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

// Mock data
const videos = [
    {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        description: "Подробный разбор одного из самых популярных вариантов сицилианской защиты",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "15:30",
        price: 2500,
        access: 1,
        category: "debuts",
        categoryName: "Дебюты",
        instructor: "ГМ Иванов А.С.",
        rating: 4.8,
        views: 1250,
        skillLevel: "beginner",
    },
    {
        id: 2,
        title: "Основы позиционной игры",
        description: "Изучите принципы позиционной игры и долгосрочного планирования",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "22:15",
        price: 0,
        access: 0,
        category: "strategy",
        categoryName: "Стратегии",
        instructor: "МГ Петрова М.В.",
        rating: 4.9,
        views: 3420,
        skillLevel: "rank-4-3",
    },
    {
        id: 3,
        title: "Тактика: Двойной удар",
        description: "Мастер-класс по одному из самых эффективных тактических приемов",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "12:45",
        price: 1800,
        access: 1,
        category: "tactics",
        categoryName: "Тактика",
        instructor: "ГМ Сидоров В.П.",
        rating: 4.7,
        views: 890,
        skillLevel: "rank-2-1",
    },
    {
        id: 4,
        title: "Французская защита: Классический вариант",
        description: "Полный курс по французской защите с практическими примерами",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "18:20",
        price: 3000,
        access: 1,
        category: "debuts",
        categoryName: "Дебюты",
        instructor: "ГМ Козлов Д.А.",
        rating: 4.6,
        views: 567,
        skillLevel: "master",
    },
    {
        id: 5,
        title: "Пешечные окончания",
        description: "Базовые принципы игры в пешечных окончаниях",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "25:10",
        price: 0,
        access: 0,
        category: "endgame",
        categoryName: "Эндшпиль",
        instructor: "МГ Волкова Е.Н.",
        rating: 4.8,
        views: 2100,
        skillLevel: "beginner",
    },
    {
        id: 6,
        title: "Атака на короля: Жертва качества",
        description: "Когда и как жертвовать качество для атаки на короля",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "14:35",
        price: 2200,
        access: 1,
        category: "tactics",
        categoryName: "Тактика",
        instructor: "ГМ Морозов А.И.",
        rating: 4.9,
        views: 1340,
        skillLevel: "rank-4-3",
    },
    {
        id: 7,
        title: "Испанская партия: Разменный вариант",
        description: "Стратегические идеи в разменном варианте испанской партии",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "19:45",
        price: 2800,
        access: 1,
        category: "debuts",
        categoryName: "Дебюты",
        instructor: "ГМ Белов С.М.",
        rating: 4.7,
        views: 923,
        skillLevel: "rank-2-1",
    },
    {
        id: 8,
        title: "Тактика: Связка и развязка",
        description: "Изучаем один из важнейших тактических мотивов",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "16:20",
        price: 2000,
        access: 1,
        category: "tactics",
        categoryName: "Тактика",
        instructor: "МГ Орлова К.В.",
        rating: 4.8,
        views: 1567,
        skillLevel: "master",
    },
    {
        id: 9,
        title: "Ладейные окончания: Основы",
        description: "Фундаментальные принципы игры в ладейных окончаниях",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "28:30",
        price: 0,
        access: 0,
        category: "endgame",
        categoryName: "Эндшпиль",
        instructor: "ГМ Смирнов П.А.",
        rating: 4.9,
        views: 2890,
        skillLevel: "beginner",
    },
    {
        id: 10,
        title: "Защита Каро-Канн: Главная линия",
        description: "Разбор главной линии защиты Каро-Канн с современными идеями",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "21:15",
        price: 2600,
        access: 1,
        category: "debuts",
        categoryName: "Дебюты",
        instructor: "ГМ Федоров Н.И.",
        rating: 4.6,
        views: 734,
        skillLevel: "rank-4-3",
    },
    {
        id: 11,
        title: "Планирование в миттельшпиле",
        description: "Как составлять планы в середине игры и реализовывать их",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "24:40",
        price: 3200,
        access: 1,
        category: "strategy",
        categoryName: "Стратегии",
        instructor: "ГМ Лебедев А.В.",
        rating: 4.8,
        views: 1456,
        skillLevel: "rank-2-1",
    },
    {
        id: 12,
        title: "Тактика: Отвлечение и завлечение",
        description: "Изучаем тактические приемы отвлечения и завлечения фигур",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "13:55",
        price: 1900,
        access: 1,
        category: "tactics",
        categoryName: "Тактика",
        instructor: "МГ Зайцева Л.П.",
        rating: 4.7,
        views: 1123,
        skillLevel: "master",
    },
    {
        id: 13,
        title: "Английское начало: Симметричный вариант",
        description: "Стратегические идеи в симметричном варианте английского начала",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "20:10",
        price: 2700,
        access: 1,
        category: "debuts",
        categoryName: "Дебюты",
        instructor: "ГМ Попов В.С.",
        rating: 4.5,
        views: 645,
        skillLevel: "beginner",
    },
    {
        id: 14,
        title: "Слоновые окончания",
        description: "Техника игры в окончаниях со слонами одного и разных цветов",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "26:25",
        price: 0,
        access: 0,
        category: "endgame",
        categoryName: "Эндшпиль",
        instructor: "МГ Кузнецова О.Д.",
        rating: 4.8,
        views: 1890,
        skillLevel: "rank-4-3",
    },
    {
        id: 15,
        title: "Защита от атаки на короля",
        description: "Как правильно защищаться при атаке противника на короля",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "17:30",
        price: 2400,
        access: 1,
        category: "strategy",
        categoryName: "Стратегии",
        instructor: "ГМ Романов Д.Е.",
        rating: 4.9,
        views: 1678,
        skillLevel: "rank-2-1",
    },
]

const categories = [
    { value: "all", label: "Все категории" },
    { value: "debuts", label: "Дебюты" },
    { value: "strategy", label: "Стратегии" },
    { value: "tactics", label: "Тактика" },
    { value: "endgame", label: "Эндшпиль" },
]

const accessTypes = [
    { value: "all", label: "Все видео" },
    { value: "free", label: "Бесплатные" },
    { value: "paid", label: "Платные" },
]

const skillLevels = [
    { value: "all", label: "Все уровни" },
    { value: "beginner", label: "Начинающий" },
    { value: "rank-4-3", label: "4-3 разряд" },
    { value: "rank-2-1", label: "2-1 разряд" },
    { value: "master", label: "КМС и выше" },
]

export const VideosView = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedAccess, setSelectedAccess] = useState("all")
    const [selectedSkillLevel, setSelectedSkillLevel] = useState("all")

    const filteredVideos = videos.filter((video) => {
        const matchesSearch =
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
        const matchesAccess =
            selectedAccess === "all" ||
            (selectedAccess === "free" && video.access === 0) ||
            (selectedAccess === "paid" && video.access === 1)
        const matchesSkillLevel = selectedSkillLevel === "all" || video.skillLevel === selectedSkillLevel

        return matchesSearch && matchesCategory && matchesAccess && matchesSkillLevel
    })

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                            <div className="relative">
                                <Image
                                    src={video.thumbnail || "/placeholder.svg"}
                                    alt={video.title}
                                    width={600}
                                    height={192}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                    {video.duration}
                                </div>
                                <div className="absolute top-2 left-2 flex gap-2">
                                    {video.access === 0 ? (
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
                                        {video.categoryName}
                                    </Badge>
                                    {video.price > 0 && (
                                        <span className="text-lg font-bold text-amber-600">{video.price.toLocaleString()} ₸</span>
                                    )}
                                </div>
                                <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
                                    {video.title}
                                </CardTitle>
                                <p className="text-sm text-slate-600 line-clamp-2">{video.description}</p>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                                    <span>{video.instructor}</span>
                                    <div className="flex items-center gap-2">
                                        <span>★ {video.rating}</span>
                                        <span>•</span>
                                        <span>{video.views} просмотров</span>
                                    </div>
                                </div>

                                <Button className="w-full" asChild>
                                    <Link href={`/video/${video.id}`}>
                                        {video.access === 0 ? (
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
                    ))}
                </div>

                {filteredVideos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-600 mb-2">Видео не найдены</h3>
                        <p className="text-slate-500">Попробуйте изменить параметры поиска или фильтры</p>
                    </div>
                )}
            </div>
        </div>
    )
}
