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
import { authApi } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import { toast } from "sonner"
import { Eye, EyeOff, Crown } from "lucide-react"

const registerSchema = z
  .object({
    email: z.string().email("Введите корректный email"),
    username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа"),
    full_name: z.string().optional(),
    password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await authApi.register({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
      })

      toast.success("Регистрация успешна! Теперь войдите в систему.")
      router.push("/auth/login")
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
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для доступа к урокам</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя *
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Полное имя
                </label>
                <Input id="full_name" type="text" placeholder="Ваше полное имя" {...register("full_name")} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 8 символов"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите пароль *
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
