import { redis } from "$lib/redis"
import { apiCache } from "$lib/stores/cache"

export async function getCache(key) {
  const cachedInStore = apiCache.check(key)
  if (cachedInStore) return cachedInStore

  try {
    const dbCache = await redis.get(key)

    if (!dbCache) return null
    if (Date.now() > dbCache?.expiresAt) return null

    return dbCache?.data
  } catch(e) {
    console.log(e)
    return null
  }
}

export async function addCache(key, data, ttl = 1000) {
  const expiresAt = Date.now() + ttl

  apiCache.set(key, data, ttl)
  redis.set(key, JSON.stringify({ data, expiresAt }))
}
