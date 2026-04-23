# 战斗通行证奖励图片目录

把奖励图片丢进 `client/public/bp/` 下,然后在 `server/data/battlepass.json` 对应条目里加 `image` 字段:

```json
{
  "level": 50,
  "premium": true,
  "type": "skin",
  "name": "Alter: Dimensional Queen",
  "nameCN": "艾特:次元女王",
  "rarity": "legendary",
  "reactive": true,
  "image": "/bp/alter-dimensional-queen.png"
}
```

前端会自动把 `image` 当作 `<img src>` 显示,没填就回退到默认图标。

## 建议规格

- **尺寸**:正方形 256×256 或 512×512(卡片里是等比缩放)
- **格式**:PNG(支持透明)或 WebP 最佳,SVG 也可
- **命名**:小写 + 短横线,例如 `alter-dimensional-queen.png`

## 已内置 3 个通用占位 SVG

- `pack.svg` — Apex 包
- `coins.svg` — Apex 金币
- `metals.svg` — 制造材料

你可以把这 3 个换成自己截图的官方图标,前端无需改动。
