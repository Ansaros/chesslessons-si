"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Платеж отменен</CardTitle>
          <CardDescription>Вы отменили процесс оплаты. Урок остается доступным для покупки.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/videos">Вернуться к урокам</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/">На главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
