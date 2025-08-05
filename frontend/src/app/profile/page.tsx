"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Save, User, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/navigation";

export default function ProfilePage() {
  const {
    profile,
    chessLevels,
    currentChessLevel,
    isLoading,
    isUpdating,
    updateProfile,
    updatePassword,
  } = useProfile();
  const { logout } = useAuth();

  const [selectedLevel, setSelectedLevel] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    profile: "",
    password: "",
  });
  const [success, setSuccess] = useState({
    profile: "",
    password: "",
  });

  // Обновление уровня шахмат
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, profile: "" });
    setSuccess({ ...success, profile: "" });

    if (!selectedLevel) {
      setErrors({ ...errors, profile: "Выберите уровень шахмат" });
      return;
    }

    try {
      await updateProfile(selectedLevel);
      setSuccess({ ...success, profile: "Профиль успешно обновлен" });
      setSelectedLevel("");
    } catch (error: any) {
      setErrors({ ...errors, profile: "Ошибка при обновлении профиля" });
    }
  };

  // Смена пароля
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, password: "" });
    setSuccess({ ...success, password: "" });

    if (passwordData.password !== passwordData.confirmPassword) {
      setErrors({ ...errors, password: "Пароли не совпадают" });
      return;
    }

    if (passwordData.password.length < 6) {
      setErrors({
        ...errors,
        password: "Пароль должен содержать минимум 6 символов",
      });
      return;
    }

    try {
      await updatePassword(passwordData.password);
      setSuccess({ ...success, password: "Пароль успешно изменен" });
      setPasswordData({ password: "", confirmPassword: "" });
    } catch (error: any) {
      setErrors({ ...errors, password: "Ошибка при смене пароля" });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header currentPage="profile" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Профиль</h1>
            <p className="text-slate-600">Управление вашим аккаунтом</p>
          </div>

          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Основная информация
              </CardTitle>
              <CardDescription>Ваши данные и уровень игры</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {errors.profile && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {errors.profile}
                  </div>
                )}
                {success.profile && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success.profile}
                  </div>
                )}

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email нельзя изменить
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="currentLevel">Текущий уровень</Label>
                  <Input
                    id="currentLevel"
                    value={currentChessLevel?.value || "Загрузка..."}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="newLevel">Изменить уровень</Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите новый уровень" />
                    </SelectTrigger>
                    <SelectContent>
                      {chessLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isUpdating || !selectedLevel}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Смена пароля */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Безопасность
              </CardTitle>
              <CardDescription>Изменение пароля</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {errors.password && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {errors.password}
                  </div>
                )}
                {success.password && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success.password}
                  </div>
                )}

                <div className="grid gap-3">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Введите новый пароль"
                      disabled={isUpdating}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isUpdating}
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
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Повторите новый пароль"
                      disabled={isUpdating}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isUpdating}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isUpdating ||
                    !passwordData.password ||
                    !passwordData.confirmPassword
                  }
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Изменение...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Изменить пароль
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Выход из аккаунта */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Выход из аккаунта</CardTitle>
              <CardDescription>Завершить текущую сессию</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
