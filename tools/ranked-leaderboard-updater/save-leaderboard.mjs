import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(toolDir, 'config.json');

if (!fs.existsSync(configPath)) {
  console.error('Missing config.json. Copy config.example.json to config.json and fill in your server settings.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const htmlPath = path.resolve(toolDir, config.localHtml || 'leaderboard.html');
const userDataDir = path.join(toolDir, '.browser-profile');
const rl = readline.createInterface({ input, output });

const browser = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1400, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});

const page = browser.pages()[0] || await browser.newPage();
await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 120000 });

console.log('');
console.log('Browser opened. If Cloudflare or captcha appears, complete it manually.');
console.log('Wait until the leaderboard table is visible, then return here and press Enter.');
console.log('');
await rl.question('Press Enter after the leaderboard is fully loaded...');

try {
  await page.waitForSelector('#liveTable tbody tr', { timeout: 10000 });
} catch {
  console.warn('Could not detect #liveTable rows. Saving current HTML anyway.');
}

const html = await page.content();
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Saved leaderboard HTML to: ${htmlPath}`);

await browser.close();
rl.close();
