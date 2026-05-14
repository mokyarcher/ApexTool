import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(toolDir, 'config.json');

if (!fs.existsSync(configPath)) {
  console.error('Missing config.json. Copy config.example.json to config.json and fill in your server settings.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const htmlPath = path.resolve(toolDir, config.localHtml || 'leaderboard.html');
const userDataDir = path.join(toolDir, '.browser-profile');
const browser = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1400, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});

const page = browser.pages()[0] || await browser.newPage();

console.log('');
console.log('Opening leaderboard page...');
console.log('If Cloudflare verification appears, complete it manually.');
console.log('Script will auto-detect when the leaderboard table loads (up to 5 minutes).');
console.log('');

await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 120000 });

try {
  await page.waitForSelector('#liveTable tbody tr', { timeout: 300000 });
  console.log('Leaderboard table detected!');
} catch {
  console.warn('Timed out waiting for leaderboard table. Saving current HTML anyway.');
}

// Expand DataTable to show ALL rows instead of just default 10
console.log('Expanding table to show all rows...');
let rowCount = -1;
for (let attempt = 1; attempt <= 5; attempt++) {
  await new Promise((r) => setTimeout(r, 2000));
  rowCount = await page.evaluate(() => {
    try {
      const table = $('#liveTable').DataTable();
      const total = table.rows().count();
      if (total <= 10) return -1;
      table.page.len(total).draw();
      return total;
    } catch (e) {
      return -1;
    }
  });
  if (rowCount > 10) {
    console.log(`Table expanded: ${rowCount} total rows (attempt ${attempt})`);
    break;
  }
  console.log(`Attempt ${attempt}/5: DataTable not ready (got ${rowCount}), retrying...`);
}

if (rowCount <= 10) {
  console.error('FAILED: Could not expand table after 5 attempts. Aborting to prevent bad data.');
  await browser.close();
  process.exit(1);
}

// Wait for DOM to update after expanding
await new Promise((r) => setTimeout(r, 5000));

const html = await page.content();
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Saved leaderboard HTML to: ${htmlPath}`);

await browser.close();
