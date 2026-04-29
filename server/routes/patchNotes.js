import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const dataDir = join(__dirname, '..', 'data');
const loadJSON = (file) => JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));

router.get('/', (_req, res) => {
  try {
    const data = loadJSON('patch-notes.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '无法加载补丁说明数据' });
  }
});

export default router;
