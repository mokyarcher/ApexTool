import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';

const router = Router();

const LONGCAT_URL = 'https://api.longcat.chat/openai/v1/chat/completions';
const MODEL = process.env.LONGCAT_MODEL || 'LongCat-Flash-Chat';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

const SYSTEM_PROMPT = `你是 APEX TOOL 赛季工具站的 AI 助手，名叫「探路者」。你的职责是帮助用户基于本站已有数据了解网站功能、快速导航、总结站内信息。

## 权威性规则
1. 你必须优先使用「站内资源库上下文」回答，站内数据是当前会话的最高优先级资料。
2. 如果站内上下文已经包含答案，不要引入外部资料，不要凭记忆补充。
3. 如果站内上下文没有相关资料，必须明确说“本站暂未收录这部分信息”，然后再用谨慎语气补充通用知识。
4. 不确定时不要编造具体赛季、日期、传奇、武器、商店内容。
5. 回答“最近更新/最新公告/当前赛季/商店上架”等问题时，必须以站内资源库上下文为准。

## 网站页面
- /battlepass — 通行证：查看当前赛季战斗通行证奖励
- /shop — 商店：查看每日/每周轮换商店、里程碑商店
- /shop#exotic — 奇异碎片（绿币）商店：查看用绿色奇异碎片可以购买的商品
- /shop#recolor — 复刻商店：传奇皮肤复刻涂装
- /shop#premium — 高级商店：付费限定商品
- /shop#double-strike — 双倍打击限时商品
- /shop#featured-bundle — 精选捆绑包
- /mythic — 神话级：传家宝、威望级皮肤、通用近战、神话武器
- /coins — 金币比例：各地区 Apex 金币充值比例对比
- /patch-notes — 更新公告：游戏更新和补丁说明
- /encyclopedia — 百科：传奇角色和武器数据
- /stats — 战绩查询：查询玩家数据
- /mbti — 人格测试：Apex 角色人格测试

## 回复规则
1. 简洁友好，用中文回答
2. 当用户想去某个页面时，在回复中包含导航指令，格式：[NAV:/path] 或 [NAV:/path#hash]
   例如：用户说"我想看绿币商店"，回复"好的，带你去奇异碎片商店看看！[NAV:/shop#exotic]"
3. 每次只包含一个 NAV 指令
4. 如果用户的问题跟网站无关但跟 Apex Legends 有关，可以简单回答
5. 如果完全无关，礼貌地引导回网站功能
6. 不要在回复中显示 NAV 标签本身给用户看，它会被前端自动解析`;

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, relativePath), 'utf-8'));
  } catch {
    return null;
  }
}

function compactItems(items, limit = 8) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, limit).map((item) => ({
    name: item.name || item.title || item.nameCN,
    nameCN: item.nameCN,
    type: item.type,
    rarity: item.rarity,
    price: item.price ?? item.salePrice ?? item.originalPrice,
    cost: item.cost ?? item.priceMaterials ?? item.priceTokens,
    discount: item.discount,
    legend: item.legend,
    weapon: item.weapon,
  })).filter((item) => Object.values(item).some(Boolean));
}

function formatItem(item) {
  return [
    item.nameCN || item.name,
    item.legend || item.weapon,
    item.type,
    item.rarity,
    item.price ? `${item.price} 金币/碎片` : '',
    item.cost ? `${item.cost} 材料/代币` : '',
    item.discount ? `${item.discount}% OFF` : '',
  ].filter(Boolean).join(' / ');
}

