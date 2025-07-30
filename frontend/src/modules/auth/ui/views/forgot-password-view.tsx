"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth/auth-service";

export const ForgotPasswordView = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await authService.passwordRecovery(email);
            setSent(true);
        } catch (err: any) {
            setError(err.detail?.[0]?.msg || "Не удалось отправить письмо");
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
                        <CardTitle>Восстановление пароля</CardTitle>
                        <CardDescription>На ваш email придёт ссылка для сброса пароля</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sent ? (
                            <p className="text-green-600 text-center">Проверьте почту и перейдите по ссылке из письма.</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-sm text-red-600">{error}</p>}
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Отправить
                                </Button>
                            </form>
                        )}
                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-amber-600 hover:underline">
                                Вернуться ко входу
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}