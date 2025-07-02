"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VideoCard } from "@/components/video/video-card"
import { useAuthStore } from "@/stores/auth-store"
import type { Purchase } from "@/types"
import { usersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime } from "@/lib/utils"
import { User, ShoppingBag, Clock, Settings } from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const { toast } = useToast()

  const [fullName, setFullName] = useState(user?.full_name || "")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [watchHistory, setWatchHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "")
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      const [purchasesResponse, historyResponse] = await Promise.all([
        usersAPI.getPurchases(),
        usersAPI.getWatchHistory(),
      ])

      setPurchases(purchasesResponse.data)
      setWatchHistory(historyResponse.data)
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateProfile({ full_name: fullName })
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      })
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.detail || "Не удалось обновить профиль",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.full_name || user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <Settings className="h-4 w-4 mr-2" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Покупки ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            История просмотров
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Настройки профиля</CardTitle>
              <CardDescription>Управляйте информацией вашего аккаунта</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input id="username" value={user.username} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="full_name">Полное имя</Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Введите ваше полное имя"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои покупки</CardTitle>
                <CardDescription>Все приобретенные вами уроки</CardDescription>
              </CardHeader>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-video rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="space-y-2">
                    <VideoCard video={purchase.video} showCategory={false} />
                    <div className="text-sm text-muted-foreground">Куплено {formatDateTime(purchase.created_at)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет покупок</h3>
                <p className="text-muted-foreground mb-4">Вы еще не приобрели ни одного урока</p>
                <Button asChild>
                  <a href="/videos">Посмотреть уроки</a>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История просмотров</CardTitle>
              <CardDescription>Последние просмотренные уроки</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-20 h-12 bg-muted rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : watchHistory.length > 0 ? (
                <div className="space-y-4">
                  {watchHistory.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.video_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Просмотрено {formatDateTime(item.viewed_at)}
                          {item.watch_duration && (
                            <span> • Длительность: {Math.floor(item.watch_duration / 60)} мин</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">История просмотров пуста</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
