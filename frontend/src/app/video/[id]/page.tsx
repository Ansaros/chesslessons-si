"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, Clock, Loader2 } from "lucide-react";
import { Header } from "@/components/navigation";
import { HLSPlayer } from "@/components/video/HLSPlayer";
import { useVideo } from "@/hooks/useVideo";
import { useAuth } from "@/hooks/useAuth";
import {
  getAccessBadgeColor,
  getAccessBadgeText,
  formatPrice,
  getAttributeByType,
} from "@/utils/videoHelpers";

export default function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { isAuthenticated } = useAuth();
  const { video, isLoading, canWatch } = useVideo(resolvedParams.id);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Загрузка видео...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Видео не найдено
          </h1>
          <Link href="/videos">
            <Button>Вернуться к видео</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = formatPrice(video.price, video.access_level);
  const category = getAttributeByType(video, "Категория");
  const level = getAttributeByType(video, "Уровень");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Video Player */}
          <div className="mb-6">
            {canWatch ? (
              <HLSPlayer hlsUrl={video.hls_url} poster={video.preview_url} />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-20 h-20 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold mb-3">
                    Контент заблокирован
                  </h3>
                  <p className="text-slate-300 mb-6 max-w-md">
                    {!isAuthenticated
                      ? "Войдите в аккаунт, чтобы получить доступ к этому видео"
                      : `Приобретите доступ к этому видео, чтобы изучить ${video.title.toLowerCase()}`}
                  </p>
                  {!isAuthenticated ? (
                    <Button
                      asChild
                      className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-3"
                    >
                      <Link href="/login">Войти в аккаунт</Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-3"
                    >
                      {price ? `Купить за ${price}` : "Получить доступ"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getAccessBadgeColor(video.access_level)}>
                      {video.access_level === 1 && (
                        <Lock className="w-3 h-3 mr-1" />
                      )}
                      {getAccessBadgeText(video.access_level)}
                    </Badge>
                    {category && <Badge variant="outline">{category}</Badge>}
                    {level && <Badge variant="outline">{level}</Badge>}
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-800 mb-3">
                    {video.title}
                  </CardTitle>
                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>
                        {video.views_count.toLocaleString()} просмотров
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(video.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
                {!canWatch && price && (
                  <Button
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-3"
                  >
                    Купить за {price}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-slate-700 leading-relaxed text-lg mb-6">
                {video.description}
              </p>

              {/* Navigation */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <Button variant="outline" asChild>
                    <Link href="/videos">← Все видео</Link>
                  </Button>
                  <div className="text-sm text-slate-500">
                    Горячие клавиши: Пробел - пауза, ← → - перемотка
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Приобрести доступ
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Получите доступ к видео <strong>"{video.title}"</strong>
              {price && ` за ${price}`}
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 py-3"
                onClick={() => {
                  window.location.href = `/payment?video=${video.id}`;
                }}
              >
                {video.access_level === 1 ? "Купить" : "Оформить подписку"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-3 bg-transparent"
                onClick={() => setShowPurchaseModal(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
