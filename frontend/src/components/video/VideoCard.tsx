"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Lock, Eye } from "lucide-react";
import type { VideoPreview } from "@/types/video";
import {
  getAccessBadgeColor,
  getAccessBadgeText,
  formatPrice,
  getAttributeByType,
} from "@/utils/videoHelpers";
import Image from "next/image";

interface VideoCardProps {
  video: VideoPreview;
}

export function VideoCard({ video }: VideoCardProps) {
  const price = formatPrice(video.price, video.access_level);
  const category = getAttributeByType(video, "Категория");
  const level = getAttributeByType(video, "Уровень");

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <Image
          src={video.preview_url || "/placeholder.svg?height=200&width=300"}
          alt={video.title}
          width={300}
          height={192}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Бейдж доступа */}
        <div className="absolute top-2 left-2">
          <Badge className={getAccessBadgeColor(video.access_level)}>
            {video.access_level === 1 && <Lock className="w-3 h-3 mr-1" />}
            {getAccessBadgeText(video.access_level)}
          </Badge>
        </div>

        {/* Overlay с кнопкой воспроизведения */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
            {level && (
              <Badge variant="outline" className="text-xs">
                {level}
              </Badge>
            )}
          </div>
          {price && (
            <span className="text-lg font-bold text-amber-600">{price}</span>
          )}
        </div>

        <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
          {video.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Новое видео</span>
          </div>
        </div>

        <Button className="w-full" asChild>
          <Link href={`/video/${video.id}`}>
            {video.access_level === 0 ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Смотреть
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {video.access_level === 1
                  ? "Купить и смотреть"
                  : "Смотреть по подписке"}
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
