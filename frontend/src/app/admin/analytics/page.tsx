"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/navigation";


// Mock data for purchase history
const mockPurchases = [
    { id: 't1', username: 'Alexey_S', skill: 'Начинающий', amount: 2500, payment_method: 'Карта', timestamp: '2023-10-26T10:00:00Z' },
    { id: 't2', username: 'Maria_K', skill: 'Средний', amount: 1800, payment_method: 'PayPal', timestamp: '2023-10-25T14:30:00Z' },
    { id: 't3', username: 'Ivan_P', skill: 'Продвинутый', amount: 4990, payment_method: 'Карта', timestamp: '2023-10-25T11:45:00Z' },
    { id: 't4', username: 'Dmitry_V', skill: 'Начинающий', amount: 2500, payment_method: 'Криптовалюта', timestamp: '2023-10-24T18:20:00Z' },
    { id: 't5', username: 'Elena_M', skill: 'Средний', amount: 3200, payment_method: 'Карта', timestamp: '2023-10-23T09:05:00Z' },
];

export default function AnalyticsPage() {
  const { videos, attributes, isLoading } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | undefined>();
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter(p => {
      const searchMatch = p.username.toLowerCase().includes(searchTerm.toLowerCase());
      const skillMatch = !selectedSkill || p.skill === selectedSkill;
      const methodMatch = !selectedMethod || p.payment_method === selectedMethod;
      return searchMatch && skillMatch && methodMatch;
    });
  }, [searchTerm, selectedSkill, selectedMethod]);

  const totalRevenue = useMemo(() => filteredPurchases.reduce((sum, p) => sum + p.amount, 0), [filteredPurchases]);
  const totalPurchases = useMemo(() => filteredPurchases.length, [filteredPurchases]);
  const uniqueUsers = useMemo(() => new Set(filteredPurchases.map(p => p.username)).size, [filteredPurchases]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header currentPage="admin" />
      <div className="container mx-auto p-6 space-y-6">
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

          <Select value={selectedSkill} onValueChange={(val) => setSelectedSkill(val === "all" ? undefined : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Все навыки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все навыки</SelectItem>
              <SelectItem value="Начинающий">Начинающий</SelectItem>
              <SelectItem value="Средний">Средний</SelectItem>
              <SelectItem value="Продвинутый">Продвинутый</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedMethod}
            onValueChange={(val) => setSelectedMethod(val === "all" ? undefined : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все методы оплаты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все методы</SelectItem>
              <SelectItem value="Карта">Карта</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
              <SelectItem value="Криптовалюта">Криптовалюта</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>История покупок</CardTitle>
            <CardDescription>Детализация транзакций (Mock Data)</CardDescription>
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
    </div>
  );
}