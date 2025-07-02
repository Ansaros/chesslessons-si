"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import { adminAPI, categoriesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import type { Category } from "@/types"

export default function AdminUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "0",
    access_level: "0",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      toast({
        title: "Ошибка",
        description: "Выберите видео файл",
        variant: "destructive",
      })
      return
    }

    if (!formData.category_id) {
      toast({
        title: "Ошибка",
        description: "Выберите категорию",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("title", formData.title)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("category_id", formData.category_id)
      uploadFormData.append("price", formData.price)
      uploadFormData.append("access_level", formData.access_level)
      uploadFormData.append("video_file", videoFile)

      if (thumbnailFile) {
        uploadFormData.append("thumbnail_file", thumbnailFile)
      }

      const response = await adminAPI.uploadVideo(uploadFormData)

      toast({
        title: "Успешно!",
        description: "Видео загружено и обрабатывается",
      })

      router.push("/admin")
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.response?.data?.detail || "Не удалось загрузить видео",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (user?.role !== "admin") {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p className="text-muted-foreground">У вас нет прав администратора</p>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к панели
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Загрузить новый урок
            </CardTitle>
            <CardDescription>Загрузите видео урок и заполните информацию о нем</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Название урока *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Введите название урока"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Описание урока"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Категория *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange("category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Тип доступа</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(value) => handleInputChange("access_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Бесплатный</SelectItem>
                      <SelectItem value="1">Платный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.access_level === "1" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (₸)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="video">Видео файл *</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Поддерживаемые форматы: MP4, AVI, MOV. Максимальный размер: 500MB
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Превью (необязательно)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">Если не загрузите, превью будет создано автоматически</p>
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Загрузка... Это может занять несколько минут
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить урок
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
