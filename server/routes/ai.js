import { Router } from 'express';

const router = Router();

const LONGCAT_URL = 'https://api.longcat.chat/openai/v1/chat/completions';
const MODEL = process.env.LONGCAT_MODEL || 'LongCat-Flash-Chat';

const SYSTEM_PROMPT = `你是 APEX TOOL 赛季工具站的 AI 助手，名叫「探路者」。你的职责是帮助用户了解网站功能并快速导航到对应页面。

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

  // Limit conversation length to prevent abuse
  const trimmed = messages.slice(-10);

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