function buildPatchContext() {
  const data = readJson('patch-notes.json');
  const latest = data?.patches?.[0];
  if (!latest) return '';
  return [
    '## 站内资源库：最新更新公告',
    `标题：${latest.title}`,
    `英文标题：${latest.titleEN}`,
    `日期：${latest.date}`,
    `赛季：${latest.season}`,
    `摘要：${latest.summary}`,
    latest.sourceUrl ? `来源：${latest.sourceUrl}` : '',
    latest.legendChanges?.length
      ? `传奇改动：${latest.legendChanges.slice(0, 8).map((x) => `${x.legend || x.legendEN}：${x.changes?.slice(0, 3).join('；')}`).join('\n')}`
      : '',
    latest.weaponChanges?.length
      ? `武器改动：${latest.weaponChanges.slice(0, 8).map((x) => `${x.weapon || x.weaponEN}：${x.changes?.slice(0, 3).join('；')}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n');
}

function buildSeasonContext() {
  const seasons = readJson('battlepass/seasons.json');
  const current = seasons?.seasons?.find((s) => s.id === seasons.current);
  const bp = current ? readJson(`battlepass/${current.id}.json`) : null;
  if (!current) return '';
  return [
    '## 站内资源库：当前通行证赛季',
    `当前赛季ID：${seasons.current}`,
    `赛季：S${current.season} 第 ${current.split} 赛段`,
    `名称：${current.name} / ${current.nameEN}`,
    `时间：${current.startDate} 至 ${current.endDate}`,
    bp ? `通行证描述：${bp.description}` : '',
    bp?.rewards?.length ? `奖励数量：${bp.rewards.length}` : '奖励数量：本站当前未录入奖励条目',
  ].filter(Boolean).join('\n');
}

function buildShopContext() {
  const shops = [
    ['exotic-shop.json', '奇异碎片（绿币）商店', '/shop#exotic'],
    ['recolor-shop.json', '复刻商店', '/shop#recolor'],
    ['premium-shop.json', '高级商店', '/shop#premium'],
    ['double-strike-shop.json', '双倍打击商店', '/shop#double-strike'],
    ['featured-bundle-shop.json', '精选捆绑包', '/shop#featured-bundle'],
    ['milestone.json', '里程碑商店', '/shop'],
  ];
  const lines = ['## 站内资源库：商店数据'];
  for (const [file, title, nav] of shops) {
    const data = readJson(file);
    if (!data) continue;
    const items = data.items || data.bundles || data.rewards || data.shop || [];
    lines.push(`### ${title} (${nav})`);
    if (data.name) lines.push(`名称：${data.name}`);
    if (data.startDate || data.endDate) lines.push(`时间：${data.startDate || '?'} 至 ${data.endDate || '?'}`);
    const compact = compactItems(items, 10);
    if (compact.length) lines.push(`商品示例：${compact.map(formatItem).join('；')}`);
    else lines.push('商品：本站当前数据结构中未提取到商品列表');
  }
  return lines.join('\n');
}

function buildMythicContext() {
  const data = readJson('mythic.json');
  if (!data) return '';
  return [
    '## 站内资源库：神话级数据',
    data.heirlooms ? `传家宝数量：${data.heirlooms.items?.length || 0}；示例：${data.heirlooms.items?.slice(0, 10).map((i) => `${i.legend}-${i.name}`).join('、')}` : '',
    data.prestigeSkins ? `威望级皮肤数量：${data.prestigeSkins.items?.length || 0}；示例：${data.prestigeSkins.items?.slice(0, 8).map((i) => `${i.legend}-${i.name}`).join('、')}` : '',
    data.universalMelee ? `通用近战数量：${data.universalMelee.items?.length || 0}` : '',
    data.mythicWeapons ? `神话武器数量：${data.mythicWeapons.items?.length || 0}` : '',
  ].filter(Boolean).join('\n');
}

function buildKnowledgeContext(messages) {
  const text = messages.map((m) => m.content || '').join('\n').toLowerCase();
  const contexts = [buildSeasonContext()];
  if (/更新|公告|补丁|patch|最近|最新/.test(text)) contexts.push(buildPatchContext());
  if (/商店|绿币|奇异|碎片|复刻|高级|捆绑|双倍|上架|商品|shop|exotic/.test(text)) contexts.push(buildShopContext());
  if (/神话|传家宝|威望|近战|模型|mythic|heirloom/.test(text)) contexts.push(buildMythicContext());
  if (contexts.length === 1) {
    contexts.push(buildPatchContext(), buildShopContext(), buildMythicContext());
  }
  return contexts.filter(Boolean).join('\n\n');
}

// Rate limit: simple in-memory per-IP
const rateMap = new Map();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60_000;

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Clean up rate map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.start > RATE_WINDOW) rateMap.delete(ip);
  }
}, RATE_WINDOW);

router.post('/chat', async (req, res) => {
  const apiKey = process.env.LONGCAT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured' });
  }

  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRate(ip)) {
    return res.status(429).json({ error: '请求太频繁，请稍后再试' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' });
  }

  const trimmed = messages.slice(-10);
  const knowledgeContext = buildKnowledgeContext(trimmed);

  try {
    const response = await fetch(LONGCAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `以下是站内资源库上下文，请优先使用：\n\n${knowledgeContext}` },
          ...trimmed,
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Longcat API error:', response.status, err);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    // Stream SSE to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }
    }
    res.end();
  } catch (err) {
    console.error('AI chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.end();
    }
  }
});

export default router;
