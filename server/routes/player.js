import { Router } from 'express';
import { getCache, setCache } from '../lib/cache.js';

const router = Router();
const API_BASE = 'https://api.mozambiquehe.re';
const CACHE_TTL = 60 * 1000; // 60s cache to avoid rate limits

// GET /api/player?uid=xxx&platform=PC
// GET /api/player?name=xxx&platform=PC
router.get('/', async (req, res, next) => {
  try {
    const key = process.env.APEX_API_KEY?.trim();
    if (!key) return res.status(500).json({ error: 'APEX_API_KEY not configured' });

    const { uid, name, platform = 'PC' } = req.query;
    if (!uid && !name) return res.status(400).json({ error: 'uid or name is required' });

    const cacheKey = `player:${uid || name}:${platform}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const params = new URLSearchParams({ auth: key, platform });
    if (uid) params.set('uid', uid);
    else params.set('player', name);

    const url = `${API_BASE}/bridge?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: text || `API returned ${resp.status}` });
    }

    const data = await resp.json();

    // API returns { Error: "..." } on not found
    if (data.Error) {
      return res.status(404).json({ error: data.Error });
    }

    // Use local legend icons from /legends/ (API icons may 404 for newer legends)
    if (data.legends?.all) {
      for (const [name, legend] of Object.entries(data.legends.all)) {
        const slug = name.toLowerCase().replace(/[_ ]/g, '-');
        if (!legend.ImgAssets) legend.ImgAssets = {};
        legend.ImgAssets.icon = `/legends/${slug}.png`;
      }
    }

    setCache(cacheKey, data, CACHE_TTL);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/player/lookup?name=xxx&platform=PC
// Multi-strategy name → UID resolution
router.get('/lookup', async (req, res, next) => {
  try {
    const key = process.env.APEX_API_KEY?.trim();
    const { name, platform = 'PC' } = req.query;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const cacheKey = `lookup:${name}:${platform}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const results = [];
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    try {
      // Step 1: fetch search page to get cookies
      const searchUrl = `https://apexlegendsstatus.com/profile/search/${encodeURIComponent(name)}`;
      const pageResp = await fetch(searchUrl, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      });
      const cookies = pageResp.headers.getSetCookie?.() || [];
      const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
      const html = await pageResp.text();
      const tokenMatch = html.match(/let\s+token\s*=\s*"([^"]+)"/);
      const token = tokenMatch ? tokenMatch[1] : 'CSRF_PRE_PROD';

      // Step 2: call internal search API with platform=search for deep search
      const apiUrl = `https://apexlegendsstatus.com/core/interface?token=${token}&platform=search&player=${encodeURIComponent(name)}`;
      const apiResp = await fetch(apiUrl, {
        headers: {
          'User-Agent': UA,
          'Referer': searchUrl,
          'Cookie': cookieStr,
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (apiResp.ok) {
        const text = await apiResp.text();
        // Parse player cards from deep search HTML response
        // Each card: <a href="/profile/uid/PLATFORM/UID">...Name...Lvl X (Prestige Y)...has Legend selected...N RP</a>
        const cardRegex = /<a\s+href="\/profile\/uid\/(\w+)\/(\d{10,})">([\s\S]*?)<\/a>/g;
        let card;
        const seen = new Set();
        while ((card = cardRegex.exec(text)) !== null) {
          const uid = card[2];
          const cardPlat = card[1];
          if (seen.has(uid)) continue;
          seen.add(uid);

          const h = card[3]; // card inner HTML
          // Name: text after &nbsp; before <span or <br
          const nm = h.match(/&nbsp;(?:&nbsp;)*\s*([^<&]+)/);
          // Level + Prestige
          const lv = h.match(/Lvl\s*(?:<[^>]*>)?\s*(\d+)\s*\(Prestige\s*(\d+)\)/i);
          // Legend
          const leg = h.match(/has\s*(?:<[^>]*>)?\s*([^<]+?)(?:<\/span>)?\s*selected/i);
          // RP
          const rp = h.match(/([\d,]+)\s*RP/);
          // Rank image
          const rankImg = h.match(/src="([^"]*ranks\/[^"]+)"/);

          results.push({
            uid,
            name: nm ? nm[1].trim() : name,
            platform: cardPlat,
            level: lv ? lv[1] : null,
            prestige: lv ? lv[2] : null,
            legend: leg ? leg[1].trim() : null,
            rp: rp ? rp[1] : null,
            rankImg: rankImg ? rankImg[1] : null,
          });
        }

        // Fallback: if no cards found, try single-profile UID extraction
        if (results.length === 0) {
          const uidPatterns = [
            /loadReps\('(\d{10,})'/,
            /showMMCharts\([^)]*'(\d{10,})'\)/,
          ];
          for (const pat of uidPatterns) {
            const m = text.match(pat);
            if (m) {
              const nameMatch = text.match(/class="profile__header-name"[^>]*>([^<]+)</);
              const lvlMatch = text.match(/Level\s*(\d+)/);
              results.push({
                uid: m[1],
                name: nameMatch ? nameMatch[1].trim() : name,
                platform,
                level: lvlMatch?.[1] || null,
                legend: null,
                rp: null,
              });
              break;
            }
          }
        }
      }
    } catch (e) { console.log('[lookup] error:', e.message); }

    const data = { results, query: name, platform };
    if (results.length > 0) setCache(cacheKey, data, 5 * 60 * 1000);
    console.log(`[lookup] "${name}" (${platform}) → ${results.length} result(s)`);
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
