"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Users,
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Calendar,
  ShoppingCart,
} from "lucide-react";

import { adminService } from "@/services/admin/admin-service";
import type { AdminVideo, AttributeType } from "@/services/admin/admin-service";


interface Purchase {
  id: string;
  user_id: string;
  username: string;
  skill: "beginner" | "intermediate" | "advanced";
  amount: number;
  payment_method: string;
  timestamp: string;
}

const stubPurchases: Purchase[] = [
  {
    id: "1",
    user_id: "u1",
    username: "Алексей Иванов",
    skill: "intermediate",
    amount: 2500,
    payment_method: "card",
    timestamp: "2024-07-01T12:00:00Z",
  },
  {
    id: "2",
    user_id: "u2",
    username: "Мария Петрова",
    skill: "beginner",
    amount: 1800,
    payment_method: "paypal",
    timestamp: "2024-07-02T14:22:00Z",
  },
];

export const AdminAnalyticsView = () => {
  const [purchases] = useState<Purchase[]>(stubPurchases);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | undefined>();
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();

  useEffect(() => {
    adminService
      .fetchVideos({ limit: 100 })
      .then((r) => setVideos(r.data))
      .catch(console.error);

    adminService
      .fetchAttributeTypes()
      .then((r) => setAttributes(r.data))
      .catch(console.error);
  }, []);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch = p.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSkill = selectedSkill ? p.skill === selectedSkill : true;
      const matchMethod = selectedMethod ? p.payment_method === selectedMethod : true;
      return matchSearch && matchSkill && matchMethod;
    });
  }, [purchases, searchTerm, selectedSkill, selectedMethod]);

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalPurchases = purchases.length;
  const uniqueUsers = new Set(purchases.map((p) => p.user_id)).size;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Аналитика продаж</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Общий доход</CardTitle>
            <CardDescription>Всего заработано</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalRevenue.toLocaleString("ru-RU", {
              style: "currency",
              currency: "KZT",
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всего покупок</CardTitle>
            <CardDescription>Количество транзакций</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalPurchases}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пользователей</CardTitle>
            <CardDescription>Уникальные покупатели</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{uniqueUsers}</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Имя пользователя..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={selectedSkill} onValueChange={(val) => setSelectedSkill(val || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Все навыки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Начинающий</SelectItem>
            <SelectItem value="intermediate">Средний</SelectItem>
            <SelectItem value="advanced">Продвинутый</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedMethod}
          onValueChange={(val) => setSelectedMethod(val || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все методы оплаты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Карта</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="crypto">Криптовалюта</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>История покупок</CardTitle>
          <CardDescription>Детализация транзакций</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Навык</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Метод оплаты</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.username}</TableCell>
                  <TableCell>{p.skill}</TableCell>
                  <TableCell>
                    {p.amount.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "KZT",
                    })}
                  </TableCell>
                  <TableCell>{p.payment_method}</TableCell>
                  <TableCell>{new Date(p.timestamp).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Загруженные видео ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto space-y-2">
            {videos.map((v) => (
              <div key={v.id} className="p-3 border rounded-md bg-white text-sm">
                <p className="font-semibold truncate">{v.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {v.description || "Без описания"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Атрибуты ({attributes.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto space-y-2">
            {attributes.map((a) => (
              <div key={a.id} className="p-3 border rounded-md bg-white text-sm">
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.values.length} значений
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};