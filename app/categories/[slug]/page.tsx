"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { VideoCard } from "@/components/video/video-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Category, Video } from "@/types"
import { categoriesAPI, videosAPI } from "@/lib/api"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    if (slug) {
      loadCategoryData()
    }
  }, [slug])

  const loadCategoryData = async () => {
    try {
      // Сначала найдем категорию по slug
      const categoriesResponse = await categoriesAPI.getCategories()
      const foundCategory = categoriesResponse.data.find((cat) => cat.slug === slug)

      if (!foundCategory) {
        setIsLoading(false)
        return
      }

      setCategory(foundCategory)

      // Загружаем видео для этой категории
      const videosResponse = await videosAPI.getVideosByCategory(foundCategory.id, {
        limit: ITEMS_PER_PAGE,
        skip: 0,
      })

      setVideos(videosResponse.data)
      setHasMore(videosResponse.data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading category data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (!category) return

    try {
      const videosResponse = await videosAPI.getVideosByCategory(category.id, {
        limit: ITEMS_PER_PAGE,
        skip: currentPage * ITEMS_PER_PAGE,
      })

      setVideos((prev) => [...prev, ...videosResponse.data])
      setCurrentPage((prev) => prev + 1)
      setHasMore(videosResponse.data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading more videos:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
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
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Категория не найдена</h1>
        <Button asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к категориям
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Все категории
          </Link>
        </Button>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && <p className="text-muted-foreground mt-2">{category.description}</p>}
            <Badge variant="secondary" className="mt-2">
              {videos.length} уроков
            </Badge>
          </div>
        </div>
      </div>

      {videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} showCategory={false} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore}>Загрузить еще</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Уроки не найдены</h3>
          <p className="text-muted-foreground">В этой категории пока нет уроков</p>
        </div>
      )}
    </div>
  )
}
