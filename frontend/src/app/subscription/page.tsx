"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { Header } from "@/components/navigation";

const subscriptionPlans = [
  {
    id: "basic",
    name: "Базовый",
    price: 4990,
    period: "месяц",
    description: "Идеально для начинающих",
    features: [
      "Доступ к видео для начинающих",
      "Базовые тактические задачи",
      "Форум сообщества",
      "Мобильное приложение",
    ],
    skillLevels: ["beginner"],
    color: "border-green-500",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "standard",
    name: "Стандартный",
    price: 7990,
    period: "месяц",
    description: "Для игроков среднего уровня",
    features: [
      "Все из базового плана",
      "Видео для 4-3 и 2-1 разрядов",
      "Продвинутые тактические задачи",
      "Анализ партий",
      "Персональные рекомендации",
    ],
    skillLevels: ["beginner", "rank-4-3", "rank-2-1"],
    color: "border-blue-500",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    popular: true,
  },
  {
    id: "premium",
    name: "Премиум",
    price: 12990,
    period: "месяц",
    description: "Для серьезных шахматистов",
    features: [
      "Все из стандартного плана",
      "Видео для КМС и выше",
      "Эксклюзивные мастер-классы",
      "Индивидуальные консультации",
      "Приоритетная поддержка",
      "Ранний доступ к новому контенту",
    ],
    skillLevels: ["beginner", "rank-4-3", "rank-2-1", "master"],
    color: "border-amber-500",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
  },
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Выберите подходящий план
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Получите неограниченный доступ к видеоурокам, соответствующим вашему
            уровню игры
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.color
              } ${plan.popular ? "border-2 scale-105" : "border"}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  Популярный выбор
                </div>
              )}

              <CardHeader className={plan.popular ? "pt-12" : ""}>
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-800">
                      {plan.price.toLocaleString()} ₸
                    </span>
                    <span className="text-slate-600">/{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Доступные уровни:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.skillLevels.map((level) => (
                      <Badge key={level} variant="outline" className="text-xs">
                        {level === "beginner" && "Начинающий"}
                        {level === "rank-4-3" && "4-3 разряд"}
                        {level === "rank-2-1" && "2-1 разряд"}
                        {level === "master" && "КМС и выше"}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full py-3 text-lg ${plan.buttonColor}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <Crown className="w-5 h-5 mr-2" />}
                  Выбрать план
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Все планы включают 7-дневный бесплатный пробный период
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Отмена в любое время</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Безопасные платежи</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Поддержка 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
