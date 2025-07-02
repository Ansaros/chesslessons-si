"use client"

import { useEffect, useState } from "react"
import { VideoCard } from "@/components/video/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Video, Category } from "@/types"
import { videosAPI, categoriesAPI } from "@/lib/api"
import { Search } from "lucide-react"

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [accessLevel, setAccessLevel] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadVideos(true)
  }, [selectedCategory, accessLevel])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadVideos = async (reset = false) => {
    setIsLoading(true)
    try {
      const params: any = {
        limit: ITEMS_PER_PAGE,
        skip: reset ? 0 : (currentPage - 1) * ITEMS_PER_PAGE,
      }

      if (selectedCategory !== "all") {
        params.category_id = Number.parseInt(selectedCategory)
      }

      if (accessLevel !== "all") {
        params.access_level = Number.parseInt(accessLevel)
      }

      const response = await videosAPI.getVideos(params)

      if (reset) {
        setVideos(response.data)
        setCurrentPage(1)
      } else {
        setVideos((prev) => [...prev, ...response.data])
      }

      setHasMore(response.data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading videos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1)
    loadVideos()
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Все уроки</h1>
        <p className="text-muted-foreground">Изучайте шахматы с профессиональными уроками от мастеров</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск уроков..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={accessLevel} onValueChange={setAccessLevel}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Доступ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уроки</SelectItem>
            <SelectItem value="0">Бесплатные</SelectItem>
            <SelectItem value="1">Платные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
            {categories.find((c) => c.id.toString() === selectedCategory)?.name} ×
          </Badge>
        )}
        {accessLevel !== "all" && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setAccessLevel("all")}>
            {accessLevel === "0" ? "Бесплатные" : "Платные"} ×
          </Badge>
        )}
      </div>

      {/* Videos Grid */}
      {isLoading && videos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-video rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {hasMore && !searchQuery && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoading}>
                {isLoading ? "Загрузка..." : "Загрузить еще"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Уроки не найдены</p>
        </div>
      )}
    </div>
  )
}
