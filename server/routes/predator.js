import { Router } from 'express';
import { getCache, setCache } from '../lib/cache.js';

const router = Router();
const API_BASE = 'https://api.mozambiquehe.re';
const CACHE_TTL = 5 * 60 * 1000; // 5 min cache

router.get('/', async (_req, res, next) => {
  try {
    const key = process.env.APEX_API_KEY?.trim();
    if (!key) return res.status(500).json({ error: 'APEX_API_KEY not configured' });

    const cacheKey = 'predator';
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${API_BASE}/predator?auth=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(resp.status).json({ error: 'Upstream API error' });

    const data = await resp.json();
    setCache(cacheKey, data, CACHE_TTL);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
