# Apex Tool

一个 Apex Legends 的赛季工具站 Web 应用:

- 当前赛季 **战斗通行证** 奖励预览 (Free / Premium 过滤)
- **地图轮换** (大逃杀 / 排位 / LTM) 实时倒计时
- **金币购买** 档位性价比对比
- **制造台轮换** (每日 / 每周)
- **战绩查询** 支持 UID / 名字深度搜索，多匹配选择，全面汉化

## 技术栈

- 前端:React 18 + Vite + Tailwind CSS + lucide-react
- 后端:Node.js + Express (ESM)
- 数据源:[mozambiquehe.re Apex API](https://apexlegendsapi.com) + 内置静态通行证数据

## 目录结构

```
ApexTool/
├── server/     # Express 后端 API (端口 4000)
│   ├── routes/       地图、通行证、金币、制造
│   ├── data/         通行证等静态数据
│   └── lib/cache.js  内存缓存
└── client/     # React 前端 (端口 5173)
    └── src/pages/    BattlePass / Maps / Coins / Crafting / PlayerStats
```

## 本地运行

```bash
# 1. 启动后端
cd server
npm install
cp .env.example .env   # Windows: copy .env.example .env
# 编辑 .env,填入 APEX_API_KEY (从 https://apexlegendsapi.com 免费申请)
npm run dev            # 或 npm start

# 2. 启动前端 (另开一个终端)
cd client
npm install
npm run dev
# 打开 http://localhost:5173
```

> 未配置 `APEX_API_KEY` 时,地图 / 制造接口将返回**模拟数据**,前端仍然可用,方便本地演示。

## 部署

### 后端
- 推荐 Railway / Render / Fly.io / 阿里云等支持长连接的平台。
- 设置环境变量 `APEX_API_KEY` 和 `CORS_ORIGIN=https://你的前端域名`。
- 启动命令 `npm start`。

### 前端
- `npm run build` 生成 `dist/`,部署到 Netlify / Vercel / Cloudflare Pages。
- 部署前将 `VITE_API_BASE` 设为后端公网地址(如 `https://api.example.com/api`)。

## 接口一览

| 路由 | 说明 |
| --- | --- |
| `GET /api/health` | 健康检查 |
| `GET /api/battlepass` | 当前赛季通行证及奖励 |
| `GET /api/battlepass/rewards?premium=true&level=50` | 奖励过滤 |
| `GET /api/maps` | 三模式地图轮换 |
| `GET /api/coins` | 金币包档位 & 性价比 |
| `GET /api/crafting` | 制造台轮换 |
| `GET /api/player?uid=xxx&platform=PC` | 玩家战绩查询 (UID) |
| `GET /api/player/lookup?name=xxx&platform=PC` | 深度搜索玩家 |

## 免责声明

本站为非官方工具。Apex Legends、Respawn、EA 等名称及商标归其各自所有者所有。
通行证静态数据为演示用途,实际奖励以游戏内为准。
