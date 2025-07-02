import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Логируем входящий запрос
        logger.info(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Вычисляем время обработки
        process_time = time.time() - start_time
        
        # Логируем ответ
        logger.info(
            f"Response: {response.status_code} | "
            f"Time: {process_time:.4f}s | "
            f"Path: {request.url.path}"
        )
        
        response.headers["X-Process-Time"] = str(process_time)
        return response
