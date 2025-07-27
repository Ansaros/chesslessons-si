"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Settings,
    ShoppingBag,
    Play,
    Star,
    Edit,
    Save
} from "lucide-react"

// import { useAuth } from "@/hooks/use-auth"
import { authService, TokenStorage } from "@/services/auth/auth-service"

// Mock user data
const userData = {
    id: 1,
    firstName: "Алексей",
    lastName: "Иванов",
    email: "alexey@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    joinDate: "2024-01-15",
    totalPurchases: 5,
    totalSpent: 12500,
    favoriteCategory: "Дебюты",
}

// Mock purchased videos
const purchasedVideos = [
    {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        thumbnail: "/placeholder.svg?height=120&width=200",
        category: "Дебюты",
        price: 2500,
        purchaseDate: "2024-01-20",
        progress: 85,
        rating: 5,
    },
    {
        id: 3,
        title: "Тактика: Двойной удар",
        thumbnail: "/placeholder.svg?height=120&width=200",
        category: "Тактика",
        price: 1800,
        purchaseDate: "2024-01-18",
        progress: 100,
        rating: 4,
    },
    {
        id: 4,
        title: "Французская защита: Классический вариант",
        thumbnail: "/placeholder.svg?height=120&width=200",
        category: "Дебюты",
        price: 3000,
        purchaseDate: "2024-01-22",
        progress: 45,
        rating: 0,
    },
    {
        id: 8,
        title: "Тактика: Связка и развязка",
        thumbnail: "/placeholder.svg?height=120&width=200",
        category: "Тактика",
        price: 2000,
        purchaseDate: "2024-01-25",
        progress: 70,
        rating: 5,
    },
    {
        id: 11,
        title: "Планирование в миттельшпиле",
        thumbnail: "/placeholder.svg?height=120&width=200",
        category: "Стратегии",
        price: 3200,
        purchaseDate: "2024-01-28",
        progress: 30,
        rating: 0,
    },
]

export const ProfileView = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
    })

    const handleSave = () => {
        setIsEditing(false)
    }

    useEffect(() => {
        const token = TokenStorage.getAccessToken();
        if (token) {
            setUserEmail('user@example.com');
        }
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            console.log('Logout successful, redirecting to login');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

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
                            <Link href="/videos" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Видеоуроки
                            </Link>
                            <Link href="/profile" className="text-amber-600 font-medium">
                                Профиль
                            </Link>
                            <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Выйти
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <Avatar className="w-24 h-24 mx-auto mb-4">
                                    <AvatarImage
                                        src={userData.avatar || "/placeholder.svg"}
                                        alt={`${userData.firstName} ${userData.lastName}`}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {userData.firstName[0]}
                                        {userData.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle>
                                    {userData.firstName} {userData.lastName}
                                </CardTitle>
                                <CardDescription>{userData.email}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Дата регистрации:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(userData.joinDate).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Покупок:</span>
                                        <Badge>{userData.totalPurchases}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Потрачено:</span>
                                        <span className="text-sm font-semibold text-amber-600">
                                            {userData.totalSpent.toLocaleString()} ₸
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Любимая категория:</span>
                                        <Badge variant="outline">{userData.favoriteCategory}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        <Tabs defaultValue="purchases" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="purchases" className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Покупки
                                </TabsTrigger>
                                <TabsTrigger value="progress" className="flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Прогресс
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Настройки
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="purchases">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Мои покупки</CardTitle>
                                        <CardDescription>
                                            Видео, которые вы приобрели ({purchasedVideos.length} из {purchasedVideos.length})
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {purchasedVideos.map((video) => (
                                                <div key={video.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex gap-4">
                                                        <Image
                                                            src={video.thumbnail || "/placeholder.svg"}
                                                            alt={video.title}
                                                            width={96}
                                                            height={64}
                                                            className="w-24 h-16 object-cover rounded flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-800 line-clamp-2 mb-1">{video.title}</h4>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {video.category}
                                                                </Badge>
                                                                <span className="text-xs text-slate-500">{video.price.toLocaleString()} ₸</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-500">
                                                                    Куплено: {new Date(video.purchaseDate).toLocaleDateString("ru-RU")}
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    {video.rating > 0 ? (
                                                                        <>
                                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                            <span className="text-xs">{video.rating}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-400">Не оценено</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <div className="flex items-center justify-between text-xs mb-1">
                                                                    <span>Прогресс</span>
                                                                    <span>{video.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                                                                        style={{ width: `${video.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" className="w-full mt-3" asChild>
                                                                <Link href={`/video/${video.id}`}>
                                                                    {video.progress === 100 ? "Пересмотреть" : "Продолжить"}
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="progress">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Прогресс обучения</CardTitle>
                                        <CardDescription>Ваши достижения и статистика просмотров</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                                <div className="text-2xl font-bold text-slate-800 mb-1">
                                                    {purchasedVideos.filter((v) => v.progress === 100).length}
                                                </div>
                                                <div className="text-sm text-slate-600">Завершено</div>
                                            </div>
                                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                                <div className="text-2xl font-bold text-slate-800 mb-1">
                                                    {purchasedVideos.filter((v) => v.progress > 0 && v.progress < 100).length}
                                                </div>
                                                <div className="text-sm text-slate-600">В процессе</div>
                                            </div>
                                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                                <div className="text-2xl font-bold text-slate-800 mb-1">
                                                    {Math.round(purchasedVideos.reduce((sum, v) => sum + v.progress, 0) / purchasedVideos.length)}
                                                    %
                                                </div>
                                                <div className="text-sm text-slate-600">Общий прогресс</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-800">Детальный прогресс</h4>
                                            {purchasedVideos.map((video) => (
                                                <div key={video.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                                    <Image
                                                        src={video.thumbnail || "/placeholder.svg"}
                                                        alt={video.title}
                                                        width={64}
                                                        height={40}
                                                        className="w-16 h-10 object-cover rounded flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-slate-800 mb-1">{video.title}</h5>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between text-xs mb-1">
                                                                    <span className="text-slate-600">Прогресс</span>
                                                                    <span className="font-medium">{video.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-amber-500 h-2 rounded-full transition-all"
                                                                        style={{ width: `${video.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <Badge variant={video.progress === 100 ? "default" : "secondary"}>
                                                                {video.progress === 100 ? "Завершено" : "В процессе"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Настройки профиля</CardTitle>
                                                <CardDescription>Управление личной информацией</CardDescription>
                                            </div>
                                            {!isEditing ? (
                                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Редактировать
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button onClick={handleSave}>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Сохранить
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                        Отмена
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="firstName">Имя</Label>
                                                    <Input
                                                        id="firstName"
                                                        value={editData.firstName}
                                                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lastName">Фамилия</Label>
                                                    <Input
                                                        id="lastName"
                                                        value={editData.lastName}
                                                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editData.email}
                                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                            <div className="pt-6 border-t">
                                                <h4 className="font-semibold text-slate-800 mb-4">Безопасность</h4>
                                                <div className="space-y-3">
                                                    <Button variant="outline" className="w-full justify-start bg-transparent">
                                                        Изменить пароль
                                                    </Button>
                                                    <Button variant="outline" className="w-full justify-start bg-transparent">
                                                        Двухфакторная аутентификация
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t">
                                                <h4 className="font-semibold text-slate-800 mb-4">Уведомления</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Email уведомления</span>
                                                        <Button variant="outline" size="sm">
                                                            Настроить
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Новые видео</span>
                                                        <Button variant="outline" size="sm">
                                                            Настроить
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
