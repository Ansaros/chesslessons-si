"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import VideoCard from "@/components/video/video-card"
import type { Video, Category } from "@/lib/types"
import { videosApi, categoriesApi } from "@/lib/api"
import { Play, BookOpen, Target, Trophy, ArrowRight } from "lucide-react"

export default function HomePage() {
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosData, categoriesData] = await Promise.all([
          videosApi.getVideos({ limit: 6 }),
          categoriesApi.getCategories(),
        ])

        setFeaturedVideos(videosData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold">
              Изучайте шахматы
              <br />
              <span className="text-yellow-300">с профессионалами</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Дебюты, стратегии, тактика и эндшпиль - все для вашего роста в шахматах
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/videos">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Начать обучение
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary bg-transparent"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Выбрать категорию
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Почему выбирают нас?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Профессиональные уроки от мастеров шахмат с многолетним опытом
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Структурированное обучение</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                От основ до продвинутых техник. Каждый урок построен логично и последовательно.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Опытные тренеры</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Уроки ведут мастера и кандидаты в мастера с многолетним опытом преподавания.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Качественное видео</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                HD качество, четкая демонстрация позиций и подробные объяснения каждого хода.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Категории уроков</h2>
            <p className="text-lg text-gray-600">Выберите направление для изучения</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center">
                    <CardTitle className="group-hover:text-primary transition-colors">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">Смотреть уроки</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Рекомендуемые уроки</h2>
            <p className="text-lg text-gray-600">Популярные видео для начинающих и продвинутых игроков</p>
          </div>
          <Link href="/videos">
            <Button variant="outline" className="hidden sm:flex bg-transparent">
              Все уроки
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/videos">
            <Button variant="outline">
              Все уроки
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы стать мастером шахмат?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам учеников, которые уже улучшили свою игру с нашими уроками
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Начать бесплатно
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
