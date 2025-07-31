import type { VideoPreview } from "@/types/video";

// Форматирование времени в MM:SS
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Получение цвета бейджа в зависимости от типа доступа
export const getAccessBadgeColor = (accessLevel: number) => {
  switch (accessLevel) {
    case 0:
      return "bg-green-500";
    case 1:
      return "bg-amber-500";
    case 2:
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

// Получение текста бейджа
export const getAccessBadgeText = (accessLevel: number) => {
  switch (accessLevel) {
    case 0:
      return "Бесплатно";
    case 1:
      return "Платно";
    case 2:
      return "Подписка";
    default:
      return "Неизвестно";
  }
};

// Форматирование цены
export const formatPrice = (
  price: string,
  accessLevel: number
): string | null => {
  if (accessLevel === 0) return null;

  const numPrice = Number.parseInt(price);
  if (isNaN(numPrice) || numPrice === 0) return null;

  return `${numPrice.toLocaleString()} ₸`;
};

// Проверка доступа пользователя к видео
export const canUserWatch = (
  video: VideoPreview,
  isAuthenticated: boolean,
  hasPurchased = false,
  hasSubscription = false
): boolean => {
  // Бесплатные видео доступны всем
  if (video.access_level === 0) return true;

  // Для платных и подписочных нужна авторизация
  if (!isAuthenticated) return false;

  // Платные видео - нужна покупка
  if (video.access_level === 1) return hasPurchased;

  // Подписочные видео - нужна подписка
  if (video.access_level === 2) return hasSubscription;

  return false;
};

// Получение атрибута по типу
export const getAttributeByType = (
  video: VideoPreview,
  type: string
): string | null => {
  const attribute = video.attributes.find((attr) => attr.type === type);
  return attribute?.value || null;
};

// Получение всех категорий из списка видео
export const getUniqueCategories = (videos: VideoPreview[]): string[] => {
  const categories = new Set<string>();

  videos.forEach((video) => {
    video.attributes.forEach((attr) => {
      if (attr.type === "Категория") {
        categories.add(attr.value);
      }
    });
  });

  return Array.from(categories).sort();
};

// Получение всех уровней из списка видео
export const getUniqueLevels = (videos: VideoPreview[]): string[] => {
  const levels = new Set<string>();

  videos.forEach((video) => {
    video.attributes.forEach((attr) => {
      if (attr.type === "Уровень") {
        levels.add(attr.value);
      }
    });
  });

  return Array.from(levels).sort();
};
