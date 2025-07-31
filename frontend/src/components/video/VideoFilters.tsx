"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import type { VideoFilters as VideoFiltersType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";

interface VideoFiltersProps {
  filters: VideoFiltersType;
  onFiltersChange: (filters: VideoFiltersType) => void;
}

export function VideoFilters({ filters, onFiltersChange }: VideoFiltersProps) {
  const { chessLevels } = useAuth();
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  // Обновляем поиск в реальном времени
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchQuery });
    }, 300); // Задержка 300мс для избежания частых обновлений

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAccessLevelChange = (value: string) => {
    const accessLevel =
      value === "all" ? undefined : (Number.parseInt(value) as 0 | 1 | 2);
    onFiltersChange({ ...filters, access_level: accessLevel });
  };

  const handleLevelChange = (value: string) => {
    const attributeIds = value === "all" ? [] : [value];
    onFiltersChange({ ...filters, attribute_value_ids: attributeIds });
  };

  const clearFilters = () => {
    setSearchQuery("");
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.access_level !== undefined ||
    (filters.attribute_value_ids && filters.attribute_value_ids.length > 0) ||
    filters.search;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Поиск по названию */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Поиск по названию видео..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex gap-4">
          {/* Фильтр по доступу */}
          <Select
            value={filters.access_level?.toString() || "all"}
            onValueChange={handleAccessLevelChange}
          >
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все видео</SelectItem>
              <SelectItem value="0">Бесплатные</SelectItem>
              <SelectItem value="1">Платные</SelectItem>
              <SelectItem value="2">По подписке</SelectItem>
            </SelectContent>
          </Select>

          {/* Фильтр по уровню */}
          <Select
            value={filters.attribute_value_ids?.[0] || "all"}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все уровни" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все уровни</SelectItem>
              {chessLevels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Кнопка очистки фильтров */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Очистить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
