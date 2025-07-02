"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentsAPI } from "@/lib/api"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)

  useEffect(() => {
    const purchaseIdParam = searchParams.get("purchase_id")
    if (purchaseIdParam) {
      setPurchaseId(purchaseIdParam)
      verifyPayment(purchaseIdParam)
    } else {
      setIsVerifying(false)
    }
  }, [searchParams])

  const verifyPayment = async (purchaseId: string) => {
    try {
      const response = await paymentsAPI.verifyPurchase(Number.parseInt(purchaseId))
      setIsSuccess(response.data.status === "completed")
    } catch (error) {
      console.error("Error verifying payment:", error)
      setIsSuccess(false)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Проверяем платеж...</h2>
            <p className="text-muted-foreground">Пожалуйста, подождите</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{isSuccess ? "Платеж успешен!" : "Ошибка платежа"}</CardTitle>
          <CardDescription>
            {isSuccess
              ? "Спасибо за покупку! Теперь вы можете смотреть урок."
              : "К сожалению, платеж не прошел. Попробуйте еще раз."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <>
              <Button asChild className="w-full">
                <Link href="/profile">Мои покупки</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/videos">Все уроки</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/videos">Попробовать снова</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">На главную</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
