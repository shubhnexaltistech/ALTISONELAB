"""Redis client factory — uses in-memory FakeRedis in development when enabled."""
from app.config import settings


async def create_redis_client():
  if settings.USE_FAKE_REDIS:
    import fakeredis.aioredis
    return fakeredis.aioredis.FakeRedis(decode_responses=True)
  import redis.asyncio as aioredis
  return aioredis.from_url(settings.REDIS_URL, decode_responses=True)
