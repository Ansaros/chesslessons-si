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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"

import {
    Settings,
    ShoppingBag,
    Play,
    Star,
    Edit,
    Save,
    Loader2
} from "lucide-react"

import { authService, TokenStorage } from "@/services/auth/auth-service"
import { profileService, Profile, ProfileUpdate, PasswordUpdate, ChessLevel } from "@/services/profile/profile-service"
import { LogoutButton } from "@/modules/auth/ui/components/logout-component"

// Mock purchased videos (keeping this for now as it's not part of the profile API)
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
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [chessLevels, setChessLevels] = useState<ChessLevel[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [editData, setEditData] = useState<ProfileUpdate>({
        chess_level_id: ""
    });
    const [passwordData, setPasswordData] = useState<PasswordUpdate>({
        password: ""
    });

    // Initialize profile service with token
    useEffect(() => {
        const token = TokenStorage.getAccessToken();
        if (token) {
            profileService.setToken(token);
            fetchProfile();
            fetchChessLevels();
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const profileData = await profileService.getProfile();
            setProfile(profileData);
            setEditData({ chess_level_id: profileData.chess_level_id });
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Не удалось загрузить профиль");
        } finally {
            setLoading(false);
        }
    };

    const fetchChessLevels = async () => {
        try {
            const levels = await profileService.getChessLevels();
            setChessLevels(levels);
        } catch (error) {
            console.error("Error fetching chess levels:", error);
            toast.error("Не удалось загрузить уровни игры");
        }
    };

    const handleSaveProfile = async () => {
        try {
            const updatedProfile = await profileService.updateProfile(editData);
            setProfile(updatedProfile);
            setIsEditing(false);
            toast.success("Профиль успешно обновлен");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Не удалось обновить профиль");
        }
    };

    const handleChangePassword = async () => {
        try {
            await profileService.updatePassword(passwordData);
            setPasswordData({ password: "" });
            setIsChangingPassword(false);
            toast.success("Пароль успешно изменен");
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Не удалось изменить пароль");
        }
    };

    const getChessLevelName = (chessLevelId: string): string => {
        const level = chessLevels.find(l => l.id === chessLevelId);
        return level?.value || "Неизвестный уровень";
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Загрузка профиля...</span>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Не удалось загрузить профиль</p>
                    <Button onClick={() => fetchProfile()}>Попробовать снова</Button>
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
                            <Link href="/videos" className="text-slate-600 hover:text-slate-800 transition-colors">
                                Видеоуроки
                            </Link>
                            <Link href="/profile" className="text-amber-600 font-medium">
                                Профиль
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <Avatar className="w-24 h-24 mx-auto mb-4">
                                    <AvatarImage
                                        src="/placeholder.svg"
                                        alt={profile.email}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {profile.email[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle>
                                    {profile.email}
                                </CardTitle>
                                <CardDescription>Пользователь</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Email:</span>
                                        <span className="text-sm font-medium">{profile.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Уровень игры:</span>
                                        <Badge>{getChessLevelName(profile.chess_level_id)}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Покупок:</span>
                                        <Badge>{purchasedVideos.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Потрачено:</span>
                                        <span className="text-sm font-semibold text-amber-600">
                                            {purchasedVideos.reduce((sum, v) => sum + v.price, 0).toLocaleString()} ₸
                                        </span>
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
                                                    <Button onClick={handleSaveProfile}>
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
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="bg-slate-50"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">Email нельзя изменить</p>
                                            </div>

                                            <div>
                                                <Label htmlFor="chessLevel">Уровень игры</Label>
                                                <Select
                                                    value={editData.chess_level_id}
                                                    onValueChange={(value) => setEditData({ ...editData, chess_level_id: value })}
                                                    disabled={!isEditing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите уровень игры" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {chessLevels.map((level) => (
                                                            <SelectItem key={level.id} value={level.id}>
                                                                {level.value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="pt-6 border-t">
                                                <h4 className="font-semibold text-slate-800 mb-4">Безопасность</h4>
                                                <div className="space-y-3">
                                                    {!isChangingPassword ? (
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-full justify-start bg-transparent"
                                                            onClick={() => setIsChangingPassword(true)}
                                                        >
                                                            Изменить пароль
                                                        </Button>
                                                    ) : (
                                                        <div className="space-y-3 p-4 border rounded-lg">
                                                            <div>
                                                                <Label htmlFor="newPassword">Новый пароль</Label>
                                                                <Input
                                                                    id="newPassword"
                                                                    type="password"
                                                                    value={passwordData.password}
                                                                    onChange={(e) => setPasswordData({ password: e.target.value })}
                                                                    placeholder="Введите новый пароль"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button onClick={handleChangePassword}>
                                                                    Сохранить пароль
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    onClick={() => {
                                                                        setIsChangingPassword(false);
                                                                        setPasswordData({ password: "" });
                                                                    }}
                                                                >
                                                                    Отмена
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
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
