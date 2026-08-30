import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("api")
logger.setLevel(logging.INFO)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            process_time = time.time() - start_time
            host = request.client.host if request.client else 'unknown'
            logger.info(
                f'{host} - "{request.method} {request.url.path}" {status_code} {process_time:.3f}s'
            )
        
        return response
