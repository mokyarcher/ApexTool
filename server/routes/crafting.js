import { Router } from 'express';
import { getCache, setCache } from '../lib/cache.js';

const router = Router();
const CACHE_KEY = 'crafting';
const TTL = 5 * 60 * 1000;

const MOCK = [
  { bundle: 'Daily', items: [
    { name: 'Epic Weapon Skin', cost: 400, currency: 'metals' },
    { name: 'Rare Weapon Skin', cost: 60, currency: 'metals' }
  ]},
  { bundle: 'Weekly', items: [
    { name: 'Legendary Weapon Skin', cost: 1200, currency: 'metals' },
    { name: 'Epic Legend Skin', cost: 400, currency: 'metals' }
  ]},
  { _mock: true }
];

router.get('/', async (_req, res) => {
  try {
    const cached = getCache(CACHE_KEY);
    if (cached) return res.json(cached);
    const key = process.env.APEX_API_KEY;
    if (!key) {
      setCache(CACHE_KEY, MOCK, TTL);
      return res.json(MOCK);
    }
    const url = `https://api.mozambiquehe.re/crafting?auth=${encodeURIComponent(key)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Upstream ${r.status}`);
    const data = await r.json();
    setCache(CACHE_KEY, data, TTL);
    res.json(data);
  } catch (e) {
    res.json({ data: MOCK, _error: e.message });
  }
});

export default router;
