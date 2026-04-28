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

### 导航栏顺序调整

- 统一用 `navItems` 数组渲染所有导航项，移除神话级单独硬编码的 NavLink
- 新顺序：通行证 → 商店 → 神话级 → 金币比例
- 神话级保留红色特殊样式（通过 `mythic: true` 标志区分）

## 2026-04-27

### 传家宝 3D 模型加载体验优化

- `Mythic.jsx` 中的 `<model-viewer>` 改为直接引入 `@google/model-viewer/dist/model-viewer.min.js`，避免生产构建中自定义元素注册被 tree-shaking 影响
- 3D 查看器新增模型加载状态反馈：
  - 下载阶段显示实时进度条
  - 进度长时间停滞时自动切换为「处理中…」状态，避免卡在固定百分比造成误导
  - 加载完成后再显示「拖拽旋转 · 滚轮缩放」提示

### 传家宝模型体积优化

- 对 `client/public/mythic/heirloom/models/` 下的 `.glb` 文件进行了贴图压缩优化
- 使用 `gltf-transform webp` 将模型内嵌贴图转换为 WebP，同时保持 `.glb` 自包含结构，避免拆分成外部 `.bin` / `.webp` 资源
- 典型压缩结果：

| 模型 | 压缩前 | 压缩后 | 缩减比例 |
|------|--------|--------|----------|
| `1.glb` | 10.2 MB | 3.1 MB | 70% |
| `2.glb` | 13.1 MB | 4.0 MB | 69% |
| `3.glb` | 1.5 MB | 172 KB | 89% |
| `4.glb` | 3.2 MB | 1.1 MB | 66% |
| `5.glb` | 4.5 MB | 1.5 MB | 67% |
| `6.glb` | 10.8 MB | 2.2 MB | 80% |

- 压缩后远程访问下模型加载时间显著下降，较大模型从十秒级等待缩短到数秒内可用

### 站点 HTTPS 配置

- 为 `apex.sharex.my` 申请并启用了 Let's Encrypt 证书
- Nginx 已配置 `80 -> 443` 自动跳转
- 证书部署路径：
  - `/etc/letsencrypt/live/apex.sharex.my/fullchain.pem`
  - `/etc/letsencrypt/live/apex.sharex.my/privkey.pem`
- 已验证 `https://apex.sharex.my` 可正常访问
- `certbot renew --dry-run` 已通过，自动续期可用

---

## 2025-04-28 UI 视觉增强 & 背景优化

### 全局背景
- 移除 body 全局红色/橙色径向渐变光晕，改为纯色 `#0B0B0D` 干净深色背景
- 新增全站 **粒子连线（Canvas Nest）** 动态背景效果（`ParticleNest.jsx`）
  - 90 个暗红色粒子随机漂浮，鼠标靠近时粒子被吸引到轨道形成多面体网络
  - 粒子间互斥力防止聚团，脱离鼠标后随机方向弹散
  - 缓慢切线旋转，空闲时粒子形成独立短线段

### 通行证页面
- 顶部信息区增加径向渐变叠加（红→紫）提升视觉层次
- 奖励卡片全面改版：
  - 按稀有度（普通/稀有/史诗/传说/神话）显示不同色调渐变背景
  - 悬停发光边框颜色匹配稀有度
  - 光泽扫过（Shine Sweep）动画效果
  - 图片悬停放大 + 提亮
  - 底部信息栏改为深色半透明底色
- 通行证等级按钮悬浮提示改为向上弹出

### 神话级页面
- `MythicSection` 背景从径向渐变光晕改为：顶部红色发光线 + 内阴影暗角 + 斜线扫描纹理

### 商店页面
- `ShopSection` 样式统一为与 MythicSection 一致（顶部红线 + 内阴影 + 斜线纹理）
- 移除商店页独立的背景光晕渐变
- 卡片悬停边框加粗为 `border-2`，四边一致亮红色
- 修复各 ScrollRow / Exotic 网格 padding 不足导致悬停顶部边框被裁切的问题

---

## 2026-04-29 · 战绩查询系统

### 新增玩家战绩查询页面

新增 `/stats` 路由，导航栏「战绩查询」入口。

**后端** — `server/routes/player.js`
- `GET /api/player?uid=xxx&platform=PC` — 通过 UID 精确查询玩家数据
- `GET /api/player/lookup?name=xxx&platform=PC` — 深度搜索玩家名，返回所有匹配结果

**深度搜索实现**：
1. 先请求 `apexlegendsstatus.com/profile/search/{name}` 获取 cookies 和 CSRF token
2. 用 `platform=search` 调用内部 API `/core/interface` 触发全平台深度搜索
3. 解析返回 HTML 中的玩家卡片，提取 UID、名字、平台、等级、转生、角色、排位分、段位图标
4. 结果缓存 5 分钟

### 前端功能

**搜索**：
- 输入 UID（纯数字）直接精确查询
- 输入玩家名触发深度搜索
- 多个匹配时展示选择卡片（显示等级、转生、平台、角色、排位分、段位图标）
- 单个匹配时自动加载详情
- 选择后可点击「返回搜索结果」重新选择其他玩家

**玩家详情**：
- 头像（加载失败显示 Apex logo fallback）
- 等级、声望、平台标签
- 大逃杀 / 竞技场双排位卡片（段位图标 + 排位分）
- 总战绩统计面板
- 传奇角色数据（可展开，显示追踪器、皮肤、边框、姿态、开场）
- 在线状态实时显示（游戏中 / 在线 / 离线）
- 升级进度条

**查询记录**：
- 成功查询自动保存到 localStorage（key: `apex_search_history`）
- 以 `name:uid` 为唯一标识，最多保存 10 条
- 显示为可点击标签，悬停显示 UID + 等级 + 平台
- 支持单条删除和清空全部

**保存玩家**：
- 可保存一个玩家为「快速加载」（key: `apex_saved_uid`）
- 搜索栏下方一键加载已保存玩家

### 全面汉化

- **段位名**：Rookie→新手, Bronze→青铜, Silver→白银, Gold→黄金, Platinum→铂金, Diamond→钻石, Master→大师, Apex Predator→猎杀者
- **数据标签**：BR Kills→击杀, BR Damage→伤害, BR Wins→胜场, 各赛季自动翻译（BR Season X kills→SX 击杀）
- **传奇角色**：全部 27 个角色中文名（Wraith→恶灵, Alter→变幻, Sparrow→琉雀 等）
- **排名**：Top X% → 前 X%，# → 第 X 名
- **RP** → 排位分
- **装备信息**：皮肤、边框、姿态、开场

### 资源文件

- `client/public/apex-logo.png` — 默认头像 fallback 图标（头像和传奇角色图加载失败时使用）

---

## 待办

- [ ] 补充所有商店板块的商品图片
- [ ] 补充神话级页面的商品图片
- [ ] 里程碑弹窗：奖励收集进度追踪
- [ ] 商店数据接入实际更新源（目前为静态 JSON）
- [x] 玩家战绩查询（UID / 名字深度搜索 / 多匹配选择）
- [x] 战绩页全面汉化（段位、数据、角色名）
- [x] 查询记录持久化
- [ ] 战绩查询 - 排位分历史曲线图（Match History / RP 趋势折线图）
- [ ] 战绩查询 - 赛季进度对比（Progression，按赛季 split 对比排位变化）
- [ ] 战绩查询 - 统计图表（各传奇游戏时长/使用率、排位/等级变化、胜率/选取率）
