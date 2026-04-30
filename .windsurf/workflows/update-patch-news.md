---
description: Apex 官方新闻与补丁公告更新工作流
---
# Apex 官方新闻 / 补丁公告更新工作流

适用场景：

- EA 官方发布了新的 Apex Legends 新闻、活动公告、反作弊公告、路线图或补丁说明
- 需要快速同步到站点的“更新公告”页面
- 目标数据文件：`server/data/patch-notes.json`

## 目标

把 EA 官方新增内容快速同步到 ApexTool，并保证：

- 数据结构正确
- 前端页面可展示
- 构建通过
- 开发日志可追踪

## 1. 先核实 EA 官方是否真的更新

优先检查以下页面：

- `https://www.ea.com/games/apex-legends/news`
- 重点关注是否出现新的：
  - Patch Notes
  - Midseason Designer's Notes
  - Event / Collection Event / Milestone Event
  - Anti-Cheat Update
  - Road Ahead / 年度路线图
  - Anniversary / 联动活动 / 系统公告

执行原则：

- 先确认发布日期
- 再确认标题是否是新条目
- 不要只凭社媒二手消息更新

## 2. 判断应归类为哪种公告

将 EA 官方内容归入以下类型之一：

- **赛季补丁 / 中期补丁**
  - 典型特征：有传奇改动、武器改动、系统改动
  - 数据结构可使用：
    - `legendChanges`
    - `weaponChanges`
    - `otherChanges`

- **活动公告 / 联动公告 / 路线图 / 反作弊公告**
  - 典型特征：没有大量平衡数值，更多是玩法、活动、规则、未来计划
  - 数据结构通常使用：
    - `otherChanges`

## 3. 更新数据文件

目标文件：

- `server/data/patch-notes.json`

每个新条目的基础结构如下：

```json
{
  "id": "unique-id",
  "title": "中文标题",
  "titleEN": "EA 官方英文标题",
  "date": "YYYY-MM-DD",
  "season": "S28 Breach / 活动公告 / 联动活动 / 官方公告 / 周年活动 / 路线图",
  "sourceUrl": "EA 官方原文链接",
  "summary": "中文一句话摘要",
  "otherChanges": [
    "要点 1",
    "要点 2"
  ]
}
```

如果是补丁类条目，可补充：

```json
"legendChanges": [
  {
    "legend": "恶灵",
    "legendEN": "Wraith",
    "changes": ["改动1", "改动2"]
  }
],
"weaponChanges": [
  {
    "weapon": "R-301 卡宾枪",
    "weaponEN": "R-301",
    "changes": ["改动1", "改动2"]
  }
]
```

更新规则：

- 按日期从新到旧排序
- 不要删除旧条目，除非确认录入错误
- `id` 必须唯一，建议格式：
  - 补丁：`28.2`
  - 新闻：`topic-YYYY-MM-DD`
- 中文摘要要简洁，适合首页列表阅读
- `otherChanges` 每条尽量一句话，便于前端排版

## 4. 内容整理原则

翻译和整理时遵守以下规则：

- 优先忠实表达 EA 原意，不乱补设定
- 不必全文照搬，保留用户最关心的信息
- 数值改动优先保留具体数字
- 活动公告优先保留：
  - 活动名
  - 时间范围
  - 新模式 / 新机制
  - 奖励 / 商店 / 联动物品
- 路线图优先保留：
  - 新传奇
  - 重做计划
  - 地图更新
  - 匹配 / 反作弊 / 服务器 / QoL 方向
- 反作弊公告优先保留：
  - 封禁对象
  - 检测方向
  - 惩罚方式
  - 官方态度

## 5. 验证 JSON 正确性

更新完 `patch-notes.json` 后，必须先检查 JSON 是否合法。

可执行：

```bash
node -e "JSON.parse(require('fs').readFileSync('server/data/patch-notes.json','utf8')); console.log('patch-notes.json OK')"
```

如果报错：

- 优先检查逗号
- 检查数组 `[]` 和对象 `{}` 是否闭合
- 检查字符串引号是否完整

## 6. 构建验证

进入客户端目录后执行：

```bash
npm run build
```

验证目标：

- 构建成功
- `PatchNotes` 页面相关产物正常生成
- 没有因为数据或前端结构导致报错

## 7. 必要时更新文案说明

如果“更新公告”页已经不仅仅是补丁说明，而是包含新闻/活动/路线图，建议同步检查页面说明文字是否准确。

重点文件：

- `client/src/pages/PatchNotes.jsx`

可考虑把说明从：

- `数据来源：EA 官方补丁说明，定期同步更新`

调整为更准确的：

- `数据来源：EA 官方新闻与补丁公告，定期同步更新`

如果当前页面文案已经足够接受，也可以暂时不改。

## 8. 更新开发日志

完成数据更新后，在：

- `doc/dev-log.md`

追加一条简要记录，建议包含：

- 日期
- 新增同步了哪些 EA 官方公告
- 是否包含活动 / 补丁 / 路线图 / 反作弊信息

建议模板：

```md
## YYYY-MM-DD · 更新公告数据同步

- 同步 EA 官方最新新闻与补丁公告
- 新增条目：Aftershock 活动、反作弊进展、高达联动、年度路线图、七周年庆典
- 更新公告页现已同时支持补丁说明与新闻类公告展示
```

## 9. 提交前检查

提交前执行：

```bash
git status --short
```

确认本次只包含预期文件，例如：

- `server/data/patch-notes.json`
- `doc/dev-log.md`
- 如有必要：`client/src/pages/PatchNotes.jsx`

如果出现无关文件，不要顺手带上。

## 10. 提交与推送

建议提交信息：

```bash
git commit -m "content: sync apex patch notes and official news"
```

然后推送：

```bash
git push
```

## 11. 快速执行版

后续如果你直接说：

- “按补丁公告工作流更新一下”
- “走更新公告工作流”
- “同步 EA 官方新闻”

就按下面的顺序执行：

1. 查 EA 官方新闻页
2. 确认新条目
3. 更新 `server/data/patch-notes.json`
4. 校验 JSON
5. 构建验证
6. 更新 `doc/dev-log.md`
7. 提交 / 推送（如果你要求）
