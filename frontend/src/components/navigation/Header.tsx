"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Trophy,
  Zap,
  Users,
  User,
  Play,
  Info,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  currentPage?: string;
}

const categories = [
  {
    name: "Дебюты",
    href: "/videos?category=debuts",
    icon: BookOpen,
    description: "Изучите классические и современные дебюты",
  },
  {
    name: "Стратегии",
    href: "/videos?category=strategy",
    icon: Trophy,
    description: "Позиционная игра и долгосрочное планирование",
  },
  {
    name: "Тактика",
    href: "/videos?category=tactics",
    icon: Zap,
    description: "Комбинации, жертвы и тактические приемы",
  },
  {
    name: "Эндшпиль",
    href: "/videos?category=endgame",
    icon: Users,
    description: "Техника игры в окончаниях",
  },
];

const accountLinks = [
  { name: "Профиль", href: "/profile", icon: User },
  { name: "Покупки", href: "/purchases", icon: Play },
];

const supportLinks = [
  { name: "Помощь", href: "/help" },
  { name: "Контакты", href: "/contact" },
  { name: "Условия использования", href: "/terms" },
  { name: "Конфиденциальность", href: "/privacy" },
];

const aboutLinks = [
  { name: "О школе", href: "/about" },
  { name: "Наши тренеры", href: "/trainers" },
  { name: "Отзывы", href: "/reviews" },
  { name: "Блог", href: "/blog" },
];

export function Header({ currentPage }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Функция для управления состоянием коллапсов
  const handleLearningToggle = (isOpen: boolean) => {
    setIsLearningOpen(isOpen);
    if (isOpen) {
      setIsSupportOpen(false);
      setIsAboutOpen(false);
    }
  };

  const handleSupportToggle = (isOpen: boolean) => {
    setIsSupportOpen(isOpen);
    if (isOpen) {
      setIsLearningOpen(false);
      setIsAboutOpen(false);
    }
  };

  const handleAboutToggle = (isOpen: boolean) => {
    setIsAboutOpen(isOpen);
    if (isOpen) {
      setIsLearningOpen(false);
      setIsSupportOpen(false);
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

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/chess-logo.jpg"
              alt="Chester Chess Club"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800">
                Chester Chess Club
              </h1>
              <p className="text-xs text-slate-600 -mt-1">Школа Шахмат</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Обучение Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-1 text-slate-700 hover:text-amber-600 transition-colors ${
                    currentPage === "videos" ? "text-amber-600 font-medium" : ""
                  }`}
                >
                  <span>Обучение</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2">
                <div className="grid gap-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <DropdownMenuItem key={category.name} asChild>
                        <Link
                          href={category.href}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">
                              {category.name}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              {category.description}
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
                <div className="border-t mt-2 pt-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/videos"
                      className="flex items-center justify-center p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Все видеоуроки
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Подписка */}
            <Link
              href="/subscription"
              className={`text-slate-700 hover:text-amber-600 transition-colors font-medium ${
                currentPage === "subscription" ? "text-amber-600" : ""
              }`}
            >
              Подписка
            </Link>

            {/* О нас Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-slate-700 hover:text-amber-600 transition-colors"
                >
                  <span>О нас</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {aboutLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link href={link.href} className="cursor-pointer">
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Поддержка Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-slate-700 hover:text-amber-600 transition-colors"
                >
                  <span>Поддержка</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {supportLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link href={link.href} className="cursor-pointer">
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Account Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-1 text-slate-700 hover:text-amber-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Аккаунт</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {accountLinks.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <DropdownMenuItem key={link.name} asChild>
                          <Link
                            href={link.href}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{link.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-2 cursor-pointer text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <img
                      src="/images/chess-logo.jpg"
                      alt="Chester Chess Club"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>Chester Chess Club</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                  {/* Auth Section */}
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="pb-4 border-b">
                        <p className="text-sm text-slate-600 mb-3">
                          Мой аккаунт
                        </p>
                        <div className="space-y-2">
                          {accountLinks.map((link) => {
                            const IconComponent = link.icon;
                            return (
                              <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <IconComponent className="w-5 h-5 text-slate-600" />
                                <span>{link.name}</span>
                              </Link>
                            );
                          })}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Выйти</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4 border-b">
                      <Button
                        asChild
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        <Link
                          href="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Регистрация
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full bg-transparent"
                      >
                        <Link
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Войти
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Обучение - Collapsible */}
                  <div className="space-y-2">
                    <Collapsible
                      open={isLearningOpen}
                      onOpenChange={handleLearningToggle}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">Обучение</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isLearningOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-8 mt-2">
                        {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                                <IconComponent className="w-3 h-3 text-amber-600" />
                              </div>
                              <span className="text-sm">{category.name}</span>
                            </Link>
                          );
                        })}
                        <Link
                          href="/videos"
                          className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors mt-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Все видеоуроки
                          </span>
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Подписка */}
                  <div className="space-y-2">
                    <Link
                      href="/subscription"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5 text-slate-600" />
                      <span className="font-medium">Подписка</span>
                    </Link>
                  </div>

                  {/* О нас - Collapsible */}
                  <div className="space-y-2">
                    <Collapsible
                      open={isAboutOpen}
                      onOpenChange={handleAboutToggle}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Info className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">О нас</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isAboutOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-8 mt-2">
                        {aboutLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="block p-2 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Поддержка - Collapsible */}
                  <div className="space-y-2">
                    <Collapsible
                      open={isSupportOpen}
                      onOpenChange={handleSupportToggle}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">Поддержка</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSupportOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-8 mt-2">
                        {supportLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="block p-2 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
