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

import { Eye, EyeOff, Loader2 } from "lucide-react";

import { authService } from "@/services/auth/auth-service";

interface ErrorDetail {
  msg: string;
}

interface APIError {
  detail?: ErrorDetail[];
  message?: string;
}

export const LoginView = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const loginFormData = new FormData();
            loginFormData.append("username", formData.email);
            loginFormData.append("password", formData.password);
            loginFormData.append("grant_type", "password");

            const response = await authService.login(loginFormData, formData.rememberMe);

            console.log("Login successful:", response);

            if (formData.email === "admin@chessmaster.com") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/profile";
            }
        } catch (error: unknown) {
            console.error("Login error:", error);

            if (typeof error === "object" && error !== null && "detail" in error) {
                const apiError = error as APIError;

                if (Array.isArray(apiError.detail)) {
                    const errorMessage = apiError.detail.map(err => err.msg).join(", ");
                    setError(errorMessage);
                } else {
                    setError("Неверные учетные данные");
                }
            } else {
                setError("Произошла непредвиденная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@gmail.com"
                                    required
                                    disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor="rememberMe" className="text-sm">
                                        Запомнить меня
                                    </Label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                                    Забыли пароль?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Вход...
                                    </>
                                ) : (
                                    "Войти"
                                )}
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
    );
};