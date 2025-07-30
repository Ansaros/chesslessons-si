"use client"

import { useState, useEffect, useRef } from "react"

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
import { toast } from "sonner"

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
    BarChart3,
    Loader2
} from "lucide-react"
import { LogoutButton } from "@/modules/auth/ui/components/logout-component"
import { adminService, AdminVideo, AdminService } from "@/services/admin/admin-service"
import { authService } from "@/services/auth/auth-service"

const categories = [
    { value: "debuts", label: "Дебюты" },
    { value: "strategy", label: "Стратегии" },
    { value: "tactics", label: "Тактика" },
    { value: "endgame", label: "Эндшпиль" },
]

export const AdminView = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [videos, setVideos] = useState<AdminVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddVideo, setShowAddVideo] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [newVideo, setNewVideo] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
        access: "0",
        videoFile: null as File | null,
        thumbnailFile: null as File | null,
    })

    const videoFileRef = useRef<HTMLInputElement>(null)
    const thumbnailFileRef = useRef<HTMLInputElement>(null)

    // Initialize admin service with token
    useEffect(() => {
        const token = authService.getAccessToken()
        if (token) {
            adminService.setToken(token)
        }
    }, [])

    // Fetch videos on component mount
    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            setLoading(true)
            const response = await adminService.fetchVideos()
            setVideos(response.data)
        } catch (error) {
            console.error("Error fetching videos:", error)
            toast.error("Не удалось загрузить видео")
        } finally {
            setLoading(false)
        }
    }

    const handleAddVideo = async () => {
        if (!newVideo.videoFile || !newVideo.thumbnailFile) {
            toast.error("Пожалуйста, выберите видео и превью файлы")
            return
        }

        try {
            setUploading(true)
            const formData = AdminService.buildVideoForm({
                video_file: newVideo.videoFile,
                preview_file: newVideo.thumbnailFile,
                title: newVideo.title,
                description: newVideo.description,
                price: newVideo.price || "0",
                access_level: parseInt(newVideo.access),
            })

            await adminService.uploadVideo(formData)
            
            toast.success("Видео успешно добавлено")
            
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
            fetchVideos() // Refresh the list
        } catch (error) {
            console.error("Error uploading video:", error)
            toast.error("Не удалось загрузить видео")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteVideo = async (id: string) => {
        try {
            await adminService.deleteVideo(id)
            toast.success("Видео успешно удалено")
            fetchVideos() // Refresh the list
        } catch (error) {
            console.error("Error deleting video:", error)
            toast.error("Не удалось удалить видео")
        }
    }

    const handleFileSelect = (file: File, type: 'video' | 'thumbnail') => {
        if (type === 'video') {
            setNewVideo({ ...newVideo, videoFile: file })
        } else {
            setNewVideo({ ...newVideo, thumbnailFile: file })
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    }

    const handleDrop = (e: React.DragEvent, type: 'video' | 'thumbnail') => {
        e.preventDefault()
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
        
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            const file = files[0]
            if (type === 'video' && file.type.startsWith('video/')) {
                handleFileSelect(file, 'video')
            } else if (type === 'thumbnail' && file.type.startsWith('image/')) {
                handleFileSelect(file, 'thumbnail')
            } else {
                toast.error(`Пожалуйста, выберите ${type === 'video' ? 'видео' : 'изображение'} файл`)
            }
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file, type)
        }
    }

    const totalRevenue = videos.reduce((sum, video) => sum + (parseFloat(video.price) * (video.views_count || 0)), 0)
    const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0)

    const formatPrice = (price: string) => {
        const numPrice = parseFloat(price)
        return numPrice === 0 ? "Бесплатно" : `${numPrice.toLocaleString()} ₸`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU')
    }

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
                            <LogoutButton
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-800"
                                showIcon={true}
                                showText={true}
                            />
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
                                        {loading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span className="ml-2">Загрузка видео...</span>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Название</TableHead>
                                                        <TableHead>Цена</TableHead>
                                                        <TableHead>Просмотры</TableHead>
                                                        <TableHead>Дата создания</TableHead>
                                                        <TableHead>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {videos.map((video) => (
                                                        <TableRow key={video.id}>
                                                            <TableCell className="font-medium">{video.title}</TableCell>
                                                            <TableCell>
                                                                {video.access_level === 0 ? (
                                                                    <Badge className="bg-green-500">Бесплатно</Badge>
                                                                ) : (
                                                                    <span className="font-semibold">{formatPrice(video.price)}</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{video.views_count?.toLocaleString() || 0}</TableCell>
                                                            <TableCell>{formatDate(video.created_at)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Button size="sm" variant="outline">
                                                                        <Eye className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline">
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline" 
                                                                        onClick={() => handleDeleteVideo(video.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
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
                            <div className="grid gap-3">
                                <Label htmlFor="title">Название видео</Label>
                                <Input
                                    id="title"
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    placeholder="Введите название видео"
                                />
                            </div>

                            <div className="grid gap-3">
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
                                <div className="grid gap-3">
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

                                <div className="grid gap-3">
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
                                <div className="grid gap-3">
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

                            <div className="grid gap-3">
                                <Label htmlFor="video">Видеофайл</Label>
                                <div 
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-slate-400 hover:bg-slate-50"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, 'video')}
                                    onClick={() => videoFileRef.current?.click()}
                                >
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600 mb-2">
                                        {newVideo.videoFile ? newVideo.videoFile.name : "Перетащите видеофайл сюда или нажмите для выбора"}
                                    </p>
                                    {newVideo.videoFile && (
                                        <p className="text-xs text-green-600">✓ Файл выбран</p>
                                    )}
                                    <Input
                                        ref={videoFileRef}
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => handleFileInputChange(e, 'video')}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="thumbnail">Превью (миниатюра)</Label>
                                <div 
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-slate-400 hover:bg-slate-50"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, 'thumbnail')}
                                    onClick={() => thumbnailFileRef.current?.click()}
                                >
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600 mb-2">
                                        {newVideo.thumbnailFile ? newVideo.thumbnailFile.name : "Перетащите изображение сюда или нажмите для выбора"}
                                    </p>
                                    {newVideo.thumbnailFile && (
                                        <p className="text-xs text-green-600">✓ Файл выбран</p>
                                    )}
                                    <Input
                                        ref={thumbnailFileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileInputChange(e, 'thumbnail')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button 
                                onClick={handleAddVideo} 
                                className="flex-1"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Загрузка...
                                    </>
                                ) : (
                                    "Добавить видео"
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="flex-1 bg-transparent" 
                                onClick={() => setShowAddVideo(false)}
                                disabled={uploading}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
