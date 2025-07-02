"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Video } from "@/types"
import { Clock, Lock, Play } from "lucide-react"
import { formatDuration, formatPrice } from "@/lib/utils"

interface VideoCardProps {
  video: Video
  showCategory?: boolean
}

export function VideoCard({ video, showCategory = true }: VideoCardProps) {
  const isPaid = video.access_level === 1 && video.price > 0

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail_url || "/placeholder.svg?height=200&width=300"}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="sm" className="rounded-full">
            <Play className="h-4 w-4 mr-1" />
            Смотреть
          </Button>
        </div>

        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDuration(video.duration)}
          </div>
        )}

        {isPaid && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-yellow-500 text-black">
              <Lock className="h-3 w-3 mr-1" />
              Платный
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {showCategory && (
            <Badge variant="outline" className="text-xs">
              {video.category.name}
            </Badge>
          )}
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
          {video.description && <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isPaid ? (
            <span className="font-bold text-lg text-primary">{formatPrice(video.price)} ₸</span>
          ) : (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Бесплатно
            </Badge>
          )}
        </div>

        <Button asChild size="sm">
          <Link href={`/videos/${video.id}`}>Подробнее</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
