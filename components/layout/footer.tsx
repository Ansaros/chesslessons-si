import Link from "next/link"
import { Crown, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ChessLessons</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Изучайте шахматы с профессиональными тренерами. Дебюты, стратегии, тактика и эндшпиль - все для вашего
              роста в шахматах.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>info@chesslessons.kz</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Категории
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-white transition-colors">
                  Все уроки
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                  Профиль
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                  Войти
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Категории</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/debuts" className="text-gray-400 hover:text-white transition-colors">
                  Дебюты
                </Link>
              </li>
              <li>
                <Link href="/categories/middlegame" className="text-gray-400 hover:text-white transition-colors">
                  Миттельшпиль
                </Link>
              </li>
              <li>
                <Link href="/categories/endgame" className="text-gray-400 hover:text-white transition-colors">
                  Эндшпиль
                </Link>
              </li>
              <li>
                <Link href="/categories/tactics" className="text-gray-400 hover:text-white transition-colors">
                  Тактика
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 ChessLessons. Все права защищены.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
