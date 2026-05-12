# Windows 猎杀排行榜更新工具

这个工具用于在 Windows 上打开 Apex Legends Status 排行榜页面，手动通过 Cloudflare 验证后，自动保存 HTML、上传服务器并触发本站排行榜更新。

## 准备环境

Windows 电脑需要安装：

- Node.js 18 或更高版本
- Windows OpenSSH Client（需要 `scp` 和 `ssh` 命令）

检查命令：

```powershell
node -v
npm -v
scp
ssh
```

## 首次配置

复制配置模板：

```powershell
Copy-Item config.example.json config.json
```

编辑 `config.json`：

```json
{
  "url": "https://apexlegendsstatus.com/live-ranked-leaderboards/Battle_Royale/PC",
  "localHtml": "leaderboard.html",
  "serverUser": "root",
  "serverHost": "YOUR_SERVER_IP",
  "serverPort": 22,
  "remoteProjectPath": "/opt/projects/ApexTool",
  "remoteHtmlPath": "/opt/projects/ApexTool/leaderboard.html",
  "autoPublish": true
}
```

需要修改：

- `serverHost`：你的服务器 IP
- `serverUser`：一般是 `root`
- `serverPort`：SSH 端口，默认 `22`

## 使用方式

在 PowerShell 里进入本目录，然后运行：

```powershell
.\update-ranked-leaderboard.ps1
```

流程：

1. 第一次会自动安装 Playwright 和 Chromium
2. 自动打开浏览器到排行榜页面
3. 如果出现 Cloudflare 验证，你手动点通过
4. 等排行榜表格完全显示后，回到 PowerShell 按回车
5. 工具自动保存 `leaderboard.html`
6. 自动上传到服务器
7. 自动在服务器导入数据、构建、提交、推送、重启服务

## 常见问题

### PowerShell 不允许运行脚本

临时允许当前窗口运行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

然后再执行：

```powershell
.\update-ranked-leaderboard.ps1
```

### SSH/SCP 需要密码

正常输入服务器密码即可。

如果想免密码，需要给服务器配置 SSH key。

### 不想自动发布

把 `config.json` 里的：

```json
"autoPublish": false
```

这样脚本只保存并上传 HTML，不会远程执行导入和发布。
