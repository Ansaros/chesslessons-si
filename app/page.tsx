"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video/video-card"
import type { Video, Category } from "@/types"
import { videosAPI, categoriesAPI } from "@/lib/api"
import { ArrowRight, Play, Users, Award, BookOpen } from "lucide-react"

export default function HomePage() {
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([])
  const [freeVideos, setFreeVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [videosResponse, freeVideosResponse, categoriesResponse] = await Promise.all([
          videosAPI.getVideos({ limit: 6 }),
          videosAPI.getVideos({ access_level: 0, limit: 4 }),
          categoriesAPI.getCategories(),
        ])

        setFeaturedVideos(videosResponse.data)
        setFreeVideos(freeVideosResponse.data)
        setCategories(categoriesResponse.data)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Изучайте шахматы с <span className="text-primary">профессионалами</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Более 100 профессиональных уроков от мастеров шахмат. Изучайте дебюты, тактику, стратегию и эндшпиль.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/videos">
                  <Play className="mr-2 h-5 w-5" />
                  Начать обучение
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/free">Бесплатные уроки</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">100+</h3>
            <p className="text-muted-foreground">Профессиональных уроков</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">5000+</h3>
            <p className="text-muted-foreground">Довольных учеников</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">10+</h3>
            <p className="text-muted-foreground">Мастеров и гроссмейстеров</p>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="container space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Рекомендуемые уроки</h2>
            <p className="text-muted-foreground mt-2">Лучшие уроки для изучения шахмат</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/videos">
              Все уроки
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Free Videos */}
      {freeVideos.length > 0 && (
        <section className="container space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Бесплатные уроки</h2>
              <p className="text-muted-foreground mt-2">Начните изучение с бесплатных материалов</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/free">
                Все бесплатные
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Категории обучения</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Изучайте шахматы по структурированной программе от основ до продвинутых техник
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group p-6 border rounded-lg hover:shadow-lg transition-all hover:border-primary/50"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
                {category.description && <p className="text-muted-foreground">{category.description}</p>}
                <div className="flex items-center text-primary">
                  <span className="text-sm font-medium">Изучить</span>
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Готовы стать мастером шахмат?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Присоединяйтесь к тысячам учеников, которые уже улучшили свою игру с нашими уроками
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Начать обучение бесплатно</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
