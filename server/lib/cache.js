// 简单内存缓存,避免频繁调用外部 API
const store = new Map();

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
