"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Video, Purchase } from "@/lib/types"
import { formatPrice, formatDuration, getVideoThumbnail, canAccessVideo } from "@/lib/utils"
import { Play, Lock, Clock } from "lucide-react"

interface VideoCardProps {
  video: Video
  purchases?: Purchase[]
  onPurchase?: (video: Video) => void
}

export default function VideoCard({ video, purchases = [], onPurchase }: VideoCardProps) {
  const hasAccess = canAccessVideo(video, purchases)
  const isFree = video.access_level === 0

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={getVideoThumbnail(video) || "/placeholder.svg"}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        )}

        {/* Access Level Badge */}
        <div className="absolute top-2 left-2">
          {isFree ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Бесплатно
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {formatPrice(video.price)}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          {video.description && <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{video.category.name}</span>
            <span>{new Date(video.created_at).toLocaleDateString("ru-RU")}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {hasAccess || isFree ? (
          <Link href={`/videos/${video.id}`} className="w-full">
            <Button className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Смотреть
            </Button>
          </Link>
        ) : (
          <Button className="w-full" onClick={() => onPurchase?.(video)} variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Купить за {formatPrice(video.price)}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
