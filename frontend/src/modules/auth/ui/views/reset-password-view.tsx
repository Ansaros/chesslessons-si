"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/auth/auth-service";

export const ResetPasswordView = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) setError("Отсутствует токен в URL");
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) return setError("Пароли не совпадают");
        setLoading(true);
        setError("");
        try {
            await authService.passwordReset(token!, password);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.detail?.[0]?.msg || "Ошибка сброса пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <Image src="/images/chess-logo.png" alt="Logo" width={64} height={64} className="rounded-full shadow-lg" />
                        <h1 className="text-2xl font-bold text-slate-800">Chesster Chess Club</h1>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Новый пароль</CardTitle>
                        <CardDescription>Введите новый пароль для своего аккаунта</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <p className="text-green-600 text-center">Пароль изменён! Перенаправляем на вход…</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-sm text-red-600">{error}</p>}
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Новый пароль</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="confirm">Подтвердите пароль</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading || !token}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Сбросить пароль
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}