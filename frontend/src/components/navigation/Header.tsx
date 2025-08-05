
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
  SheetFooter,
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
  Settings,
  HelpCircle,
  Mail,
  FileText,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";

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

const aboutLinks = [
  { name: "О школе", href: "/about", icon: Info },
  { name: "Наши тренеры", href: "/trainers", icon: Users },
];

const supportLinks = [
  { name: "Помощь", href: "/help", icon: HelpCircle },
  { name: "Контакты", href: "/contact", icon: Mail },
  { name: "Условия", href: "/terms", icon: FileText },
  { name: "Конфиденциальность", href: "/privacy", icon: Shield },
];

export function Header({ currentPage }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { profile } = useProfile();
  const isAdmin = profile?.email === "admin@chess.com";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeSheet = () => setIsMobileMenuOpen(false);

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/chess-logo.jpg"
              alt="Chester Chess Club"
              width={40}
              height={40}
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
                      <div className="flex items-center gap-2">
                        <link.icon className="w-4 h-4 text-muted-foreground" />
                        {link.name}
                      </div>
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
              <DropdownMenuContent className="w-56">
                {supportLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link href={link.href} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <link.icon className="w-4 h-4 text-muted-foreground" />
                        {link.name}
                      </div>
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
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Админ панель</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
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
              <SheetContent
                side="right"
                className="w-full max-w-sm flex flex-col p-0"
              >
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="flex items-center space-x-2">
                    <Image
                      src="/images/chess-logo.jpg"
                      alt="Chester Chess Club"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>Chester Chess Club</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6">
                  <nav className="flex flex-col gap-2">
                    {/* Main Links */}
                    <Link
                      href="/videos"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors"
                      onClick={closeSheet}
                    >
                      <Play className="w-5 h-5 text-slate-600" />
                      <span>Все видеоуроки</span>
                    </Link>
                    <Link
                      href="/subscription"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors"
                      onClick={closeSheet}
                    >
                      <Heart className="w-5 h-5 text-slate-600" />
                      <span>Подписка</span>
                    </Link>

                    {/* Learning Collapsible */}
                    <Collapsible
                      open={isLearningOpen}
                      onOpenChange={setIsLearningOpen}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">Обучение</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isLearningOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-6 mt-2 border-l-2 border-slate-100 pl-5">
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={closeSheet}
                          >
                            <category.icon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">{category.name}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Support Collapsible */}
                    <Collapsible
                      open={isSupportOpen}
                      onOpenChange={setIsSupportOpen}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">Поддержка</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSupportOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-6 mt-2 border-l-2 border-slate-100 pl-5">
                        {supportLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={closeSheet}
                          >
                            <link.icon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">{link.name}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* About Us Collapsible */}
                    <Collapsible
                      open={isAboutOpen}
                      onOpenChange={setIsAboutOpen}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">О нас</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isAboutOpen ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-6 mt-2 border-l-2 border-slate-100 pl-5">
                        {aboutLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={closeSheet}
                          >
                            <link.icon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">{link.name}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </nav>
                </div>

                <SheetFooter className="p-6 border-t bg-slate-50">
                  {isAuthenticated ? (
                    <div className="w-full space-y-4">
                      <div className="text-left">
                        <p className="text-sm font-medium">{profile?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Добро пожаловать!
                        </p>
                      </div>
                      <div
                        className={`grid ${
                          isAdmin ? "grid-cols-2" : "grid-cols-1"
                        } gap-3`}
                      >
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/profile" onClick={closeSheet}>
                            <User className="w-4 h-4 mr-2" />
                            Профиль
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/admin" onClick={closeSheet}>
                              <Settings className="w-4 h-4 mr-2" />
                              Админ
                            </Link>
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          handleLogout();
                          closeSheet();
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login" onClick={closeSheet}>
                          Войти
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        <Link href="/register" onClick={closeSheet}>
                          Регистрация
                        </Link>
                      </Button>
                    </div>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
