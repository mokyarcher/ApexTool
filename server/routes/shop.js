import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getCache, setCache } from '../lib/cache.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
}

const router = Router();
const CACHE_KEY = 'shop-daily';
const TTL = 30 * 60 * 1000; // 30 分钟(Reddit 帖子更新不频繁)

// 多个候选 subreddit / 查询,第一个能拿到结果的就用
const QUERIES = [
  'https://www.reddit.com/r/apexuniversity/search.json?q=flair_name%3A%22Daily+Shop%22&sort=new&restrict_sr=1&limit=3',
  'https://www.reddit.com/r/apexlegends/search.json?q=daily+shop+rotation&sort=new&restrict_sr=1&limit=3',
  'https://www.reddit.com/r/apexlegends/search.json?q=shop+rotation&sort=new&restrict_sr=1&limit=3'
];

function extractImage(post) {
  if (post.url_overridden_by_dest && /\.(png|jpe?g|webp|gif)$/i.test(post.url_overridden_by_dest)) {
    return post.url_overridden_by_dest;
  }
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, '&');
  }
  if (post.thumbnail && post.thumbnail.startsWith('http')) return post.thumbnail;
  return null;
}

async function fetchFirstValid() {
  for (const url of QUERIES) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'ApexTool/1.0 (daily shop aggregator)' } });
      if (!r.ok) continue;
      const json = await r.json();
      const posts = (json.data?.children || [])
        .map((c) => c.data)
        .filter((p) => p && !p.stickied);
      for (const p of posts) {
        const image = extractImage(p);
        if (image) {
          return {
            title: p.title,
            author: p.author,
            created: p.created_utc * 1000,
            image,
            permalink: `https://reddit.com${p.permalink}`,
            source: url.includes('apexuniversity') ? 'r/apexuniversity' : 'r/apexlegends'
          };
        }
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

router.get('/', async (_req, res) => {
  try {
    const cached = getCache(CACHE_KEY);
    if (cached) return res.json(cached);

    const post = await fetchFirstValid();
    if (!post) {
      return res.status(502).json({
        error: 'No recent daily shop post found',
        fallback: 'https://apexlegendsstatus.com/ShopRotation'
      });
    }
    setCache(CACHE_KEY, post, TTL);
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/milestone', (_req, res) => {
  try {
    const data = loadJSON('milestone.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/premium', (_req, res) => {
  try {
    const data = loadJSON('premium-shop.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/double-strike', (_req, res) => {
  try {
    const data = loadJSON('double-strike-shop.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/featured-bundle', (_req, res) => {
  try {
    const data = loadJSON('featured-bundle-shop.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/recolor', (_req, res) => {
  try {
    const data = loadJSON('recolor-shop.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/exotic', (_req, res) => {
  try {
    const data = loadJSON('exotic-shop.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
