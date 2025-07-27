"use client";
import { useEffect, useState } from "react";

import { adminService, type AdminVideo } from "@/services/admin/admin-service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Plus, Eye, Edit, Trash2 } from "lucide-react";

export const AdminVideosSectionView = () => {
    const [videos, setVideos] = useState<AdminVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAdd, setShowAdd] = useState(false);

    const load = () => {
        setLoading(true);
        adminService
            .fetchVideos({ limit: 100 })
            .then((res: { data: AdminVideo[] }) => setVideos(res.data))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => load(), []);

    const remove = async (id: string) => {
        if (!confirm("Удалить видео?")) return;
        await adminService.deleteVideo(id);
        load();
    };

    if (loading) return <p className="text-center py-10">Загрузка…</p>;
    if (error) return <p className="text-center py-10 text-red-600">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Управление видео</h2>
                <Button onClick={() => setShowAdd(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Добавить видео
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Все видео</CardTitle>
                    <CardDescription>Управляйте своими видеоуроками</CardDescription>
                </CardHeader>
                <CardContent>
                    {videos.length === 0 ? (
                        <p className="text-center py-6 text-slate-500">Нет видео</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Цена</TableHead>
                                    <TableHead>Просмотры</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {videos.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="max-w-sm truncate">{v.title}</TableCell>
                                        <TableCell>
                                            {Number(v.price) === 0 ? (
                                                <Badge className="bg-green-500">Бесплатно</Badge>
                                            ) : (
                                                <span className="font-semibold">{Number(v.price).toLocaleString()} ₸</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{v.views_count.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={v.access_level === 0 ? "default" : "secondary"}>
                                                {v.access_level === 0 ? "Опубликовано" : "Черновик"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => remove(v.id)}>
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
    );
};