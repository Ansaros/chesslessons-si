import hashlib
import hmac
import json
import requests
from typing import Dict, Any
import os
from decimal import Decimal

class PaymentService:
    def __init__(self):
        self.kaspi_api_key = os.getenv('KASPI_PAY_API_KEY')
        self.kaspi_merchant_id = os.getenv('KASPI_PAY_MERCHANT_ID')
        self.kaspi_secret = os.getenv('KASPI_PAY_SECRET', 'your-webhook-secret')
        self.kaspi_base_url = "https://api.kaspi.kz/pay/v1"
    
    async def create_kaspi_payment(self, order_id: int, amount: Decimal, description: str) -> str:
        """Создает платеж в Каспи Пей"""
        try:
            payload = {
                "merchant_id": self.kaspi_merchant_id,
                "order_id": str(order_id),
                "amount": float(amount),
                "currency": "KZT",
                "description": description,
                "return_url": f"{os.getenv('FRONTEND_URL')}/payment/success",
                "cancel_url": f"{os.getenv('FRONTEND_URL')}/payment/cancel",
                "webhook_url": f"{os.getenv('BACKEND_URL')}/api/payments/webhook/kaspi"
            }
            
            headers = {
                "Authorization": f"Bearer {self.kaspi_api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.kaspi_base_url}/payments",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("payment_url")
            else:
                raise Exception(f"Kaspi API error: {response.text}")
                
        except Exception as e:
            raise Exception(f"Failed to create Kaspi payment: {str(e)}")
    
    def verify_kaspi_webhook(self, webhook_data: Dict[Any, Any]) -> bool:
        """Проверяет подпись webhook от Каспи"""
        try:
            # Получаем подпись из заголовков
            received_signature = webhook_data.get("signature", "")
            
            # Создаем строку для подписи
            payload_string = json.dumps(webhook_data, sort_keys=True, separators=(',', ':'))
            
            # Вычисляем ожидаемую подпись
            expected_signature = hmac.new(
                self.kaspi_secret.encode('utf-8'),
                payload_string.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(received_signature, expected_signature)
            
        except Exception as e:
            print(f"Webhook verification error: {str(e)}")
            return False
    
    async def check_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Проверяет статус платежа в Каспи"""
        try:
            headers = {
                "Authorization": f"Bearer {self.kaspi_api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"{self.kaspi_base_url}/payments/{payment_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Failed to check payment status: {response.text}")
                
        except Exception as e:
            raise Exception(f"Payment status check error: {str(e)}")
