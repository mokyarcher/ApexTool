import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const inputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(rootDir, 'leaderboard.html');

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
  console.error(`❌ Input HTML not found: ${inputFile}`);
  process.exit(1);
}

console.log(`📄 Reading file: ${inputFile}`);
const html = stripGoogleTranslate(fs.readFileSync(inputFile, 'utf8'));
console.log(`📊 File size: ${html.length} characters`);

// Check for tbody
const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
console.log(`\n🔍 tbody found: ${tbodyMatch ? 'YES' : 'NO'}`);
if (!tbodyMatch) {
  console.log('❌ No tbody found in HTML!');
  console.log('\n--- First 1000 chars of HTML ---');
  console.log(html.substring(0, 1000));
  process.exit(1);
}

const tbody = tbodyMatch[1];
console.log(`📊 tbody size: ${tbody.length} characters`);

// Check for rows
const rows = [...tbody.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
console.log(`🔍 Rows found: ${rows.length}`);

if (rows.length === 0) {
  console.log('❌ No rows found in tbody!');
  console.log('\n--- First 500 chars of tbody ---');
  console.log(tbody.substring(0, 500));
  process.exit(1);
}

// Debug first 3 rows
console.log('\n--- Debugging first 3 rows ---');
rows.slice(0, 3).forEach((row, index) => {
  console.log(`\n📌 Row ${index + 1}:`);
  console.log(`   Row length: ${row.length}`);

  const cells = [...row.matchAll(/<td[\s\S]*?<\/td>/gi)].map((match) => match[0]);
  console.log(`   Cells found: ${cells.length}`);

  if (cells.length >= 4) {
    const rankCell = cells[1] || '';
    const playerCell = cells[2] || '';
    const rpCell = cells[3] || '';

    console.log(`   Rank cell preview: ${rankCell.substring(0, 100)}...`);
    console.log(`   Player cell preview: ${playerCell.substring(0, 100)}...`);
    console.log(`   RP cell preview: ${rpCell.substring(0, 100)}...`);

    // Try to extract data
    const rankMatch = rankCell.match(/<span[^>]*font-size:\s*25px[^>]*>([\s\S]*?)<\/span>/i);
    const rpMatch = rpCell.match(/<span[^>]*font-size:\s*20px[^>]*>([\s\S]*?)<\/span>/i);
    const uidMatch = playerCell.match(/profile\/uid\/[^/]+\/([0-9]+)/i);
    const nameMatch = playerCell.match(/<a[^>]*profile\/uid[^>]*>([\s\S]*?)<\/a>/i);

    console.log(`   Rank extracted: ${rankMatch ? rankMatch[1] : 'FAILED'}`);
    console.log(`   RP extracted: ${rpMatch ? rpMatch[1] : 'FAILED'}`);
    console.log(`   UID extracted: ${uidMatch ? uidMatch[1] : 'FAILED'}`);
    console.log(`   Name extracted: ${nameMatch ? cleanText(nameMatch[1]) : 'FAILED'}`);
  } else {
    console.log('   ❌ Not enough cells in row!');
    console.log(`   Row content: ${row.substring(0, 200)}...`);
  }
});

// Try to parse all rows and see how many succeed
console.log('\n--- Parsing all rows ---');
let successCount = 0;
let failCount = 0;
let rpZeroCount = 0;

rows.forEach((row, index) => {
  const cells = [...row.matchAll(/<td[\s\S]*?<\/td>/gi)].map((match) => match[0]);
  if (cells.length < 4) {
    failCount++;
    return;
  }

  const rpCell = cells[3] || '';
  const rp = toNumber(firstMatch(rpCell, /<span[^>]*font-size:\s*20px[^>]*>([\s\S]*?)<\/span>/i));

  if (rp > 0) {
    successCount++;
  } else {
    rpZeroCount++;
    if (rpZeroCount <= 3) {
      console.log(`   Row ${index + 1}: RP=0, RP cell: ${rpCell.substring(0, 150)}...`);
    }
  }
});

console.log(`\n✅ Successfully parsed: ${successCount} rows`);
console.log(`❌ Failed (not enough cells): ${failCount} rows`);
console.log(`⚠️  RP is 0 (filtered out): ${rpZeroCount} rows`);

if (successCount === 0 && rpZeroCount > 0) {
  console.log('\n💡 Diagnosis: RP extraction is failing. The HTML structure may have changed.');
  console.log('   The regex for RP extraction may need to be updated.');
}
