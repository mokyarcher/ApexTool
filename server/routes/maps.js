import { Router } from 'express';
import { getCache, setCache } from '../lib/cache.js';

const router = Router();
const CACHE_KEY = 'maprotation';
const TTL = 60 * 1000; // 60s

// 模拟兜底数据,在未配置 API Key 时使用
const MOCK = {
  battle_royale: {
    current: { map: 'Storm Point', remainingMins: 45, remainingSecs: 2700 },
    next: { map: "World's Edge", DurationInMinutes: 90 }
  },
  ranked: {
    current: { map: 'E-District', remainingMins: 120, remainingSecs: 7200 },
    next: { map: 'Broken Moon', DurationInMinutes: 120 }
  },
  ltm: {
    current: { map: 'Kings Canyon', eventName: 'Mixtape', remainingMins: 15, remainingSecs: 900 },
    next: { map: "World's Edge", eventName: 'Mixtape', DurationInMinutes: 15 }
  },
  _mock: true
};

router.get('/', async (_req, res, next) => {
  try {
    const cached = getCache(CACHE_KEY);
    if (cached) return res.json(cached);

    const key = process.env.APEX_API_KEY;
    if (!key) {
      setCache(CACHE_KEY, MOCK, TTL);
      return res.json(MOCK);
    }

    const url = `https://api.mozambiquehe.re/maprotation?version=5&auth=${encodeURIComponent(key)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'ApexTool/1.0' } });
    if (!r.ok) throw new Error(`Upstream ${r.status}`);
    const raw = await r.json();
    // v5 字段:br_pubs / ranked / ltm;归一化成前端期望的 battle_royale / ranked / ltm
    const data = {
      battle_royale: raw.br_pubs || raw.battle_royale,
      ranked: raw.ranked,
      ltm: raw.ltm
    };
    setCache(CACHE_KEY, data, TTL);
    res.json(data);
  } catch (e) {
    // 失败时返回模拟数据,保证前端可用
    res.json({ ...MOCK, _error: e.message });
  }
});

export default router;
