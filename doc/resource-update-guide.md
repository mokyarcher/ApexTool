# ApexTool 资源更新指南

> 本文档面向运维人员，说明每次赛季/商店轮换时需要更新哪些资源、如何命名、放到哪里。

---

## 目录

1. [项目结构概览](#1-项目结构概览)
2. [通行证奖励更新](#2-通行证奖励更新)
3. [商店更新](#3-商店更新)
   - 3.1 双重击商店
   - 3.2 精选组合包商店
   - 3.3 高级射击商店
   - 3.4 改色商店
   - 3.5 奇异商店
   - 3.6 里程碑收集
4. [神话级页面更新](#4-神话级页面更新)
   - 4.1 传家宝
   - 4.2 威望级皮肤
   - 4.3 通用近战
   - 4.4 神话武器
5. [更新后的操作流程](#5-更新后的操作流程)
6. [图片规范](#6-图片规范)
7. [3D 模型规范](#7-3d-模型规范)

---

## 1. 项目结构概览

```
ApexTool/
├── server/data/              ← JSON 数据文件（后端）
│   ├── battlepass.json
│   ├── mythic.json
│   ├── double-strike-shop.json
│   ├── featured-bundle-shop.json
│   ├── premium-shop.json
│   ├── recolor-shop.json
│   ├── exotic-shop.json
│   └── milestone.json
│
├── client/public/            ← 静态资源（图片/模型）
│   ├── bp/                   ← 通行证奖励图
│   │   └── full/             ← 通行证奖励大图
│   ├── shop/                 ← 商店图片
│   │   ├── double-strike/    ← 双重击商店
│   │   ├── featured-bundle/  ← 精选组合包
│   │   │   └── full/
│   │   ├── premium/          ← 高级射击商店
│   │   │   └── full/
│   │   ├── recolor/          ← 改色商店
│   │   │   └── full/
│   │   ├── exotic/           ← 奇异商店
│   │   │   └── full/
│   │   └── milestone/        ← 里程碑收集
│   │       ├── featured/
│   │       ├── milestones/
│   │       └── rewards/
│   │           └── full/
│   └── mythic/               ← 神话级页面
│       ├── heirloom/         ← 传家宝
│       │   └── models/       ← 传家宝 3D 模型 (.glb)
│       ├── prestige/         ← 威望级皮肤
│       ├── melee/            ← 通用近战
│       │   └── models/       ← 近战 3D 模型 (.glb)
│       └── weapon/           ← 神话武器
```

---

## 2. 通行证奖励更新

**更新频率**：每赛季 / 每赛段（约 6-8 周）

### 数据文件

`server/data/battlepass.json`

```json
{
  "season": 28,
  "splitId": "28.2",
  "name": "全面击破",
  "nameEN": "Breakout",
  "startDate": "2026-03-25",
  "endDate": "2026-05-06",
  "pricePremium": 950,
  "priceUltimate": 8800,
  "priceUltimatePlus": 13800,
  "rewards": [
    {
      "level": 1,
      "tier": "premium",        // free / premium / ultimate / ultimate_plus
      "type": "skin",
      "name": "Liu Que: Cold Touch",
      "nameCN": "琉雀-冰冷触感",
      "rarity": "epic",         // common / rare / epic / legendary / mythic
      "image": "/bp/1-1.jpg"
    }
  ]
}
```

### 图片资源

| 目录 | 用途 | 命名规则 |
|------|------|----------|
| `client/public/bp/` | 奖励缩略图 | `{等级}-{序号}.jpg`，如 `1-1.jpg`（第1级第1个奖励） |
| `client/public/bp/full/` | 奖励大图（点击查看） | 与缩略图同名，如 `1-1.jpg` |

### 图片来源

- 游戏内通行证页面截图
- EA 官网赛季更新公告
- ApexLegendsStatusBot 等第三方资讯站

### 操作步骤

1. 修改 `battlepass.json`：更新 `season`、`splitId`、`name`、日期、价格
2. 清空旧图，将新奖励图放入 `client/public/bp/` 和 `bp/full/`
3. 按 `{等级}-{序号}.jpg` 命名
4. JSON 的 `rewards` 数组中每项的 `image` 指向 `/bp/{文件名}`

---

## 3. 商店更新

商店分为 6 个板块，各有独立的 JSON 数据和图片目录。

### 3.1 双重击商店

**更新频率**：每周

**数据文件**：`server/data/double-strike-shop.json`

```json
{
  "name": "双重击商店",
  "startDate": "2026-04-22T00:00:00+08:00",
  "durationDays": 7,
  "items": [
    {
      "id": 1,
      "name": "多元宇宙马拉松运动员",
      "legend": "动力小子",
      "type": "捆绑包",
      "image": "/shop/double-strike/1.jpg",
      "originalPrice": 4600,
      "salePrice": 2150,
      "discount": 53,
      "contents": [
        { "id": 1, "name": "子物品名", "rarity": "传说", "type": "皮肤", "image": "/shop/double-strike/1-1.jpg" },
        { "id": 2, "name": "子物品名", "rarity": "史诗", "type": "边框", "image": "/shop/double-strike/1-2.jpg" }
      ]
    }
  ]
}
```

**图片目录**：`client/public/shop/double-strike/`

| 文件命名 | 用途 |
|----------|------|
| `{id}.jpg` | 捆绑包封面（如 `1.jpg`、`2.jpg`） |
| `{id}-{子物品序号}.jpg` | 子物品图（如 `1-1.jpg`、`1-2.jpg`、`1-3.jpg`） |

---

### 3.2 精选组合包商店

**更新频率**：约 2 周

**数据文件**：`server/data/featured-bundle-shop.json`

```json
{
  "name": "精选组合包商店",
  "startDate": "...",
  "durationDays": 13,
  "items": [
    {
      "id": 1,
      "name": "剧毒虚空组合包",
      "type": "组合包",
      "image": "/shop/featured-bundle/1.jpg",
      "originalPrice": 1000,
      "salePrice": 100,
      "discount": 90
    }
  ]
}
```

**图片目录**：

| 目录 | 命名 | 用途 |
|------|------|------|
| `client/public/shop/featured-bundle/` | `{id}.jpg` | 卡片缩略图 |
| `client/public/shop/featured-bundle/full/` | `{id}.jpg` | 点击查看大图 |

---

### 3.3 高级射击商店

**更新频率**：每周

**数据文件**：`server/data/premium-shop.json`

```json
{
  "name": "高级射击商店",
  "startDate": "...",
  "durationDays": 7,
  "items": [
    {
      "id": 1,
      "name": "深红竞技",
      "type": "捆绑包",
      "image": "/shop/premium/1.jpg",
      "originalPrice": 4600,
      "salePrice": 2500,
      "discount": 45
    }
  ]
}
```

**图片目录**：

| 目录 | 命名 | 用途 |
|------|------|------|
| `client/public/shop/premium/` | `{id}.jpg` | 卡片缩略图 |
| `client/public/shop/premium/full/` | `{id}.jpg` | 点击查看大图 |

---

### 3.4 改色商店

**更新频率**：每周

**数据文件**：`server/data/recolor-shop.json`

```json
{
  "name": "改色",
  "startDate": "...",
  "durationDays": 7,
  "items": [
    {
      "id": 1,
      "name": "奇色",
      "legend": "改色",
      "type": "改色",
      "image": "/shop/recolor/1.jpg",
      "priceMaterials": 1800,
      "priceTokens": 10500
    }
  ]
}
```

**图片目录**：

| 目录 | 命名 | 用途 |
|------|------|------|
| `client/public/shop/recolor/` | `{id}.jpg` | 卡片缩略图 |
| `client/public/shop/recolor/full/` | `{id}.jpg` | 点击查看大图 |

---

### 3.5 奇异商店

**更新频率**：约 2 周

**数据文件**：`server/data/exotic-shop.json`

```json
{
  "name": "奇异商店",
  "startDate": "...",
  "durationDays": 13,
  "items": [
    {
      "id": 1,
      "name": "护甲灭绝",
      "weapon": "R-301 皮肤",
      "type": "奇异 皮肤",
      "image": "/shop/exotic/1.jpg",
      "price": 50
    }
  ]
}
```

**图片目录**：

| 目录 | 命名 | 用途 |
|------|------|------|
| `client/public/shop/exotic/` | `{id}.jpg` | 卡片缩略图 |
| `client/public/shop/exotic/full/` | `{id}.jpg` | 点击查看大图 |

---

### 3.6 里程碑收集

**更新频率**：每活动周期（约 3-4 周）

**数据文件**：`server/data/milestone.json`

**图片目录**：

| 目录 | 命名 | 用途 |
|------|------|------|
| `client/public/shop/milestone/banner.jpg` | 固定名 | 活动横幅 |
| `client/public/shop/milestone/icon.jpg` | 固定名 | 活动图标 |
| `client/public/shop/milestone/1.jpg` | 固定名 | 活动主图 |
| `client/public/shop/milestone/featured/` | `{id}.jpg` | 精选物品图 |
| `client/public/shop/milestone/milestones/` | `{id}.jpg` | 里程碑节点图 |
| `client/public/shop/milestone/rewards/` | `{id}.jpg` | 奖励缩略图 |
| `client/public/shop/milestone/rewards/full/` | `{id}.jpg` | 奖励大图 |

---

## 4. 神话级页面更新

**数据文件**：`server/data/mythic.json`（包含传家宝、威望皮、近战、神话武器全部数据）

### 4.1 传家宝

**新增传家宝时**：

1. 在 `mythic.json` 的 `heirlooms.items` 数组末尾追加：
```json
{
  "id": 26,
  "name": "传家宝中文名",
  "legend": "角色名",
  "image": "/mythic/heirloom/26.jpg",
  "model": "/mythic/heirloom/models/26.glb",
  "price": 150
}
```

2. 放入图片和模型：

| 文件 | 路径 | 说明 |
|------|------|------|
| `26.jpg` | `client/public/mythic/heirloom/` | 传家宝封面图 |
| `26.glb` | `client/public/mythic/heirloom/models/` | 3D 模型文件 |

**图片来源**：游戏内传家宝展示页截图，或 EA 官方公告素材

**3D 模型来源**：
- Sketchfab 搜索传家宝名称，下载 GLB 格式
- 或用 Legion+ 从游戏文件提取，Blender 导出为 .glb
- 压缩：`npx @gltf-transform/cli webp input.glb output.glb`

> 如果暂时没有 3D 模型，`model` 字段留空字符串 `""`，前端会自动回退到图片展示。

---

### 4.2 威望级皮肤

**新增威望皮时**：

1. 在 `mythic.json` 的 `prestige.items` 数组追加
2. 放入图片：

| 文件 | 路径 | 说明 |
|------|------|------|
| `{id}.jpg` | `client/public/mythic/prestige/` | 主图（角色全身） |
| `{id}-lv1.jpg` | 同上 | Tier 1 等级图（如有） |
| `{id}-lv2.jpg` | 同上 | Tier 2 等级图（如有） |
| `{id}-lv3.jpg` | 同上 | Tier 3 等级图（如有） |
| `{id}-icon1.jpg` | 同上 | 徽章图标 1（如有） |
| `{id}-icon2.jpg` | 同上 | 徽章图标 2（如有） |
| `{id}-icon3.jpg` | 同上 | 徽章图标 3（如有） |

> 并非所有威望皮都有完整的等级图和徽章，有多少放多少。

**图片来源**：游戏内威望皮展示页截图

---

### 4.3 通用近战

**新增通用近战时**：

1. 在 `mythic.json` 的 `melee.items` 数组追加
2. 放入图片和模型：

| 文件 | 路径 | 说明 |
|------|------|------|
| `{id}.jpg` | `client/public/mythic/melee/` | 近战封面图 |
| `{id}-base.jpg` | 同上 | 基础款图片 |
| `{id}-{序号}.jpg` | 同上 | 进化/变体图（`{id}-1.jpg`、`{id}-2.jpg` ...） |
| `{id}-base.glb` | `client/public/mythic/melee/models/` | 3D 模型（如有） |

---

### 4.4 神话武器

**新增神话武器时**：

1. 在 `mythic.json` 的 `weapons.items` 数组追加
2. 放入图片：

| 文件 | 路径 | 说明 |
|------|------|------|
| `{id}.jpg` | `client/public/mythic/weapon/` | 武器封面图 |

---

## 5. 更新后的操作流程

每次更新资源后，需执行以下步骤使改动生效：

### 步骤一：修改数据

1. 编辑对应的 `server/data/*.json` 文件
2. 确保 `id` 递增、`image` 路径与实际文件名一致
3. 更新 `startDate` 和 `durationDays`（影响倒计时显示）

### 步骤二：放入图片

1. 将图片放入对应的 `client/public/` 子目录
2. 按本文档的命名规则命名
3. 如果有大图，同时放入对应的 `full/` 子目录

### 步骤三：构建前端

```bash
cd /opt/projects/ApexTool/client
npm run build
```

> 构建后 Nginx 会直接使用新的 `dist/` 文件，无需重启。

### 步骤四：重启后端（仅 JSON 改动时需要）

```bash
cd /opt/projects/ApexTool
pm2 restart apex-server
```

> 后端使用 `loadJSON()` 读取数据文件。修改 JSON 后需要重启后端进程才能生效。

### 步骤五：提交到 Git

```bash
cd /opt/projects/ApexTool
git add -A
git commit -m "update: 更新XX商店数据和图片"
git push
```

---

## 6. 图片规范

| 项目 | 要求 |
|------|------|
| **格式** | `.jpg`（统一使用 JPEG） |
| **缩略图尺寸** | 宽度 400-600px 即可，无需过大 |
| **大图尺寸** | 宽度 1200-1920px |
| **文件大小** | 缩略图 < 100KB，大图 < 500KB |
| **命名** | 纯数字编号，不要用中文或空格 |
| **质量** | 不要有明显的 UI 遮挡（如光标、弹窗） |

### 截图技巧

- 商店物品：在游戏内商店页面截图，裁掉周围的 UI 边框
- 通行证奖励：在通行证详情页逐个截图
- 传家宝/威望皮：在收藏品页面截图，或使用 EA 官方素材

---

## 7. 3D 模型规范

| 项目 | 要求 |
|------|------|
| **格式** | `.glb`（二进制 glTF，自包含） |
| **来源** | Sketchfab 下载 / Legion+ 提取后 Blender 导出 |
| **贴图** | 内嵌在 .glb 中，不要外部引用 |
| **压缩** | 使用 `gltf-transform webp` 压缩内嵌贴图为 WebP |
| **文件大小** | 压缩后建议 < 5MB，确保远程加载可接受 |
| **动画** | 如有多个动画轨道，用 `tools/bake_animations.py` 在 Blender 中合并为单轨道后再导出 |
| **贴图配置** | 如需从游戏文件提取并配贴图，使用 `tools/apex_texture_setup.py` Blender 插件 |

### 模型压缩命令

```bash
# 安装工具（仅首次）
npm install -g @gltf-transform/cli

# 压缩
gltf-transform webp input.glb output.glb
```

### 无模型时的处理

如果某个传家宝/近战暂时没有 3D 模型：
- JSON 中 `model` 字段设为 `""`
- 前端会自动回退为图片 Lightbox 展示
- 后续找到模型后补上文件，更新 JSON 路径即可

---

## 快速参考：各板块资源一览表

| 板块 | JSON 文件 | 图片目录 | 图片命名 | 大图目录 | 更新频率 |
|------|-----------|----------|----------|----------|----------|
| 通行证 | `battlepass.json` | `bp/` | `{等级}-{序号}.jpg` | `bp/full/` | 每赛段 |
| 双重击 | `double-strike-shop.json` | `shop/double-strike/` | `{id}.jpg` + `{id}-{子项}.jpg` | 无 | 每周 |
| 精选组合包 | `featured-bundle-shop.json` | `shop/featured-bundle/` | `{id}.jpg` | `full/` | ~2周 |
| 高级射击 | `premium-shop.json` | `shop/premium/` | `{id}.jpg` | `full/` | 每周 |
| 改色 | `recolor-shop.json` | `shop/recolor/` | `{id}.jpg` | `full/` | 每周 |
| 奇异 | `exotic-shop.json` | `shop/exotic/` | `{id}.jpg` | `full/` | ~2周 |
| 里程碑 | `milestone.json` | `shop/milestone/` | 见 3.6 节 | `rewards/full/` | 每活动 |
| 传家宝 | `mythic.json` | `mythic/heirloom/` | `{id}.jpg` | — | 不定期 |
| 威望皮 | `mythic.json` | `mythic/prestige/` | `{id}.jpg` + 变体 | — | 不定期 |
| 通用近战 | `mythic.json` | `mythic/melee/` | `{id}.jpg` + 变体 | — | 不定期 |
| 神话武器 | `mythic.json` | `mythic/weapon/` | `{id}.jpg` | — | 不定期 |
