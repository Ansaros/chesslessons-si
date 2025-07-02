"use client"

import { useEffect, useState } from "react"
import { VideoCard } from "@/components/video/video-card"
import { Button } from "@/components/ui/button"
import type { Video } from "@/types"
import { videosAPI } from "@/lib/api"
import { Gift } from "lucide-react"

export default function FreeVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    loadFreeVideos()
  }, [])

  const loadFreeVideos = async (reset = false) => {
    setIsLoading(true)
    try {
      const response = await videosAPI.getVideos({
        access_level: 0, // Только бесплатные
        limit: ITEMS_PER_PAGE,
        skip: reset ? 0 : (currentPage - 1) * ITEMS_PER_PAGE,
      })

      if (reset) {
        setVideos(response.data)
        setCurrentPage(1)
      } else {
        setVideos((prev) => [...prev, ...response.data])
      }

      setHasMore(response.data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading free videos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1)
    loadFreeVideos()
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Gift className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold">Бесплатные уроки</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Начните изучение шахмат с наших бесплатных уроков. Никаких ограничений!
        </p>
      </div>

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
      ) : videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoading}>
                {isLoading ? "Загрузка..." : "Загрузить еще"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Бесплатные уроки не найдены</h3>
          <p className="text-muted-foreground">Бесплатные уроки скоро появятся</p>
        </div>
      )}
    </div>
  )
}
