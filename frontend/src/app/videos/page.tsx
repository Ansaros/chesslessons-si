"use client";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/navigation";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoFilters } from "@/components/video/VideoFilters";
import { useVideos } from "@/hooks/useVideos";

export default function VideosPage() {
  const { videos, total, isLoading, filters, setFilters } = useVideos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header currentPage="videos" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Видеоуроки</h1>
          <p className="text-slate-600">
            Изучайте шахматы с профессиональными тренерами
          </p>
        </div>

        {/* Filters */}
        <VideoFilters filters={filters} onFiltersChange={setFilters} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-slate-600">Загрузка видео...</span>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-slate-600">
              Найдено {total} {total === 1 ? "видео" : "видео"}
            </p>
          </div>
        )}

        {/* Videos Grid */}
        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Видео не найдены
            </h3>
            <p className="text-slate-500">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
