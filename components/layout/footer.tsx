import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">♔</span>
              </div>
              <span className="font-bold text-xl">ChessLessons</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Изучайте шахматы с лучшими мастерами. Профессиональные уроки для всех уровней.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Обучение</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/videos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Все уроки
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Категории
                </Link>
              </li>
              <li>
                <Link href="/free" className="text-muted-foreground hover:text-foreground transition-colors">
                  Бесплатные уроки
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Помощь
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Правовая информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Условия использования
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ChessLessons. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
