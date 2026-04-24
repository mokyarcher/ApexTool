# ApexTool 开发记录

## 2026-04-23

### 商店页面 - 新增特殊售卖板块

新增 4 个商店板块，数据、路由、前端 UI 全部完成：

| 板块 | 数据文件 | 路由 | 布局 |
|------|---------|------|------|
| 双重击商店 | `double-strike-shop.json` | `/api/shop/double-strike` | 横向滚动卡片 |
| 精选组合包商店 | `featured-bundle-shop.json` | `/api/shop/featured-bundle` | 横向滚动卡片 |
| 改色 | `recolor-shop.json` | `/api/shop/recolor` | 5列分页网格 |
| 奇异商店 | `exotic-shop.json` | `/api/shop/exotic` | 3×2横屏分页网格 |

**通用组件**：
- `ScrollRow` — 水平滚动容器，悬浮显示左/右箭头按钮
- `DiscountShopCard` — 可复用的折扣商品卡片
- `ShopSectionHeader` — 标题 + 倒计时（紧贴标题右侧）

**图片资源目录**：
- `client/public/shop/double-strike/` — 1.jpg ~ 5.jpg
- `client/public/shop/featured-bundle/` — 1.jpg ~ 5.jpg
- `client/public/shop/recolor/` — 1.jpg ~ 5.jpg
- `client/public/shop/exotic/` — 1.jpg ~ 12.jpg

### 商店页面 - 里程碑收集弹窗优化

- 左侧面板：悬浮奖励时显示大图预览，不悬浮时显示活动详情
- 弹窗尺寸：宽度 1100px，高度 90vh，左面板 380px
- 奖励网格：8列×2行，列优先排列（上下上下）
- 终极奖励（威望皮）：3列×2行聚焦展示，底部 100px 信息框
- 分页：底部翻页控件 + 页码指示条
- 新增 mythic 稀有度样式

### 通行证页面

- `premium` 字段改为 `tier` 字段，支持 free / premium / ultimate / ultimate_plus 四档
- 新增筛选按钮：全部、免费、高级、终极、终极+
- 点击奖励图片可查看大图（Lightbox）

## 2026-04-24

### 商店页面 - 卡片交互优化

- 所有商店卡片新增悬浮缩放效果（`hover:scale-[1.03]` + `hover:-translate-y-1`）
- ScrollRow 容器增加内边距（`py-3 px-3`）防止缩放时边缘裁切
- 所有商店卡片点击查看大图（Lightbox），调用 `/full/` 目录下的大图资源

**大图资源目录**（每个商店目录下的 `full/` 子目录）：
- `client/public/shop/double-strike/full/`
- `client/public/shop/featured-bundle/full/`
- `client/public/shop/premium/full/`
- `client/public/shop/recolor/full/`
- `client/public/shop/exotic/full/`

### 商店页面 - 双重击商店详情弹窗

点击双重击卡片打开捆绑包详情弹窗：
- 左侧：标题（4xl 加粗）+ 渐变分割线 + 子物品图标（按稀有度区分边框颜色：金=传说/紫=史诗）+ 价格栏 + 操作按钮
- 右侧：悬浮子物品图标时大图实时切换
- 弹窗尺寸：最大宽度 1440px，高度 90vh

**双重击子物品图片命名规则**（`client/public/shop/double-strike/`）：
| 文件 | 用途 |
|------|------|
| `1.jpg` | 捆绑包1外部卡片封面 |
| `1-1.jpg` | 捆绑包1 子物品1（如皮肤） |
| `1-2.jpg` | 捆绑包1 子物品2（如武器皮肤） |
| `1-3.jpg` | 捆绑包1 子物品3（如边框） |
| 以此类推 `2-1.jpg` `2-2.jpg` ... |

### 传家宝 3D 模型查看器

点击传家宝卡片打开全屏 3D 查看器弹窗：
- 使用 `@google/model-viewer` Web Component
- 支持拖拽旋转、滚轮缩放、自动旋转
- 左上角显示物品名称 + 传奇 + 价格
- 底部提示「拖拽旋转 · 滚轮缩放」
- 无模型文件时回退到大图 Lightbox

