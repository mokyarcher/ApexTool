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

## 2026-04-25

### 通行证页面 - 交互增强

- 倒计时组件：显示赛季剩余时间（天/时/分/秒）
- 奖励图片放大字体，增加 Tier 按钮悬浮提示（Tooltip）
- 悬浮动画优化：卡片缩放不产生抖动
- 点击奖励图片打开 Lightbox 大图查看

### 神话级页面 - 翻页动画

- `PagedRow` 组件新增滑动过渡动画（slide + fade）
- CSS `@keyframes pageSlide` 动画：0.35s 时长，60px 滑动距离
- 翻页指示器和箭头按钮统一使用 `goTo` 函数触发动画

### 商店页面 - 数据与 UI 更新

- 更新商店 JSON 文件，匹配实际图片资源数量：
  - `double-strike-shop.json`：5 → 9 件
  - `premium-shop.json`：5 → 8 件
  - `featured-bundle-shop.json`：5 → 6 件
  - `recolor-shop.json`：5 → 4 件
  - `exotic-shop.json`：12 → 18 件
- 奇异商店 18 件物品命名（根据图片内容）：护甲灭绝、闪电虫、火山裂隙 等
- 移除商店卡片文字描述（折扣卡片、改色卡片、奇异卡片），图片已包含完整信息

### Blender PBR 贴图自动配置插件

新增工具脚本 `tools/apex_texture_setup.py`，用于 Blender 中自动化配置 Apex Legends 武器皮肤的 PBR 材质。

**功能**：
- 扫描指定目录的 PBR 贴图文件（`_col`、`_nml`、`_gls`、`_spc`、`_ao`、`_ilm`、`_cav`）
- 按部件名称（如 `breachbeam_main`）自动分组
- 为每个部件创建完整的 Principled BSDF 材质节点树：
  - `_col` → Base Color（sRGB）
  - `_nml` → Normal Map → Normal（Non-Color）
  - `_gls` → Invert → Roughness（Non-Color，光泽度转粗糙度）
  - `_spc` → Specular IOR Level（Non-Color）
  - `_ao` + `_cav` → MixRGB Multiply 混合后叠加到 Base Color
  - `_ilm` → Emission Color + Emission Strength
- 自动修改场景色彩管理为 Standard（避免 Filmic 压暗颜色）

**调优参数**：
| 参数 | 值 | 说明 |
|------|---|------|
| AO Multiply Factor | 0.4 | 环境光遮蔽叠加强度（过高会发灰）|
| Cavity Multiply Factor | 0.2 | 腔体叠加强度 |
| Emission Strength | 5.0 | 自发光强度 |
| View Transform | Standard | 替代 Filmic 避免颜色失真 |

**使用方法**：
1. Blender → 编辑 → 偏好设置 → 插件 → 安装 → 选择 `apex_texture_setup.py`
2. 3D 视口右侧边栏 → Apex 标签页 → 选择贴图文件夹 → 运行

> **注意**：Blender 视口中的锯齿（狗牙）是视口抗锯齿限制，非贴图问题。可通过开启视口抗锯齿、使用渲染预览模式或执行最终渲染解决。

---

## 2026-04-26

### 3D 模型查看器 - 光照与动画优化

**光照改进**：
- 新增 `environment-image="neutral"` 环境光照（IBL），解决模型无光影的问题
- 新增 `shadow-softness="0.8"` 柔和阴影
- 调整 `shadow-intensity` 从 0.8 → 1.2
- 曝光值 `exposure` 最终调整为 1.3（1.8 过亮）

**动画播放逻辑**：
- 移除 `autoplay` 属性（默认无限循环）
- 加载完成后用 JS 手动控制动画：
  1. 获取 `el.availableAnimations` 所有动画名
  2. 逐个调用 `el.play({ repetitions: 1, animationName: name })` 播放全部动画
  3. 播放完毕后等 5 秒
  4. 使用 `requestAnimationFrame` + `easeInOut` 缓动函数平滑倒放
  5. 倒放结束后等 5 秒，再次正向播放
  6. 循环往复

**动画流程**：`正向播放 → 等5秒 → 平滑倒放 → 等5秒 → 正向播放 → ...`

### 多动画 GLB 模型兼容问题

**问题**：部分 Sketchfab 模型（如瓦基里传家宝）在 Blender 中可播放动画，但导出 GLB 后 `<model-viewer>` 无法播放。

**原因**：
- `<model-viewer>` 默认只播放第一个动画
- 有些模型的动画被拆分成多个轨道（如瓦基里的模型有 7-10 个动画轨道）
- 如果第一个轨道为空/无可见效果，模型看起来就是静态的
- gltf-viewer 的 "playAll" 可同时播放所有轨道，但 `<model-viewer>` 不支持

**解决方案 — Blender 动画烘焙合并**：

新增工具脚本 `tools/bake_animations.py`，在 Blender 中运行：
1. 自动查找骨架（Armature）
2. 收集所有动作（Actions）
3. 清除现有 NLA 轨道
4. 将所有动作添加到 NLA 轨道（blend_type = COMBINE）
5. 使用 `bpy.ops.nla.bake()` 烘焙为单一动作 `CombinedAction`
6. 清理旧轨道和旧动作

