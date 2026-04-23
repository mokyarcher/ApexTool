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

---

## 待办

- [ ] 补充所有商店板块的商品图片
- [ ] 里程碑弹窗：奖励收集进度追踪
- [ ] 商店数据接入实际更新源（目前为静态 JSON）
