import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
}

const router = Router();

router.get('/legends', (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(loadJSON('legends.json'));
});

router.get('/weapons', (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(loadJSON('weapons.json'));
});

export default router;