**使用方法**：
1. 在 Blender 中打开包含多动画的模型
2. 切换到 **Scripting** 工作区
3. 打开 `tools/bake_animations.py` → 点击 ▶ 运行
4. 重新导出 GLB（勾选动画 ✅、形态键 ✅、蒙皮 ✅）

> **重要**：不要在 Blender 的 Python 控制台（`>>>`）逐行粘贴脚本，会报缩进错误。必须在文本编辑器中打开整个文件后运行。

### 神话级页面 - 卡片尺寸调整

- 通用近战 & 神话武器卡片宽高比从 `5:3` 调整为 `10:7`，增加卡片高度约 17%

### Sketchfab 模型下载指南

- 推荐下载 **GLB** 格式（2k 贴图版本），单文件包含模型+贴图+动画
- 如果 GLB 为白模（无贴图），说明上传者未提供材质，需换模型源或自行配贴图
- 下载前检查 Sketchfab 预览页是否有动画时间轴（有 = 含动画，无 = 静态模型）

---

## 2025-04-27 · 全局 UI 直角化 + 商店翻页过渡动画

### 商店翻页过渡效果

- `ScrollRow` 组件新增 `direction` / `animKey` 状态，翻页时触发 `animate-page-slide` 动画
- 奇异商店独立翻页区域同步适配，左右翻页带方向感知滑动效果
- 页码指示器统一为红色发光圆点样式，箭头按钮样式与神话级页面一致

### 全站直角化

将所有页面的圆角元素统一改为直角（sharp corners），涉及：

**全局基础类 (`index.css`)**
- `.card` 移除 `rounded-xl`
- `.btn` 移除 `rounded-lg`
- `.chip` 移除 `rounded-md`

**导航栏 (`App.jsx`)**
- Logo 图标、神话级按钮、通行证/商店/金币/制造轮换导航链接 → 移除 `rounded-lg`

**通行证页 (`BattlePass.jsx`)**
- 顶部信息面板 → `!rounded-none`
- 档位按钮（免费/高级/终极/终极+）→ 移除 `rounded-lg`
- 奖励对比按钮 → 移除 `rounded-lg`
- 筛选按钮（全部/免费/高级…）→ 移除 `rounded-lg`
- 奖励卡片 → `!rounded-none`
- 悬浮提示图框 → 移除 `rounded-xl`

**神话级页 (`Mythic.jsx`)**
- Section 面板 → 移除 `rounded-3xl`
- 卡片 `CARD_SHELL` → `!rounded-none`
- 翻页箭头 → 移除 `rounded-xl`
- 标签胶囊（ITEMS / 碎片 / 代币）→ 移除 `rounded-full`
- 价格标签 → 移除 `rounded-full`
- 弹窗变体卡片 → 移除 `rounded-xl`
- 威望等级图标 → 移除 `rounded-lg`
- ESC 按键标签 → 移除 `rounded`
- Lightbox 图片 → 移除 `rounded-lg`

**商店页 (`Shop.jsx`)**
- Section 面板 → 移除 `rounded-3xl`
- 里程碑弹窗 → 移除 `rounded-xl`
- 双重打击详情弹窗 → 移除 `rounded-2xl`
- 所有弹窗内卡片、图标、按钮、价格栏 → 移除各级 `rounded-*`
- 翻页箭头 → 移除 `rounded-xl`
- 倒计时胶囊 → 移除 `rounded-full`
- Lightbox 图片 → 移除 `rounded-lg`

> 保留 `rounded-full` 的元素：页码圆点指示器、装饰竖条、背景光晕 blur 圆

### 其他 UI 调整

- 隐藏"制造轮换"导航项（功能暂未实装）
- 金币比例页数字字体改为金色 (`text-amber-400`)
- 神话级导航按钮添加 `Flame` 图标
- 神话级卡片悬停边框加粗为 `border-2`，颜色提亮为 `border-red-400`
- 修复卡片网格 padding 不足导致悬停上边框被裁切（`p-1.5` → `p-3`）

### 威望级皮肤数据补全

JSON 从 4 项扩充至 10 项，根据实际图片素材补全：

| # | 名称 | 角色 |
|---|------|------|
| 1 | APEX 星辰 | 地平线 |
| 2 | APEX 偶像 | 沃特森 |
| 3 | APEX 机甲 | 探路者 |
| 4 | APEX 激流 | 动力小子 |
| 5 | APEX 兽化人 | 罗芭 |
| 6 | APEX 噩梦 | 亡灵 |
| 7 | APEX 拦截者 | 瓦尔基里 |
| 8 | APEX 蔓延 | 侵蚀 |
| 9 | APEX 虚空转移 | 恶灵 |
| 10 | APEX 猎手 | 寻血猎犬 |

### 图片处理

- 使用 Pillow 脚本去除 `prestige/2.jpg` 右上角两个技能图标框（背景采样覆盖）

---

## 待办

- [ ] 补充所有商店板块的商品图片
- [ ] 补充神话级页面的商品图片
- [ ] 里程碑弹窗：奖励收集进度追踪
- [ ] 商店数据接入实际更新源（目前为静态 JSON）