**模型文件目录**：`client/public/mythic/heirloom/models/`（1.glb ~ 18.glb）

**批量下载脚本**：`scripts/download-heirloom-models.mjs`
- 用法：`node scripts/download-heirloom-models.mjs YOUR_SKETCHFAB_TOKEN`
- 通过 Sketchfab API 批量搜索下载 glTF 格式模型
- 下载后需 Blender 导入 glTF → 确认贴图 → 导出为 .glb

### 新增神话级页面

新增 `/mythic` 路由，导航栏红色高亮「神话级」入口。

**数据文件**：`server/data/mythic.json`
**API 路由**：`GET /api/shop/mythic`

页面包含 5 个板块：

| 板块 | 卡片类型 | 每页数量 | 特殊功能 |
|------|---------|---------|---------|
| 传家宝 | 竖版卡片 (4:5) | 5 | 分页指示条 + 翻页 |
| 威望级皮肤 | 竖版大卡 (3:4) + 右侧徽章 | 3 | 分页 |
| APEX 神器 | 基础神器 + 进化套装横排 | — | 基础可购买，套装显示拥有进度 |
| 通用近战 | 横版卡片 (5:3) | 3 | 分页，每件费用 + 拥有进度 |
| 神话武器 | 横版卡片 (5:3) | 3 | 分页，每件费用 + 拥有进度 |

**图片资源路径**：

#### 传家宝 — `client/public/mythic/heirloom/`
| 文件 | 对应物品 |
|------|---------|
| `1.jpg` | 贝尔瓦拳击手套（探路者） |
| `2.jpg` | 寒冬之祸（寻血猎犬） |
| `3.jpg` | 绿宝石之刃（班加罗尔） |
| `4.jpg` | 动力小子原型（动力小子） |
| `5.jpg` | 杜鲁米之刃（密客） |
| `6.jpg` | 狂风战斧（直布罗陀） |
| `7.jpg` | 死神镰刀（亡灵） |
| `8.jpg` | 电击棍（命脉） |

#### 威望级皮肤 — `client/public/mythic/prestige/`
| 文件 | 对应物品 |
|------|---------|
| `1.jpg` | APEX 星辰（地平线）主图 |
| `1-badge1.jpg` / `1-badge2.jpg` | 徽章图标 |
| `2.jpg` | APEX 战士（疯玛吉）主图 |
| `2-badge1.jpg` / `2-badge2.jpg` | 徽章图标 |
| `3.jpg` | APEX 偶像（沃特森）主图 |
| `3-badge1.jpg` / `3-badge2.jpg` | 徽章图标 |
| `4.jpg` | APEX 猎手（寻血猎犬）主图 |
| `4-badge1.jpg` / `4-badge2.jpg` | 徽章图标 |

#### APEX 神器 — `client/public/mythic/artifact/`
| 文件 | 对应物品 |
|------|---------|
| `1.jpg` | 钴蓝七首（基础神器） |
| `1a.jpg` | 钴蓝七首套装（进化1） |
| `1b.jpg` | 融化七首套装（进化2） |
| `2.jpg` | 暗影之刃（基础神器） |
| `2a.jpg` | 暗影之刃套装（进化1） |
| `2b.jpg` | 烈焰之刃套装（进化2） |

#### 通用近战 — `client/public/mythic/melee/`
| 文件 | 对应物品 |
|------|---------|
| `1.jpg` | 金属女妖套装 |
| `2.jpg` | 绝命二重奏套装 |
| `3.jpg` | 满员全垒打套装 |
| `4.jpg` | 战术利刃套装 |

#### 神话武器 — `client/public/mythic/weapon/`
| 文件 | 对应物品 |
|------|---------|
| `1.jpg` | 激流捕食者 |
| `2.jpg` | 猛禽 |
| `3.jpg` | 路怒 |

---

## 待办

- [ ] 补充所有商店板块的商品图片
- [ ] 补充神话级页面的商品图片
- [ ] 里程碑弹窗：奖励收集进度追踪
- [ ] 商店数据接入实际更新源（目前为静态 JSON）
