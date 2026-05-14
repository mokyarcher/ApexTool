#!/usr/bin/env node
/**
 * 排行榜数据健康检查脚本
 * 可以添加到 crontab 定期执行，数据异常时发送通知
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { notify } from './notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, '../../server/data/ranked-leaderboard.json');

// 健康检查配置
const CONFIG = {
  minPlayers: 500,      // 最少玩家数（低于此值视为异常）
  maxAgeHours: 3,       // 数据最大年龄（小时）
  minRP: 10000,         // 最低RP门槛（低于此值可能是测试数据）
};

async function checkHealth() {
  const issues = [];

  // 检查文件是否存在
  if (!fs.existsSync(dataFile)) {
    issues.push('❌ 数据文件不存在');
    return { healthy: false, issues };
  }

  // 读取数据
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (e) {
    issues.push('❌ 数据文件损坏，无法解析 JSON');
    return { healthy: false, issues };
  }

  // 检查玩家数量
  if (!data.players || data.players.length === 0) {
    issues.push('❌ 玩家列表为空');
  } else if (data.players.length < CONFIG.minPlayers) {
    issues.push(`⚠️  玩家数量异常: ${data.players.length} (期望 >= ${CONFIG.minPlayers})`);
  }

  // 检查数据时效性
  if (data.importedAt) {
    const importedTime = new Date(data.importedAt).getTime();
    const now = Date.now();
    const ageHours = (now - importedTime) / (1000 * 60 * 60);
    if (ageHours > CONFIG.maxAgeHours) {
      issues.push(`⚠️  数据已过期: ${ageHours.toFixed(1)} 小时前 (期望 < ${CONFIG.maxAgeHours} 小时)`);
    }
  } else {
    issues.push('❌ 缺少导入时间戳');
  }

  // 检查数据质量（抽样检查前10名）
  if (data.players && data.players.length > 0) {
    const sample = data.players.slice(0, 10);
    const invalidRP = sample.filter(p => !p.rp || p.rp < CONFIG.minRP);
    if (invalidRP.length > 5) {
      issues.push(`⚠️  数据质量异常: ${invalidRP.length}/10 名玩家 RP 值异常`);
    }

    // 检查排名是否连续
    const ranks = sample.map(p => p.rank).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] !== ranks[i-1] + 1) {
        gaps.push(`${ranks[i-1]} -> ${ranks[i]}`);
      }
    }
    if (gaps.length > 3) {
      issues.push(`⚠️  排名不连续，可能存在数据缺失`);
    }
  }

  return {
    healthy: issues.length === 0,
    issues,
    stats: {
      playerCount: data.players?.length || 0,
      importedAt: data.importedAt,
      topRP: data.players?.[0]?.rp || 0,
    }
  };
}

function toBJ(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

// 执行检查
const result = await checkHealth();

console.log('🏥 排行榜数据健康检查\n');
console.log(`状态: ${result.healthy ? '✅ 健康' : '❌ 异常'}`);
console.log(`玩家数: ${result.stats.playerCount}`);
console.log(`更新时间: ${toBJ(result.stats.importedAt)}`);
console.log(`最高分: ${result.stats.topRP.toLocaleString()} RP`);

if (result.issues.length > 0) {
  console.log('\n⚠️  发现问题:');
  result.issues.forEach(issue => console.log(`  ${issue}`));
  console.log('\n💡 建议: 运行更新脚本重新获取数据');

  // 发送通知
  const message = `玩家数: ${result.stats.playerCount}\n更新时间: ${toBJ(result.stats.importedAt)}\n最高分: ${result.stats.topRP.toLocaleString()} RP\n\n问题:\n${result.issues.join('\n')}`;
  await notify('🚨 Apex排行榜数据异常', message);

  process.exit(1);  // 异常退出码，可用于监控告警
} else {
  console.log('\n✅ 一切正常！');
  process.exit(0);
}
