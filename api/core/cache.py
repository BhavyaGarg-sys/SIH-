import os
import json
import logging
from typing import Any, Optional
import redis.asyncio as redis

logger = logging.getLogger("api")

class CacheManager:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.is_connected = False
        self._memory_cache = {}

    async def connect(self):
        redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            await self.redis_client.ping()
            self.is_connected = True
            logger.info("Connected to Redis for global caching.")
        except Exception as e:
            logger.warning(f"Global Redis connection failed: {e}. Falling back to in-memory cache.")
            self.is_connected = False

    async def close(self):
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Closed Redis connection.")

    async def get(self, key: str) -> Optional[Any]:
        if self.is_connected and self.redis_client:
            try:
                data = await self.redis_client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        
        # Fallback
        data = self._memory_cache.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        serialized = json.dumps(value)
        if self.is_connected and self.redis_client:
            try:
                await self.redis_client.set(key, serialized, ex=ttl)
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        
        # Fallback
        self._memory_cache[key] = serialized

cache_manager = CacheManager()
