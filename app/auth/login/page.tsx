"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { authApi } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import { toast } from "sonner"
import { Eye, EyeOff, Crown } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Пароль обязателен"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const authResponse = await authApi.login(data)
      const user = await authApi.getMe()

      login(user, authResponse.access_token)
      toast.success("Добро пожаловать!")
      router.push("/")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ChessLessons</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Вход в аккаунт</CardTitle>
            <CardDescription>Введите свои данные для входа в систему</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    {...register("password")}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
