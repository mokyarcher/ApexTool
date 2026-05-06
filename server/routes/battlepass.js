import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bpDir = path.join(__dirname, '..', 'data', 'battlepass');

function loadSeasons() {
  return JSON.parse(fs.readFileSync(path.join(bpDir, 'seasons.json'), 'utf-8'));
}

function loadBP(seasonId) {
  // If no seasonId, load current season
  if (!seasonId) {
    const seasons = loadSeasons();
    seasonId = seasons.current;
  }
  // Sanitize to prevent path traversal
  const safe = seasonId.replace(/[^a-zA-Z0-9_-]/g, '');
  const p = path.join(bpDir, `${safe}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

router.get('/seasons', (_req, res) => {
  try {
    res.json(loadSeasons());
  } catch (err) {
    res.status(500).json({ error: '无法加载赛季列表' });
  }
});

router.get('/', (req, res) => {
  const bp = loadBP(req.query.season);
  if (!bp) return res.status(404).json({ error: '未找到该赛季数据' });
  res.json(bp);
});

router.get('/rewards', (req, res) => {
  const bp = loadBP(req.query.season);
  if (!bp) return res.status(404).json({ error: '未找到该赛季数据' });
  const { tier, premium, level } = req.query;
  let rewards = bp.rewards;
  if (tier) rewards = rewards.filter((r) => r.tier === tier);
  else if (premium === 'true') rewards = rewards.filter((r) => r.tier !== 'free');
  else if (premium === 'false') rewards = rewards.filter((r) => r.tier === 'free');
  if (level) rewards = rewards.filter((r) => String(r.level) === String(level));
  res.json({ season: bp.season, name: bp.name, total: rewards.length, rewards });
});

export default router;
