import fs from 'fs';
import path from 'path';
import https from 'https';

const OUT_DIR = path.resolve('client/public/weapons');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Use wiki.gg which has direct accessible image URLs
const BASE = 'https://apexlegends.wiki.gg/images';
const WEAPONS = {
  'r301.png': `${BASE}/thumb/R-301_Carbine.png/600px-R-301_Carbine.png`,
  'r99.png': `${BASE}/thumb/R-99_SMG.png/600px-R-99_SMG.png`,
  'peacekeeper.png': `${BASE}/thumb/Peacekeeper.png/600px-Peacekeeper.png`,
  'rampage.png': `${BASE}/thumb/Rampage_LMG.png/600px-Rampage_LMG.png`,
  'sentinel.png': `${BASE}/thumb/Sentinel.png/600px-Sentinel.png`,
  'volt.png': `${BASE}/thumb/Volt_SMG.png/600px-Volt_SMG.png`,
  'bocek.png': `${BASE}/thumb/Bocek_Compound_Bow.png/600px-Bocek_Compound_Bow.png`,
  'flatline.png': `${BASE}/thumb/VK-47_Flatline.png/600px-VK-47_Flatline.png`,
  'havoc.png': `${BASE}/thumb/HAVOC_Rifle.png/600px-HAVOC_Rifle.png`,
  'hemlok.png': `${BASE}/thumb/Hemlok_Burst_AR.png/600px-Hemlok_Burst_AR.png`,
  'alternator.png': `${BASE}/thumb/Alternator_SMG.png/600px-Alternator_SMG.png`,
  'car.png': `${BASE}/thumb/C.A.R._SMG.png/600px-C.A.R._SMG.png`,
  'prowler.png': `${BASE}/thumb/Prowler_Burst_PDW.png/600px-Prowler_Burst_PDW.png`,
  'devotion.png': `${BASE}/thumb/Devotion_LMG.png/600px-Devotion_LMG.png`,
  'spitfire.png': `${BASE}/thumb/M600_Spitfire.png/600px-M600_Spitfire.png`,
  'lstar.png': `${BASE}/thumb/L-STAR_EMG.png/600px-L-STAR_EMG.png`,
  'triple-take.png': `${BASE}/thumb/Triple_Take.png/600px-Triple_Take.png`,
  'g7.png': `${BASE}/thumb/G7_Scout.png/600px-G7_Scout.png`,
  '3030.png': `${BASE}/thumb/30-30_Repeater.png/600px-30-30_Repeater.png`,
  'charge-rifle.png': `${BASE}/thumb/Charge_Rifle.png/600px-Charge_Rifle.png`,
  'longbow.png': `${BASE}/thumb/Longbow_DMR.png/600px-Longbow_DMR.png`,
  'eva8.png': `${BASE}/thumb/EVA-8_Auto.png/600px-EVA-8_Auto.png`,
  'mozambique.png': `${BASE}/thumb/Mozambique_Shotgun.png/600px-Mozambique_Shotgun.png`,
  'p2020.png': `${BASE}/thumb/P2020.png/600px-P2020.png`,
  're45.png': `${BASE}/thumb/RE-45_Auto.png/600px-RE-45_Auto.png`,
  'wingman.png': `${BASE}/thumb/Wingman.png/600px-Wingman.png`,
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const doRequest = (reqUrl) => {
      const mod = reqUrl.startsWith('https') ? https : require('http');
      mod.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    };
    doRequest(url);
  });
}

async function main() {
  let ok = 0, fail = 0;
  for (const [filename, url] of Object.entries(WEAPONS)) {
    const dest = path.join(OUT_DIR, filename);
    try {
      process.stdout.write(`[DL] ${filename}... `);
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 1000) {
        console.log(`WARN: tiny file (${size}b), may be error page`);
        fail++;
      } else {
        console.log(`OK (${(size/1024).toFixed(1)}KB)`);
        ok++;
      }
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone! OK: ${ok}, Failed: ${fail}`);
}

main();
