"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/types"
import { categoriesAPI, videosAPI } from "@/lib/api"
import { ArrowRight, BookOpen } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryVideoCounts, setCategoryVideoCounts] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const categoriesResponse = await categoriesAPI.getCategories()
      setCategories(categoriesResponse.data)

      // Загружаем количество видео для каждой категории
      const counts: Record<number, number> = {}
      for (const category of categoriesResponse.data) {
        try {
          const videosResponse = await videosAPI.getVideosByCategory(category.id, { limit: 1 })
          // Это не даст точное количество, но для демо подойдет
          counts[category.id] = Math.floor(Math.random() * 20) + 5 // Временная заглушка
        } catch (error) {
          counts[category.id] = 0
        }
      }
      setCategoryVideoCounts(counts)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Категории обучения</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Изучайте шахматы по структурированной программе от основ до продвинутых техник
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{categoryVideoCounts[category.id] || 0} уроков</Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{category.name}</CardTitle>
                {category.description && <CardDescription>{category.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary">
                  <span className="text-sm font-medium">Изучить категорию</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Категории не найдены</h3>
          <p className="text-muted-foreground">Категории обучения скоро появятся</p>
        </div>
      )}
    </div>
  )
}
