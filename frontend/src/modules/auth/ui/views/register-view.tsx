"use client"

import type React from "react"

import { useState } from "react"

import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import { authService } from "@/services/auth/auth-service"

import { Eye, EyeOff, Loader2 } from "lucide-react"

interface ErrorDetail {
    msg: string;
}

interface APIError {
    detail?: ErrorDetail[];
    message?: string;
}

export const RegisterView = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        skillLevel: "",
        agreeToTerms: false,
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Пароли не совпадают");
            setIsLoading(false);
            return;
        }
        if (!formData.agreeToTerms) {
            setError("Необходимо согласиться с условиями использования");
            setIsLoading(false);
            return;
        }
        if (!formData.skillLevel) {
            setError("Выберите ваш уровень игры");
            setIsLoading(false);
            return;
        }

        try {
            const registrationData = {
                email: formData.email,
                password: formData.password,
                chess_level: formData.skillLevel,
            };

            const response = await authService.register(registrationData);

            console.log("Registration successful:", response);

            setSuccess("Регистрация успешна! Вы автоматически вошли в систему. Перенаправление...");

            setTimeout(() => {
                window.location.href = "/videos";
            }, 2000);

        } catch (error: unknown) {
            console.error("Registration error:", error);

            if (
                typeof error === "object" &&
                error !== null &&
                "detail" in error &&
                Array.isArray((error as { detail: unknown }).detail)
            ) {
                const detailArray = (error as { detail: { msg: string }[] }).detail;
                const errorMessage = detailArray.map(err => err.msg).join(", ");
                setError(errorMessage);
            } else {
                setError("Ошибка регистрации. Попробуйте еще раз.");
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
                        <CardTitle className="text-2xl">Регистрация</CardTitle>
                        <CardDescription>Создайте аккаунт для доступа к видеоурокам</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="firstName">Имя</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Ваше имя"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="lastName">Фамилия</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Ваша фамилия"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
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
                                        placeholder="Создайте пароль"
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

                            <div className="grid gap-3">
                                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Повторите пароль"
                                        required
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="skillLevel">Ваш уровень игры</Label>
                                <Select
                                    value={formData.skillLevel}
                                    onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Выберите ваш уровень" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Начинающий</SelectItem>
                                        <SelectItem value="rank-4-3">4-3 разряд</SelectItem>
                                        <SelectItem value="rank-2-1">2-1 разряд</SelectItem>
                                        <SelectItem value="master">КМС и выше</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="terms" className="text-sm flex flex-wrap items-center">
                                    Я согласен с{" "}
                                    <Link href="/terms" className="text-amber-600 hover:text-amber-700">
                                        условиями использования
                                    </Link>{" "}
                                    и{" "}
                                    <Link href="/privacy" className="text-amber-600 hover:text-amber-700">
                                        политикой конфиденциальности
                                    </Link>
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Регистрация...
                                    </>
                                ) : (
                                    "Зарегистрироваться"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Уже есть аккаунт?{" "}
                                <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                                    Войти
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};