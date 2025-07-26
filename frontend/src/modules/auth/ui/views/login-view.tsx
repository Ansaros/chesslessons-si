"use client"

import type React from "react";
import { useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Eye, EyeOff } from "lucide-react";


export const LoginView = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.email === "admin@chessmaster.com" && formData.password === "admin1123") {
            window.location.href = "/admin"
        } else {
            window.location.href = "/profile"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <Image
                            src="/images/chess-logo.png"
                            alt="Chester Chess Club"
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover shadow-lg"
                        />
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-slate-800">Chesster Chess Club</h1>
                            <p className="text-sm text-slate-800">Школа Шахмат</p>
                        </div>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Вход в аккаунт</CardTitle>
                        <CardDescription>Введите свои данные для входа в систему</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@gmail.com"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="password">Пароль</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Введите пароль"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="rememberMe"
                                        checked={formData.rememberMe}
                                        onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                                    />
                                    <Label htmlFor="remember" className="text-sm">
                                        Запомнить меня
                                    </Label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                                    Забыли пароль?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                                Войти
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Нет аккаунта?{" "}
                                <Link href="/register" className="text-amber-600 hover:text-amber-700">
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