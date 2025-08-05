
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Edit, Loader2, X, LogOut, BarChart3, PlayCircle, Users, Settings, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";

type ButtonProps = VariantProps<typeof buttonVariants>;

const LogoutButton = ({
    variant,
    size,
    className,
    showIcon,
    showText,
}: {
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}) => {
    const { logout } = useAuth();
    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogout}
        >
            {showIcon && <LogOut className="w-4 h-4 mr-2" />}
            {showText && "Выйти"}
        </Button>
    );
};

export default function AttributesPage() {
    const {
        isAdmin,
        attributes,
        isLoading,
        createAttributeType,
        createAttributeValue,
        deleteAttributeType,
        deleteAttributeValue,
    } = useAdmin();

    const [newTypeName, setNewTypeName] = useState("");
    const [newValueText, setNewValueText] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
    const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        name: string;
        itemType: "type" | "value";
    } | null>(null);
    const [isContentOpen, setIsContentOpen] = useState(true);

    const handleCreateType = async () => {
        if (!newTypeName.trim()) {
            toast.error("Ошибка", {
                description: "Введите название типа атрибута",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const newType = await createAttributeType(newTypeName.trim());
            toast.success("Успешно", {
                description: `Тип атрибута "${newType.name}" создан`,
            });
            setNewTypeName("");
            setIsTypeDialogOpen(false);
        } catch (error) {
            console.error("Ошибка создания типа:", error);
            toast.error("Ошибка создания", {
                description: "Не удалось создать тип атрибута. Попробуйте снова.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateValue = async () => {
        if (!newValueText.trim() || !selectedTypeId) {
            toast.error("Ошибка", {
                description: "Выберите тип атрибута и введите значение",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const newValue = await createAttributeValue(
                newValueText.trim(),
                selectedTypeId
            );
            toast.success("Успешно", {
                description: `Значение "${newValue.value}" добавлено`,
            });
            setNewValueText("");
            setSelectedTypeId("");
            setIsValueDialogOpen(false);
        } catch (error) {
            console.error("Ошибка добавления значения:", error);
            toast.error("Ошибка добавления", {
                description: "Не удалось добавить значение. Попробуйте снова.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRequest = (
        id: string,
        name: string,
        itemType: "type" | "value"
    ) => {
        setDeleteTarget({ id, name, itemType });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsSubmitting(true);
        const { id, name, itemType } = deleteTarget;

        try {
            if (itemType === "type") {
                await deleteAttributeType(id);
                toast.success("Успешно", {
                    description: `Тип атрибута "${name}" удален`,
                });
            } else {
                await deleteAttributeValue(id);
                toast.success("Успешно", {
                    description: `Значение "${name}" удалено`,
                });
            }
        } catch (error) {
            console.error(`Ошибка удаления ${itemType} "${name}":`, error);
            toast.error("Ошибка удаления", {
                description: `Не удалось удалить "${name}".`,
            });
        } finally {
            setIsSubmitting(false);
            setDeleteTarget(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">
                        Страница не найдена
                    </h2>
                    <p className="text-slate-600 mb-6 max-w-md">
                        У вас нет прав для доступа к этой странице или она не существует.
                    </p>
                    <Button asChild>
                        <Link href="/">Вернуться на главную</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/images/chess-logo.jpg"
                                alt="Chester Chess Club"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">
                                    Chester Chess Club
                                </h1>
                                <p className="text-xs text-slate-600">
                                    Админ панель
                                </p>
                            </div>
                        </div>
                        <nav className="flex items-center space-x-6">
                            <Link
                                href="/"
                                className="text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                На сайт
                            </Link>
                            <LogoutButton
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-800"
                                showIcon={true}
                                showText={true}
                            />
                        </nav>
                    </div>
                </div>
            </header>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-64">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <nav className="space-y-2">
                                <Link
                                  href="/admin?tab=overview"
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100"
                                >
                                  <BarChart3 className="w-5 h-5" />
                                  Обзор
                                </Link>

                                <Collapsible
                                  open={isContentOpen}
                                  onOpenChange={setIsContentOpen}
                                >
                                  <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100 font-medium">
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="w-5 h-5" />
                                      <span>Контент</span>
                                    </div>
                                    <ChevronRight
                                      className={`w-4 h-4 transition-transform ${isContentOpen ? "rotate-90" : ""
                                        }`}
                                    />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pl-6 space-y-1 py-1">
                                    <Link
                                      href="/admin?tab=videos"
                                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm hover:bg-slate-100"
                                    >
                                      <PlayCircle className="w-4 h-4" />
                                      Видео
                                    </Link>
                                    <Link
                                      href="/admin/attributes"
                                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm bg-amber-100 text-amber-800"
                                    >
                                      <Settings className="w-4 h-4" />
                                      Атрибуты
                                    </Link>
                                  </CollapsibleContent>
                                </Collapsible>

                                <Link
                                  href="/admin?tab=users"
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100"
                                >
                                  <Users className="w-5 h-5" />
                                  Пользователи
                                </Link>
                                <Link
                                  href="/admin?tab=settings"
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100"
                                >
                                  <Settings className="w-5 h-5" />
                                  Настройки
                                </Link>
                                <Link
                                  href="/admin/analytics"
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-slate-100"
                                >
                                  <BarChart3 className="w-5 h-5" />
                                  Аналитика
                                </Link>
                            </nav>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Управление атрибутами</h1>
                                <p className="text-muted-foreground mt-2">
                                    Создавайте и управляйте типами атрибутов и их значениями
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Новый тип
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Создать тип атрибута</DialogTitle>
                                            <DialogDescription>
                                                Введите название для нового типа атрибута
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="type-name">Название типа</Label>
                                                <Input
                                                    id="type-name"
                                                    placeholder="Например: Категория, Уровень"
                                                    value={newTypeName}
                                                    onChange={(e) => setNewTypeName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsTypeDialogOpen(false)}
                                            >
                                                Отмена
                                            </Button>
                                            <Button onClick={handleCreateType} disabled={isSubmitting}>
                                                {isSubmitting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Создать
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Новое значение
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Добавить значение атрибута</DialogTitle>
                                            <DialogDescription>
                                                Выберите тип атрибута и введите новое значение
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="attribute-type">Тип атрибута</Label>
                                                <Select
                                                    value={selectedTypeId}
                                                    onValueChange={setSelectedTypeId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип атрибута" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {attributes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="value-text">Значение</Label>
                                                <Input
                                                    id="value-text"
                                                    placeholder="Введите значение"
                                                    value={newValueText}
                                                    onChange={(e) => setNewValueText(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsValueDialogOpen(false)}
                                            >
                                                Отмена
                                            </Button>
                                            <Button onClick={handleCreateValue} disabled={isSubmitting}>
                                                {isSubmitting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Добавить
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {attributes.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                                                <Edit className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Нет типов атрибутов</h3>
                                            <p className="text-muted-foreground max-w-sm">
                                                Создайте первый тип атрибута, чтобы начать
                                            </p>
                                            <Button onClick={() => setIsTypeDialogOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Создать тип атрибута
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                attributes.map((type) => (
                                    <Card key={type.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{type.name}</CardTitle>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteRequest(type.id, type.name, "type")
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">
                                                        Значения ({type.values.length})
                                                    </h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTypeId(type.id);
                                                            setIsValueDialogOpen(true);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Добавить
                                                    </Button>
                                                </div>

                                                {type.values.length === 0 ? (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <p>Нет значений для этого типа атрибута</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {type.values.map((value) => (
                                                            <Badge
                                                                key={value.id}
                                                                variant="secondary"
                                                                className="flex items-center gap-2 px-3 py-1 text-base"
                                                            >
                                                                <span>{value.value}</span>
                                                                <button
                                                                    className="p-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                                                                    onClick={() =>
                                                                        handleDeleteRequest(
                                                                            value.id,
                                                                            value.value,
                                                                            "value"
                                                                        )
                                                                    }
                                                                    aria-label={`Удалить ${value.value}`}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Подтвердите удаление</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить{" "}
                            <strong>{`"${deleteTarget?.name}"`}</strong>? Это действие нельзя
                            отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
