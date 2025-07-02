"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"
import type { AdminStats, VideoStats, User } from "@/types"
import { adminAPI } from "@/lib/api"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { Users, Video, DollarSign, Upload, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [videoStats, setVideoStats] = useState<VideoStats[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    try {
      const [statsResponse, videoStatsResponse, usersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getVideoStats(),
        adminAPI.getUsers({ limit: 10 }),
      ])

      setStats(statsResponse.data)
      setVideoStats(videoStatsResponse.data)
      setUsers(usersResponse.data)
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p className="text-muted-foreground">У вас нет прав администратора</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель администратора</h1>
          <p className="text-muted-foreground">Управление платформой ChessLessons</p>
        </div>
        <Button asChild>
          <Link href="/admin/upload">
            <Upload className="h-4 w-4 mr-2" />
            Загрузить видео
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего видео</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_videos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(Number(stats.total_revenue))} ₸</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Видео
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Пользователи
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Последние покупки</CardTitle>
                <CardDescription>10 последних транзакций</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recent_purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{purchase.video.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(purchase.created_at)}</p>
                      </div>
                      <Badge variant="secondary">{formatPrice(Number(purchase.amount))} ₸</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Videos */}
            <Card>
              <CardHeader>
                <CardTitle>Топ видео по продажам</CardTitle>
                <CardDescription>Самые популярные уроки</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoStats.slice(0, 5).map((video) => (
                    <div key={video.video_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {video.total_purchases} покупок • {video.total_views} просмотров
                        </p>
                      </div>
                      <Badge variant="secondary">{formatPrice(Number(video.total_revenue))} ₸</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Статистика видео</CardTitle>
              <CardDescription>Подробная статистика по всем видео</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {videoStats.map((video) => (
                  <div key={video.video_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{video.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{video.total_purchases} покупок</span>
                        <span>{video.total_views} просмотров</span>
                        <span>Выручка: {formatPrice(Number(video.total_revenue))} ₸</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/videos/${video.video_id}`}>Просмотр</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>Управление пользователями платформы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{user.full_name || user.username}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Регистрация: {formatDateTime(user.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Админ" : "Пользователь"}
                      </Badge>
                      <Badge variant={user.is_active ? "secondary" : "destructive"}>
                        {user.is_active ? "Активен" : "Заблокирован"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
