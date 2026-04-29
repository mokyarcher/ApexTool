import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mapsRouter from './routes/maps.js';
import battlepassRouter from './routes/battlepass.js';
import coinsRouter from './routes/coins.js';
import craftingRouter from './routes/crafting.js';
import shopRouter from './routes/shop.js';
import playerRouter from './routes/player.js';
import encyclopediaRouter from './routes/encyclopedia.js';
import patchNotesRouter from './routes/patchNotes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/maps', mapsRouter);
app.use('/api/battlepass', battlepassRouter);
app.use('/api/coins', coinsRouter);
app.use('/api/crafting', craftingRouter);
app.use('/api/shop', shopRouter);
app.use('/api/player', playerRouter);
app.use('/api/encyclopedia', encyclopediaRouter);
app.use('/api/patch-notes', patchNotesRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Apex Tool API listening on http://localhost:${PORT}`);
});
