import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const inputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(rootDir, 'leaderboard.html');
const outputFile = path.join(rootDir, 'server/data/ranked-leaderboard.json');

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripGoogleTranslate(value) {
  return value.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
}

function firstMatch(value, regex) {
  const match = value.match(regex);
  return match ? match[1] : '';
}

function toNumber(value) {
  const n = Number(String(value || '').replace(/[^0-9-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

if (!fs.existsSync(inputFile)) {
  console.error(`Input HTML not found: ${inputFile}`);
  process.exit(1);
}

// Load previous data for comparison
let prevMap = {};
if (fs.existsSync(outputFile)) {
  try {
    const prev = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    for (const p of prev.players || []) {
      prevMap[p.uid] = { rp: p.rp, rank: p.rank };
    }
    console.log(`Loaded ${Object.keys(prevMap).length} previous player records for comparison`);
  } catch { /* ignore corrupt file */ }
}

const html = stripGoogleTranslate(fs.readFileSync(inputFile, 'utf8'));
const tbody = firstMatch(html, /<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
const rows = [...tbody.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) => match[0]);

const players = rows.map((row, index) => {
  const cells = [...row.matchAll(/<td[\s\S]*?<\/td>/gi)].map((match) => match[0]);
  const rankCell = cells[1] || '';
  const playerCell = cells[2] || '';
  const rpCell = cells[3] || '';
  const uid = firstMatch(playerCell, /profile\/uid\/[^/]+\/([0-9]+)/i) || firstMatch(playerCell, /load(?:Sum|Perf)\(&#39;([0-9]+)&#39;\)/i) || `unknown-${index}`;
  const name = cleanText(firstMatch(playerCell, /<a[^>]*profile\/uid[^>]*>([\s\S]*?)<\/a>/i)) || 'NONE';
  const rank = toNumber(firstMatch(rankCell, /<span[^>]*font-size:\s*25px[^>]*>([\s\S]*?)<\/span>/i)) || index + 1;
  const rp = toNumber(firstMatch(rpCell, /<span[^>]*font-size:\s*20px[^>]*>([\s\S]*?)<\/span>/i));
  const changeRaw = cleanText(firstMatch(rpCell, /<p[\s\S]*?<\/p>/i));
  const change = toNumber(changeRaw);
  const level = toNumber(firstMatch(playerCell, /等级\s*<span[^>]*>([\s\S]*?)<\/span>/i)) || toNumber(firstMatch(playerCell, /level\s*<span[^>]*>([\s\S]*?)<\/span>/i));
  const statusText = cleanText(firstMatch(playerCell, /<p[^>]*margin-top:\s*0[\s\S]*?<\/p>/i));
  const online = /avatar_online|大厅|lobby|online/i.test(playerCell) || /大厅|在线|online/i.test(statusText);
  const twitch = firstMatch(playerCell, /href="([^"]*type=twitch[^"]*)"/i).replace(/&amp;/g, '&');
  const twitter = firstMatch(playerCell, /href="(https:\/\/twitter\.com\/[^"]+)"/i);
  const country = firstMatch(playerCell, /flag-icon-([a-z]{2})/i).toUpperCase();
  const input = /fa-gamepad/i.test(playerCell) ? '手柄' : '键鼠';

  return {
    rank,
    uid,
    name,
    rp,
    change,
    level,
    online,
    statusText,
    country,
    input,
    links: { twitch, twitter },
  };
}).filter((player) => player.rp > 0);

// Calculate changes vs previous data
for (const p of players) {
  const prev = prevMap[p.uid];
  if (prev) {
    p.rpChange = p.rp - prev.rp;
    p.rankChange = prev.rank - p.rank; // positive = moved up
  } else {
    p.rpChange = 0;
    p.rankChange = 0;
  }
}

const payload = {
  title: 'Apex 实时排位排行榜（BR/PC）',
  source: 'Apex Legends Status',
  sourceUrl: 'https://apexlegendsstatus.com/live-ranked-leaderboards/Battle_Royale/PC',
  importedAt: new Date().toISOString(),
  count: players.length,
  players,
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Imported ${players.length} ranked leaderboard rows to ${outputFile}`);
