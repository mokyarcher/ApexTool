import fs from 'fs';
import path from 'path';
import https from 'https';

const API_URL = 'https://raddythebrand.github.io/apex-legends/data.json';
const OUT_DIR = path.resolve('client/public/legends');

// Map from our legends.json nameEN -> API nickname (they should match mostly)
const LEGENDS_JSON = JSON.parse(fs.readFileSync('server/data/legends.json', 'utf8'));
const ourLegends = LEGENDS_JSON.legends.map(l => ({
  nameEN: l.nameEN,
  filename: path.basename(l.image), // e.g. wraith.jpg
}));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
  });
}

async function main() {
  console.log('Fetching API data...');
  const resp = await fetch(API_URL);
  const apiLegends = await resp.json();

  // Build lookup: nickname (lowercase) -> thumbnail URL
  const lookup = {};
  for (const l of apiLegends) {
    lookup[l.nickname.toLowerCase()] = l.thumbnail?.medium || l.thumbnail?.small || l.thumbnail?.default;
  }

  // Some name mappings for mismatches
  const NAME_MAP = {
    'Alter': 'Alter',
    'Ballistic': 'Ballistic',
    'Catalyst': 'Catalyst',
    'Conduit': 'Conduit',
  };

  let downloaded = 0, skipped = 0, failed = 0;

  for (const legend of ourLegends) {
    const key = legend.nameEN.toLowerCase();
    const url = lookup[key];
    const dest = path.join(OUT_DIR, legend.filename.replace('.jpg', '.png'));

    if (!url) {
      console.log(`[SKIP] No image found for ${legend.nameEN}`);
      skipped++;
      continue;
    }

    try {
      console.log(`[DL] ${legend.nameEN} -> ${path.basename(dest)}`);
      await download(url, dest);
      downloaded++;
    } catch (e) {
      console.log(`[FAIL] ${legend.nameEN}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

main();
