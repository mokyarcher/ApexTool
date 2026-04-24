/**
 * 批量从 Sketchfab 搜索并下载 Apex 传家宝 3D 模型（glTF 格式）
 *
 * 用法：
 *   node scripts/download-heirloom-models.mjs YOUR_SKETCHFAB_API_TOKEN
 *
 * 前提：需要 Sketchfab 账号的 API Token
 *       https://sketchfab.com/settings/password 底部获取
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { exec } from 'child_process';

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('❌ 请提供 Sketchfab API Token：');
  console.error('   node scripts/download-heirloom-models.mjs YOUR_TOKEN');
  process.exit(1);
}

const OUTPUT_DIR = path.resolve('client/public/mythic/heirloom/models');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 搜索关键词 → 输出文件名映射
const SEARCHES = [
  { query: 'apex legends wraith heirloom kunai', filename: '1' },
  { query: 'apex legends bloodhound heirloom raven bite', filename: '2' },
  { query: 'apex legends lifeline heirloom shock sticks', filename: '3' },
  { query: 'apex legends pathfinder heirloom boxing glove', filename: '4' },
  { query: 'apex legends octane heirloom butterfly knife', filename: '5' },
  { query: 'apex legends mirage heirloom trophy', filename: '6' },
  { query: 'apex legends caustic heirloom death hammer', filename: '7' },
  { query: 'apex legends gibraltar heirloom war club', filename: '8' },
  { query: 'apex legends bangalore heirloom kukri', filename: '9' },
  { query: 'apex legends revenant heirloom scythe', filename: '10' },
  { query: 'apex legends crypto heirloom biwon blade', filename: '11' },
  { query: 'apex legends wattson heirloom energy reader', filename: '12' },
  { query: 'apex legends valkyrie heirloom suzaku', filename: '13' },
  { query: 'apex legends rampart heirloom problem solver', filename: '14' },
  { query: 'apex legends loba heirloom garra', filename: '15' },
  { query: 'apex legends seer heirloom showstoppers', filename: '16' },
  { query: 'apex legends ash heirloom', filename: '17' },
  { query: 'apex legends fuse heirloom', filename: '18' },
];

const API_BASE = 'https://api.sketchfab.com/v3';
const HEADERS = { Authorization: `Token ${TOKEN}` };

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HEADERS }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
    req.on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return follow(res.headers.location);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: HTTP ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function searchAndDownload({ query, filename }) {
  console.log(`\n🔍 搜索: ${query}`);

  // 搜索可下载的模型
  const searchUrl = `${API_BASE}/search?type=models&q=${encodeURIComponent(query)}&downloadable=true&sort_by=-likeCount&count=5`;
  const result = await fetchJSON(searchUrl);

  if (!result.results || result.results.length === 0) {
    console.log(`   ⚠️  没找到可下载的模型，跳过`);
    return false;
  }

  // 取第一个结果
  const model = result.results[0];
  console.log(`   📦 找到: ${model.name} (by ${model.user?.username})`);
  console.log(`   👁️  浏览: https://sketchfab.com/3d-models/${model.slug}-${model.uid}`);

  // 获取下载链接
  const dlUrl = `${API_BASE}/models/${model.uid}/download`;
  let dlInfo;
  try {
    dlInfo = await fetchJSON(dlUrl);
  } catch (e) {
    console.log(`   ⚠️  无法下载此模型（可能需要购买），跳过`);
    return false;
  }

  // 优先 glTF，其次 GLB
  const gltfDl = dlInfo.gltf || dlInfo.glb;
  if (!gltfDl) {
    console.log(`   ⚠️  没有 glTF/GLB 格式，跳过`);
    return false;
  }

  const zipPath = path.join(OUTPUT_DIR, `${filename}_temp.zip`);
  console.log(`   ⬇️  下载中...`);
  await downloadFile(gltfDl.url, zipPath);
  console.log(`   ✅ 下载完成: ${zipPath}`);
  console.log(`   📁 请手动解压，用 Blender 导入 glTF → 导出为 ${filename}.glb`);

  return true;
}

async function main() {
  console.log('=== Apex 传家宝模型批量下载 ===');
  console.log(`输出目录: ${OUTPUT_DIR}\n`);

  let success = 0;
  let failed = 0;

  for (const search of SEARCHES) {
    try {
      const ok = await searchAndDownload(search);
      if (ok) success++;
      else failed++;
    } catch (e) {
      console.log(`   ❌ 错误: ${e.message}`);
      failed++;
    }
    // 避免请求太快
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n=== 完成 ===`);
  console.log(`✅ 成功: ${success}  ⚠️ 跳过: ${failed}`);
  console.log(`\n下一步：`);
  console.log(`1. 解压下载的 zip 文件`);
  console.log(`2. Blender 导入 glTF → 确认贴图正常 → 导出为 .glb`);
  console.log(`3. 放到 ${OUTPUT_DIR}/ 下，命名为 1.glb ~ 8.glb`);
}

main().catch(console.error);
