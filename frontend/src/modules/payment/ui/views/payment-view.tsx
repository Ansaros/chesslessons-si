"use client"

import type React from "react"
import { useState, useEffect } from "react"

import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    CreditCard,
    Smartphone,
    Building,
    Shield,
    CheckCircle,
    ArrowLeft,
    Lock
} from "lucide-react"

const videoData = {
    1: {
        id: 1,
        title: "Сицилианская защита: Вариант Найдорфа",
        thumbnail: "/placeholder.svg?height=200&width=300",
        price: 2500,
        category: "Дебюты",
        instructor: "ГМ Иванов А.С.",
        duration: "15:30",
    },
    3: {
        id: 3,
        title: "Тактика: Двойной удар",
        thumbnail: "/placeholder.svg?height=200&width=300",
        price: 1800,
        category: "Тактика",
        instructor: "ГМ Сидоров В.П.",
        duration: "12:45",
    },
    4: {
        id: 4,
        title: "Французская защита: Классический вариант",
        thumbnail: "/placeholder.svg?height=200&width=300",
        price: 3000,
        category: "Дебюты",
        instructor: "ГМ Козлов Д.А.",
        duration: "18:20",
    },
}

const paymentMethods = [
    {
        id: "card",
        name: "Банковская карта",
        icon: CreditCard,
        description: "Visa, MasterCard, МИР",
    },
    {
        id: "kaspi",
        name: "Kaspi Pay",
        icon: Smartphone,
        description: "Оплата через Kaspi.kz",
    },
    {
        id: "bank",
        name: "Банковский перевод",
        icon: Building,
        description: "Перевод на банковский счет",
    },
]

export const PaymentView = () => {
    const [videoId, setVideoId] = useState<number | null>(null)
    const [selectedMethod, setSelectedMethod] = useState("card")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardHolder: "",
        email: "",
        phone: "",
    })

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const id = urlParams.get("video")
        if (id) {
            setVideoId(Number.parseInt(id))
        }
    }, [])

    const video = videoId ? videoData[videoId as keyof typeof videoData] : null

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        setTimeout(() => {
            setIsProcessing(false)
            setIsSuccess(true)
        }, 3000)
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">Оплата успешна!</CardTitle>
                        <CardDescription>Доступ к видео &quot;{video?.title}&quot; активирован</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">
                                Вы можете начать просмотр прямо сейчас. Видео также доступно в вашем профиле.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="flex-1" asChild>
                                <Link href={`/video/${videoId}`}>Смотреть видео</Link>
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent" asChild>
                                <Link href="/profile">Мой профиль</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Видео не найдено</CardTitle>
                        <CardDescription>Проверьте правильность ссылки</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/videos">Вернуться к видео</Link>
                        </Button>
                    </CardContent>
                </Card>
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
                                src="/images/chess-logo.jpg"
                                alt="Chester Chess Club"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
                            </div>
                        </Link>
                        <Button variant="ghost" asChild>
                            <Link href={`/video/${videoId}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад к видео
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Детали заказа</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <Image
                                            src={video.thumbnail || "/placeholder.svg"}
                                            alt={video.title}
                                            width={96}
                                            height={64}
                                            className="w-24 h-16 object-cover rounded flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800 mb-1">{video.title}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{video.category}</Badge>
                                                <span className="text-sm text-slate-600">{video.duration}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{video.instructor}</p>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Стоимость видео:</span>
                                            <span>{video.price.toLocaleString()} ₸</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>НДС (12%):</span>
                                            <span>{Math.round(video.price * 0.12).toLocaleString()} ₸</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Итого:</span>
                                            <span className="text-amber-600">{video.price.toLocaleString()} ₸</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        Безопасность платежа
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            <span>SSL шифрование данных</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            <span>PCI DSS сертификация</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Защита персональных данных</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Способ оплаты</CardTitle>
                                    <CardDescription>Выберите удобный способ оплаты</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 mb-6">
                                        {paymentMethods.map((method) => {
                                            const IconComponent = method.icon
                                            return (
                                                <div
                                                    key={method.id}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === method.id
                                                        ? "border-amber-500 bg-amber-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconComponent className="w-5 h-5" />
                                                        <div>
                                                            <div className="font-medium">{method.name}</div>
                                                            <div className="text-sm text-slate-600">{method.description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <form onSubmit={handlePayment} className="space-y-4">
                                        {selectedMethod === "card" && (
                                            <>
                                                <div>
                                                    <Label htmlFor="cardNumber">Номер карты</Label>
                                                    <Input
                                                        id="cardNumber"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={formData.cardNumber}
                                                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="expiryDate">Срок действия</Label>
                                                        <Input
                                                            id="expiryDate"
                                                            placeholder="MM/YY"
                                                            value={formData.expiryDate}
                                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="cvv">CVV</Label>
                                                        <Input
                                                            id="cvv"
                                                            placeholder="123"
                                                            value={formData.cvv}
                                                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="cardHolder">Имя держателя карты</Label>
                                                    <Input
                                                        id="cardHolder"
                                                        placeholder="IVAN IVANOV"
                                                        value={formData.cardHolder}
                                                        onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {selectedMethod === "kaspi" && (
                                            <div>
                                                <Label htmlFor="phone">Номер телефона</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+7 (___) ___-__-__"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        )}

                                        {selectedMethod === "bank" && (
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800 mb-2">
                                                    После нажатия кнопки &quot;Оплатить&quot; вы получите реквизиты для банковского перевода.
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Доступ к видео будет активирован после поступления средств (обычно в течение 1-2 рабочих
                                                    дней).
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="email">Email для чека</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isProcessing}>
                                            {isProcessing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Обработка платежа...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Оплатить {video.price.toLocaleString()} ₸
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-4 text-xs text-slate-500 text-center">
                                        Нажимая &quot;Оплатить&quot;, вы соглашаетесь с{" "}
                                        <Link href="/terms" className="text-amber-600 hover:text-amber-700">
                                            условиями использования
                                        </Link>{" "}
                                        и{" "}
                                        <Link href="/privacy" className="text-amber-600 hover:text-amber-700">
                                            политикой конфиденциальности
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
