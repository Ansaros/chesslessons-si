"use client"

import { useState } from "react"

import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

import {
    Upload,
    Plus,
    Edit,
    Trash2,
    Eye,
    DollarSign,
    Users,
    PlayCircle,
    Settings,
    BarChart3
} from "lucide-react"


// interface Props {
//     adminId: string;
// }
// Mock data
const mockVideos = [
    {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        category: "debuts",
        categoryName: "Дебюты",
        price: 2500,
        access: 1,
        views: 1250,
        purchases: 89,
        status: "published",
        createdAt: "2024-01-15",
        skillLevel: "beginner",
        accessType: "purchase",
    },
    {
        id: 2,
        title: "Основы позиционной игры",
        category: "strategy",
        categoryName: "Стратегии",
        price: 0,
        access: 0,
        views: 3420,
        purchases: 0,
        status: "published",
        createdAt: "2024-01-10",
        skillLevel: "intermediate",
        accessType: "free",
    },
    {
        id: 3,
        title: "Тактика: Двойной удар",
        category: "tactics",
        categoryName: "Тактика",
        price: 1800,
        access: 1,
        views: 890,
        purchases: 45,
        status: "draft",
        createdAt: "2024-01-20",
        skillLevel: "advanced",
        accessType: "subscription",
    },
]

const categories = [
    { value: "debuts", label: "Дебюты" },
    { value: "strategy", label: "Стратегии" },
    { value: "tactics", label: "Тактика" },
    { value: "endgame", label: "Эндшпиль" },
]

