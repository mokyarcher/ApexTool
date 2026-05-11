---
description: 更新 Apex 猎杀排行榜 HTML 数据并发布
---

# 更新 Apex 猎杀排行榜

用于把从 Apex Legends Status 保存下来的排行榜 HTML 导入本站数据文件，并重新发布服务。

## 1. 保存排行榜网页

在本地浏览器打开：

```txt
https://apexlegendsstatus.com/live-ranked-leaderboards/Battle_Royale/PC
```

确认页面正常显示排行榜后，按 `Ctrl + S` 保存网页。

建议保存文件名：

```txt
leaderboard.html
```

## 2. 上传 HTML 到服务器

把保存出来的 HTML 上传到项目根目录：

```bash
scp /本地路径/leaderboard.html root@你的服务器IP:/opt/projects/ApexTool/leaderboard.html
```

如果浏览器保存了完整网页资源目录，也可以一起上传，但导入脚本只需要 `leaderboard.html`。

## 3. 导入排行榜数据

在服务器项目根目录运行：

```bash
node server/scripts/import-ranked-leaderboard.js leaderboard.html
```

导入成功后会更新：

```txt
server/data/ranked-leaderboard.json
```

页面展示的「最后更新时间」来自导入时刻。

## 4. 构建前端

// turbo
```bash
npm --prefix client run build
```

## 5. 提交并重启服务

```bash
git add -A && git commit -m "chore: update ranked leaderboard data" && git push origin main && pm2 restart apex-server --update-env
```

## 6. 检查页面

打开本站：

```txt
/leaderboard
```

确认：

- 排行榜正常展示
- 玩家数量正确
- 最后更新时间已更新
