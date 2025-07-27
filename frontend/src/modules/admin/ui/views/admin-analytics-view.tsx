"use client"

import { useState } from "react"

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Users,
    DollarSign,
    TrendingUp,
    Download,
    Search,
    Calendar,
    ShoppingCart,
} from "lucide-react"

const userPurchases = [
  {
    id: 1,
    userName: "Алексей Иванов",
    email: "alexey@example.com",
    skillLevel: "rank-2-1",
    videoTitle: "Сицилианская защита: Вариант Найдорфа",
    price: 2500,
    purchaseDate: "2024-01-20",
    paymentMethod: "card",
    status: "completed",
  },
  {
    id: 2,
    userName: "Мария Петрова",
    email: "maria@example.com",
    skillLevel: "beginner",
    videoTitle: "Тактика: Двойной удар",
    price: 1800,
    purchaseDate: "2024-01-19",
    paymentMethod: "kaspi",
    status: "completed",
  },
  {
    id: 3,
    userName: "Дмитрий Сидоров",
    email: "dmitry@example.com",
    skillLevel: "master",
    videoTitle: "Французская защита: Классический вариант",
    price: 3000,
    purchaseDate: "2024-01-18",
    paymentMethod: "card",
    status: "completed",
  },
  {
    id: 4,
    userName: "Елена Козлова",
    email: "elena@example.com",
    skillLevel: "rank-4-3",
    videoTitle: "Планирование в миттельшпиле",
    price: 3200,
    purchaseDate: "2024-01-17",
    paymentMethod: "subscription",
    status: "completed",
  },
  {
    id: 5,
    userName: "Андрей Волков",
    email: "andrey@example.com",
    skillLevel: "beginner",
    videoTitle: "Тактика: Связка и развязка",
    price: 2000,
    purchaseDate: "2024-01-16",
    paymentMethod: "card",
    status: "pending",
  },
]

const skillLevelStats = [
  { level: "beginner", label: "Начинающий", users: 145, revenue: 87500, color: "bg-green-500" },
  { level: "rank-4-3", label: "4-3 разряд", users: 89, revenue: 156300, color: "bg-blue-500" },
  { level: "rank-2-1", label: "2-1 разряд", users: 67, revenue: 198400, color: "bg-purple-500" },
  { level: "master", label: "КМС и выше", users: 34, revenue: 245600, color: "bg-amber-500" },
]

const paymentMethodStats = [
  { method: "card", label: "Банковская карта", count: 156, percentage: 52 },
  { method: "kaspi", label: "Kaspi Pay", count: 89, percentage: 30 },
  { method: "subscription", label: "Подписка", count: 45, percentage: 15 },
  { method: "bank", label: "Банковский перевод", count: 9, percentage: 3 },
]

export const AdminAnalyticsView = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateRange, setDateRange] = useState("30")

  const filteredPurchases = userPurchases.filter((purchase) => {
    const matchesSearch =
      purchase.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.videoTitle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSkillLevel = selectedSkillLevel === "all" || purchase.skillLevel === selectedSkillLevel
    const matchesStatus = selectedStatus === "all" || purchase.status === selectedStatus

    return matchesSearch && matchesSkillLevel && matchesStatus
  })

  const totalRevenue = userPurchases.reduce((sum, purchase) => sum + purchase.price, 0)
  const totalUsers = new Set(userPurchases.map((p) => p.email)).size
  const completedPurchases = userPurchases.filter((p) => p.status === "completed").length

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
              <Link href="/admin" className="text-slate-600 hover:text-slate-800 transition-colors">
                Главная
              </Link>
              <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
                На сайт
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Аналитика и покупки</h1>
          <p className="text-slate-600">Детальная статистика по пользователям и продажам</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} ₸</div>
              <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">+8% с прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершенные покупки</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPurchases}</div>
              <p className="text-xs text-muted-foreground">+15% с прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.4%</div>
              <p className="text-xs text-muted-foreground">+2.1% с прошлого месяца</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по уровням</CardTitle>
              <CardDescription>Распределение пользователей и доходов по уровням игры</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillLevelStats.map((stat) => (
                  <div key={stat.level} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${stat.color}`}></div>
                      <div>
                        <div className="font-medium">{stat.label}</div>
                        <div className="text-sm text-slate-600">{stat.users} пользователей</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{stat.revenue.toLocaleString()} ₸</div>
                      <div className="text-sm text-slate-600">средний доход</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
              <CardDescription>Популярность различных методов оплаты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodStats.map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{method.label}</div>
                      <Badge variant="outline">{method.count} транзакций</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${method.percentage}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{method.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Детальная статистика покупок</CardTitle>
                <CardDescription>Полная информация о всех транзакциях пользователей</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по имени, email или видео..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Уровень игры" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="beginner">Начинающий</SelectItem>
                    <SelectItem value="rank-4-3">4-3 разряд</SelectItem>
                    <SelectItem value="rank-2-1">2-1 разряд</SelectItem>
                    <SelectItem value="master">КМС и выше</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="failed">Неудачно</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 дней</SelectItem>
                    <SelectItem value="30">30 дней</SelectItem>
                    <SelectItem value="90">90 дней</SelectItem>
                    <SelectItem value="365">1 год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-slate-600">
                Найдено {filteredPurchases.length} {filteredPurchases.length === 1 ? "транзакция" : "транзакций"}
              </p>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Видео</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Способ оплаты</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.userName}</div>
                          <div className="text-sm text-slate-600">{purchase.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {purchase.skillLevel === "beginner" && "Начинающий"}
                          {purchase.skillLevel === "rank-4-3" && "4-3 разряд"}
                          {purchase.skillLevel === "rank-2-1" && "2-1 разряд"}
                          {purchase.skillLevel === "master" && "КМС и выше"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={purchase.videoTitle}>
                          {purchase.videoTitle}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {purchase.price.toLocaleString()} ₸
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {purchase.paymentMethod === "card" && "Карта"}
                          {purchase.paymentMethod === "kaspi" && "Kaspi"}
                          {purchase.paymentMethod === "subscription" && "Подписка"}
                          {purchase.paymentMethod === "bank" && "Банк"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString("ru-RU")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            purchase.status === "completed"
                              ? "default"
                              : purchase.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {purchase.status === "completed" && "Завершено"}
                          {purchase.status === "pending" && "В ожидании"}
                          {purchase.status === "failed" && "Неудачно"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