export const AdminView = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [videos, setVideos] = useState(mockVideos)
    const [showAddVideo, setShowAddVideo] = useState(false)
    const [newVideo, setNewVideo] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
        access: "0",
        videoFile: null as File | null,
        thumbnailFile: null as File | null,
    })

    const handleAddVideo = () => {
        const video = {
            id: videos.length + 1,
            title: newVideo.title,
            category: newVideo.category,
            categoryName: categories.find((c) => c.value === newVideo.category)?.label || "",
            price: Number.parseInt(newVideo.price) || 0,
            access: Number.parseInt(newVideo.access),
            views: 0,
            purchases: 0,
            status: "draft" as const,
            createdAt: new Date().toISOString().split("T")[0],
            skillLevel: "beginner",
            accessType: "purchase",
        }

        setVideos([...videos, video])
        setNewVideo({
            title: "",
            description: "",
            category: "",
            price: "",
            access: "0",
            videoFile: null,
            thumbnailFile: null,
        })
        setShowAddVideo(false)
    }

    const handleDeleteVideo = (id: number) => {
        setVideos(videos.filter((v) => v.id !== id))
    }

    const totalRevenue = videos.reduce((sum, video) => sum + video.price * video.purchases, 0)
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0)
    const totalPurchases = videos.reduce((sum, video) => sum + video.purchases, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/images/chess-logo.png"
                                alt="Chester Chess Club"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                                <p className="text-xs text-slate-600">Админ панель</p>
                            </div>
                        </div>
                        <nav className="flex items-center space-x-6">
                            <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
                                На сайт
                            </Link>
                            <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Выйти
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-64">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "overview" ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100"
                                        }`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Обзор
                                </button>
                                <button
                                    onClick={() => setActiveTab("videos")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "videos" ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100"
                                        }`}
                                >
                                    <PlayCircle className="w-5 h-5" />
                                    Видео
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "users" ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100"
                                        }`}
                                >
                                    <Users className="w-5 h-5" />
                                    Пользователи
                                </button>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "settings" ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100"
                                        }`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Настройки
                                </button>
                                <button
                                    onClick={() => (window.location.href = "/admin/analytics")}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Аналитика
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="flex-1">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Обзор</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ₸</div>
                                            <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Всего просмотров</CardTitle>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                                            <p className="text-xs text-muted-foreground">+8% с прошлого месяца</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Покупки</CardTitle>
                                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalPurchases}</div>
                                            <p className="text-xs text-muted-foreground">+15% с прошлого месяца</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Всего видео</CardTitle>
                                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{videos.length}</div>
                                            <p className="text-xs text-muted-foreground">+2 за этот месяц</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Подписчики</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">45</div>
                                            <p className="text-xs text-muted-foreground">+5 за этот месяц</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Последняя активность</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm">Новая покупка: &quot;Сицилианская защита: Вариант Найдорфа&quot;</span>
                                                <span className="text-xs text-slate-500 ml-auto">2 мин назад</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm">Новый пользователь зарегистрировался</span>
                                                <span className="text-xs text-slate-500 ml-auto">15 мин назад</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                <span className="text-sm">Видео &quot;Тактика: Двойной удар&quot; опубликовано</span>
                                                <span className="text-xs text-slate-500 ml-auto">1 час назад</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === "videos" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-slate-800">Управление видео</h2>
                                    <Button onClick={() => setShowAddVideo(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Добавить видео
                                    </Button>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Все видео</CardTitle>
                                        <CardDescription>Управляйте своими видеоуроками</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Название</TableHead>
                                                    <TableHead>Категория</TableHead>
                                                    <TableHead>Цена</TableHead>
                                                    <TableHead>Просмотры</TableHead>
                                                    <TableHead>Покупки</TableHead>
                                                    <TableHead>Статус</TableHead>
                                                    <TableHead>Действия</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {videos.map((video) => (
                                                    <TableRow key={video.id}>
                                                        <TableCell className="font-medium">{video.title}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{video.categoryName}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {video.price === 0 ? (
                                                                <Badge className="bg-green-500">Бесплатно</Badge>
                                                            ) : (
                                                                <span className="font-semibold">{video.price.toLocaleString()} ₸</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{video.views.toLocaleString()}</TableCell>
                                                        <TableCell>{video.purchases}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={video.status === "published" ? "default" : "secondary"}>
                                                                {video.status === "published" ? "Опубликовано" : "Черновик"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button size="sm" variant="outline">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" variant="outline">
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => handleDeleteVideo(video.id)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === "users" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Пользователи</h2>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Список пользователей</CardTitle>
                                        <CardDescription>Управление пользователями платформы</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">
                                            Функционал управления пользователями будет добавлен после подключения бэкенда.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Настройки</h2>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Общие настройки</CardTitle>
                                        <CardDescription>Конфигурация платформы</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">Настройки будут добавлены после подключения бэкенда.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAddVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Добавить новое видео</h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Название видео</Label>
                                <Input
                                    id="title"
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    placeholder="Введите название видео"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Описание</Label>
                                <Textarea
                                    id="description"
                                    value={newVideo.description}
                                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                    placeholder="Описание видео"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Категория</Label>
                                    <Select
                                        value={newVideo.category}
                                        onValueChange={(value) => setNewVideo({ ...newVideo, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите категорию" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="access">Тип доступа</Label>
                                    <Select
                                        value={newVideo.access}
                                        onValueChange={(value) => setNewVideo({ ...newVideo, access: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Бесплатно</SelectItem>
                                            <SelectItem value="1">Платно</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {newVideo.access === "1" && (
                                <div>
                                    <Label htmlFor="price">Цена (₸)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={newVideo.price}
                                        onChange={(e) => setNewVideo({ ...newVideo, price: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="video">Видеофайл</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600">Перетащите видеофайл сюда или нажмите для выбора</p>
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => setNewVideo({ ...newVideo, videoFile: e.target.files?.[0] || null })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="thumbnail">Превью (миниатюра)</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600">Перетащите изображение сюда или нажмите для выбора</p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setNewVideo({ ...newVideo, thumbnailFile: e.target.files?.[0] || null })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleAddVideo} className="flex-1">
                                Добавить видео
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddVideo(false)}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
