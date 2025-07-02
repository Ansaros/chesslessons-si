import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Providers } from "./providers"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "ChessLessons - Изучайте шахматы онлайн",
  description: "Профессиональные уроки шахмат онлайн. Дебюты, стратегии, тактика и эндшпиль.",
  keywords: "шахматы, уроки шахмат, обучение шахматам, дебюты, тактика, стратегия",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
