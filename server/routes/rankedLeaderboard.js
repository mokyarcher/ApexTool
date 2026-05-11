import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, '../data/ranked-leaderboard.json');

router.get('/', (_req, res) => {
  if (!fs.existsSync(dataFile)) {
    return res.status(404).json({ error: 'Ranked leaderboard data not imported yet' });
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  res.json(data);
});

export default router;
