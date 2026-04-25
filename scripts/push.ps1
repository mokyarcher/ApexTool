# 用法：
#   .\scripts\push.ps1 "你的提交信息"
#   .\scripts\push.ps1                   # 不写信息则使用默认信息

param(
    [string]$Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Set-Location $PSScriptRoot\..

Write-Host "=== Git 提交并推送 ===" -ForegroundColor Cyan

# 1. 暂存所有改动
git add -A
Write-Host "[1/4] 已暂存所有改动" -ForegroundColor Green

# 2. 检查是否有改动需要提交
$status = git status --porcelain
if (-not $status) {
    Write-Host "没有需要提交的改动，退出" -ForegroundColor Yellow
    exit 0
}

# 3. 提交
git commit -m $Message
Write-Host "[2/4] 已提交: $Message" -ForegroundColor Green

# 4. 拉取远程（rebase 避免多余 merge commit）
git pull --rebase
Write-Host "[3/4] 已同步远程" -ForegroundColor Green

# 5. 推送
git push
Write-Host "[4/4] 已推送到远程" -ForegroundColor Green

Write-Host "`n=== 完成 ===" -ForegroundColor Cyan
