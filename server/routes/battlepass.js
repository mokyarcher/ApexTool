import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadBP() {
  const p = path.join(__dirname, '..', 'data', 'battlepass.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

router.get('/', (_req, res) => {
  res.json(loadBP());
});

router.get('/rewards', (req, res) => {
  const bp = loadBP();
  const { tier, premium, level } = req.query;
  let rewards = bp.rewards;
  if (tier) rewards = rewards.filter((r) => r.tier === tier);
  else if (premium === 'true') rewards = rewards.filter((r) => r.tier !== 'free');
  else if (premium === 'false') rewards = rewards.filter((r) => r.tier === 'free');
  if (level) rewards = rewards.filter((r) => String(r.level) === String(level));
  res.json({ season: bp.season, name: bp.name, total: rewards.length, rewards });
});

export default router;
