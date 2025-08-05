
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  PlayCircle,
  Users,
  Settings,
  DollarSign,
  Upload,
  X,
  LogOut,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import type { AdminVideo } from "@/types/admin";
import { formatDate, formatPrice } from "@/utils/videoHelpers";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

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

export default function AdminPage() {
  const {
    isAdmin,
    isLoading,
    videos,
    attributes,
    uploadVideo,
    deleteVideo,
    updateVideo,
  } = useAdmin();

  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabQuery || "overview");
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<AdminVideo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && ['overview', 'videos', 'users', 'settings'].includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const [newVideo, setNewVideo] = useState<{
    title: string;
    description: string;
    attribute_value_ids: string;
    access_level: string;
    price: string;
    videoFile: File | null;
    preview_file: File | null;
  }>({
    title: "",
    description: "",
    attribute_value_ids: "",
    access_level: "0",
    price: "0",
    videoFile: null,
    preview_file: null,
  });

  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const categoryType = attributes.find((attr) => attr.name === "Категория");
    return categoryType?.values || [];
  }, [attributes]);

  const totalViews = useMemo(
    () => videos.reduce((sum, v) => sum + (v.views_count || 0), 0),
    [videos]
  );
  const totalRevenue = useMemo(
    () =>
      videos
        .filter((v) => v.access_level === 1)
        .reduce((sum, v) => sum + Number(v.price), 0),
    [videos]
  );

  const openEditModal = (video: AdminVideo) => {
    setEditingVideo(video);
    const categoryValue = video.attributes.find(
      (a) => a.type === "Категория"
    )?.value;
    const categoryId =
      categories.find((c) => c.value === categoryValue)?.id || "";

    setNewVideo({
      title: video.title,
      description: video.description,
      access_level: String(video.access_level),
      price: video.price,
      attribute_value_ids: categoryId,
      videoFile: null,
      preview_file: null,
    });
    setShowVideoModal(true);
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setNewVideo({
      title: "",
      description: "",
      attribute_value_ids: "",
      access_level: "0",
      price: "0",
      videoFile: null,
      preview_file: null,
    });
    setShowVideoModal(true);
  };

  const openDeleteModal = (video: AdminVideo) => {
    setVideoToDelete(video);
  };

  const confirmVideoDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete.id);
      toast.success("Видео успешно удалено.");
      setVideoToDelete(null);
    } catch (error) {
      console.error("Failed to delete video:", error);
      let errorMessage = "Попробуйте снова или перезагрузите страницу.";

      if (isAxiosError(error)) {
        if (error.response?.status && error.response.status >= 500) {
          errorMessage =
            "Произошла внутренняя ошибка на сервере. Пожалуйста, сообщите администратору.";
        }
        else if (error.code === "ERR_NETWORK") {
          errorMessage =
            "Ошибка сети или сервера. Проверьте ваше соединение или попробуйте позже.";
        }
        else if (error.response) {
          errorMessage = `Ошибка: ${(error.response.data as any)?.detail || error.message
            }`;
        }
      }

      toast.error("Ошибка при удалении видео", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragLeave = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, fileType: "video" | "thumbnail") => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      if (fileType === "video") setNewVideo({ ...newVideo, videoFile: file });
      if (fileType === "thumbnail")
        setNewVideo({ ...newVideo, preview_file: file });
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "video" | "thumbnail"
  ) => {
    const files = e.target.files;
    if (files && files.length) {
      const file = files[0];
      if (fileType === "video") setNewVideo({ ...newVideo, videoFile: file });
      if (fileType === "thumbnail")
        setNewVideo({ ...newVideo, preview_file: file });
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo && !newVideo.videoFile) {
      alert("Выберите видеофайл");
      return;
    }
    if (!editingVideo && !newVideo.preview_file) {
      alert("Выберите файл превью");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("title", newVideo.title);
    formData.append("description", newVideo.description);
    formData.append("access_level", newVideo.access_level);
    formData.append(
      "price",
      newVideo.access_level === "1" ? newVideo.price : "0"
    );
    if (newVideo.attribute_value_ids) {
      formData.append("attribute_value_ids", newVideo.attribute_value_ids);
    }

    if (newVideo.videoFile) {
      formData.append("video_file", newVideo.videoFile);
    }
    if (newVideo.preview_file) {
      formData.append("preview_file", newVideo.preview_file);
    }

    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, formData);
      } else {
        await uploadVideo(formData);
      }
      setShowVideoModal(false);
    } catch (error) {
      console.error("Failed to save video:", error);
      alert("Ошибка при сохранении видео.");
    } finally {
      setUploading(false);
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
                <p className="text-xs text-slate-600">Админ панель</p>
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "overview"
                      ? "bg-amber-100 text-amber-800"
                      : "hover:bg-slate-100"
                    }`}
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${activeTab === "videos"
                          ? "bg-amber-100 text-amber-800"
                          : "hover:bg-slate-100"
                        }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Видео
                    </Link>
                    <Link
                      href="/admin/attributes"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm hover:bg-slate-100"
                    >
                      <Settings className="w-4 h-4" />
                      Атрибуты
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                <Link
                  href="/admin?tab=users"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "users"
                      ? "bg-amber-100 text-amber-800"
                      : "hover:bg-slate-100"
                    }`}
                >
                  <Users className="w-5 h-5" />
                  Пользователи
                </Link>
                <Link
                  href="/admin?tab=settings"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "settings"
                      ? "bg-amber-100 text-amber-800"
                      : "hover:bg-slate-100"
                    }`}
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
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Обзор</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Общий доход
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalRevenue.toLocaleString()} ₸
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +12% с прошлого месяца
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Всего просмотров
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalViews.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +8% с прошлого месяца
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Всего видео
                      </CardTitle>
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{videos.length}</div>
                      <p className="text-xs text-muted-foreground">
                        +2 за этот месяц
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Подписчики
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45</div>
                      <p className="text-xs text-muted-foreground">
                        +5 за этот месяц
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Последняя активность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          Новая покупка: &quot;Сицилианская защита: Вариант
                          Найдорфа&quot;
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          2 мин назад
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">
                          Новый пользователь зарегистрировался
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          15 мин назад
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">
                          Видео &quot;Тактика: Двойной удар&quot; опубликовано
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          1 час назад
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "videos" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Управление видео
                  </h2>
                  <Button onClick={openAddModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить видео
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Все видео</CardTitle>
                    <CardDescription>
                      Управляйте своими видеоуроками
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Загрузка видео...</span>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>Просмотры</TableHead>
                            <TableHead>Дата создания</TableHead>
                            <TableHead className="text-right">
                              Действия
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {videos.map((video) => (
                            <TableRow key={video.id}>
                              <TableCell className="font-medium max-w-sm truncate">
                                {video.title}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">
                                  {formatPrice(
                                    video.price,
                                    video.access_level
                                  ) || (
                                    <Badge className="bg-green-500 text-white">
                                      Бесплатно
                                    </Badge>
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>
                                {video.views_count?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell>
                                {formatDate(video.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link
                                      href={`/video/${video.id}`}
                                      target="_blank"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditModal(video)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteModal(video)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Пользователи
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Список пользователей</CardTitle>
                    <CardDescription>
                      Управление пользователями платформы
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Функционал управления пользователями будет добавлен
                      позже.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Настройки
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Общие настройки</CardTitle>
                    <CardDescription>Конфигурация платформы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Настройки будут добавлены позже.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveVideo}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setShowVideoModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingVideo ? "Редактировать видео" : "Добавить новое видео"}
            </h3>

            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Название видео</Label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  placeholder="Введите название видео"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, description: e.target.value })
                  }
                  placeholder="Описание видео"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={newVideo.attribute_value_ids}
                    onValueChange={(value) =>
                      setNewVideo({ ...newVideo, attribute_value_ids: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="access">Тип доступа</Label>
                  <Select
                    value={newVideo.access_level}
                    onValueChange={(value) =>
                      setNewVideo({ ...newVideo, access_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Бесплатно</SelectItem>
                      <SelectItem value="1">Платно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newVideo.access_level === "1" && (
                <div className="grid gap-3">
                  <Label htmlFor="price">Цена (₸)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newVideo.price}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              )}

              {!editingVideo && (
                <div className="grid gap-3">
                  <Label htmlFor="video">Видеофайл</Label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-slate-400 hover:bg-slate-50"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "video")}
                    onClick={() => videoFileRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 mb-2">
                      {newVideo.videoFile
                        ? newVideo.videoFile.name
                        : "Перетащите видеофайл сюда или нажмите для выбора"}
                    </p>
                    {newVideo.videoFile && (
                      <p className="text-xs text-green-600">✓ Файл выбран</p>
                    )}
                    <Input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, "video")}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="thumbnail">Превью (миниатюра)</Label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-slate-400 hover:bg-slate-50"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "thumbnail")}
                  onClick={() => thumbnailFileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-2">
                    {newVideo.preview_file
                      ? newVideo.preview_file.name
                      : "Перетащите изображение сюда или нажмите для выбора"}
                  </p>
                  {newVideo.preview_file && (
                    <p className="text-xs text-green-600">✓ Файл выбран</p>
                  )}
                  <Input
                    ref={thumbnailFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, "thumbnail")}
                  />
                </div>
                {editingVideo && (
                  <p className="text-xs text-slate-500">
                    Оставьте поле пустым, чтобы не менять превью.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" className="flex-1" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : editingVideo ? (
                  "Сохранить изменения"
                ) : (
                  "Добавить видео"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowVideoModal(false)}
                disabled={uploading}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      )}

      {videoToDelete && (
        <Dialog
          open={!!videoToDelete}
          onOpenChange={(isOpen) => !isOpen && setVideoToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтвердите удаление</DialogTitle>
              <DialogDescription>
                Вы уверены, что хотите удалить видео{" "}
                <strong>&quot;{videoToDelete.title}&quot;</strong>? Это действие
                нельзя отменить.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setVideoToDelete(null)}
                disabled={isDeleting}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={confirmVideoDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
