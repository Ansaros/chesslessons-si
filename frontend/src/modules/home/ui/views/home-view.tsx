"use client"

import Link from "next/link"
import Image from "next/image"

import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    Play,
    Users,
    Trophy,
    BookOpen,
    Zap,
} from "lucide-react"

const categories = [
    {
        id: 1,
        name: "Дебюты",
        description: "Изучите классические и современные дебюты",
        icon: BookOpen,
        videoCount: 45,
        color: "bg-blue-500",
    },
    {
        id: 2,
        name: "Стратегии",
        description: "Позиционная игра и долгосрочное планирование",
        icon: Trophy,
        videoCount: 32,
        color: "bg-green-500",
    },
    {
        id: 3,
        name: "Тактика",
        description: "Комбинации, жертвы и тактические приемы",
        icon: Zap,
        videoCount: 67,
        color: "bg-red-500",
    },
    {
        id: 4,
        name: "Эндшпиль",
        description: "Техника игры в окончаниях",
        icon: Users,
        videoCount: 28,
        color: "bg-purple-500",
    },
]

const featuredVideos = [
    {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "15:30",
        price: 2500,
        access: 1,
        category: "Дебюты",
    },
    {
        id: 2,
        title: "Основы позиционной игры",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "22:15",
        price: 0,
        access: 0,
        category: "Стратегии",
    },
    {
        id: 3,
        title: "Тактика: Двойной удар",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "12:45",
        price: 1800,
        access: 1,
        category: "Тактика",
    },
]

export const HomeView = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated === null) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/images/chess-logo.png"
                                alt="Chester Chess Club"
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Chester Chess Club</h1>
                                <p className="text-xs text-slate-600">Школа Шахмат</p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center space-x-6">
                            {!isAuthenticated && (
                                <Link href="/videos" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Видеоуроки
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link href="/demo" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Демо
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link href="/profile" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Профиль
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                    Войти
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <div className="text-center mb-8">
                        <Image
                            src="/images/chess-logo.png"
                            alt="Chester Chess Club"
                            width={96}
                            height={96}
                            className="rounded-full object-cover mx-auto mb-4 shadow-lg"
                        />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
                        Изучайте шахматы в <span className="text-green-600">Chester Chess Club</span>
                    </h2>
                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        Профессиональные видеоуроки от гроссмейстеров и международных мастеров. Повысьте свой уровень игры с нашими
                        структурированными курсами.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                            <Link href="/videos">
                                <Play className="w-5 h-5 mr-2" />
                                Начать обучение
                            </Link>
                        </Button>
                        {!isAuthenticated && (
                            <Button asChild variant="outline" size="lg">
                                <Link href="/register">Регистрация</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Категории обучения</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => {
                            const IconComponent = category.icon
                            return (
                                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                                    <CardHeader className="text-center">
                                        <div
                                            className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                                        >
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-xl">{category.name}</CardTitle>
                                        <CardDescription>{category.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <Badge variant="secondary">{category.videoCount} видео</Badge>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Рекомендуемые уроки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredVideos.map((video) => (
                            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <Image
                                        src={video.thumbnail || "/placeholder.svg"}
                                        alt={video.title}
                                        width={600}
                                        height={192}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                        {video.duration}
                                    </div>
                                    {video.access === 0 && <Badge className="absolute top-2 left-2 bg-green-500">Бесплатно</Badge>}
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline">{video.category}</Badge>
                                        {video.price > 0 && (
                                            <span className="text-lg font-bold text-amber-600">{video.price.toLocaleString()} ₸</span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" asChild>
                                        <Link href={`/video/${video.id}`}>{video.access === 0 ? "Смотреть" : "Купить и смотреть"}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-slate-800 text-white py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <Link href="/" className="inline-flex items-center space-x-2">
                                <Image
                                    src="/images/chess-logo.png"
                                    alt="Chester Chess Club"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover shadow-lg"
                                />
                                <h1 className="text-xl font-bold">Chesster Chess Club</h1>
                            </Link>
                            <p className="text-slate-300">Профессиональное обучение шахматам онлайн</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Обучение</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>
                                    <Link href="/videos?category=debuts">Дебюты</Link>
                                </li>
                                <li>
                                    <Link href="/videos?category=strategy">Стратегии</Link>
                                </li>
                                <li>
                                    <Link href="/videos?category=tactics">Тактика</Link>
                                </li>
                                <li>
                                    <Link href="/videos?category=endgame">Эндшпиль</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Аккаунт</h4>
                            <ul className="space-y-2 text-slate-300">
                                {isAuthenticated && (
                                    <>
                                        <li><Link href="/profile">Профиль</Link></li>
                                        <li><Link href="/purchases">Покупки</Link></li>
                                    </>
                                )}
                                {!isAuthenticated && (
                                    <>
                                        <li><Link href="/login">Войти</Link></li>
                                        <li><Link href="/register">Регистрация</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Поддержка</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>
                                    <Link href="/help">Помощь</Link>
                                </li>
                                <li>
                                    <Link href="/contact">Контакты</Link>
                                </li>
                                <li>
                                    <Link href="/terms">Условия</Link>
                                </li>
                                <li>
                                    <Link href="/privacy">Конфиденциальность</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
                        <p>&copy; 2025 ChessMaster. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}


export default HomeView;