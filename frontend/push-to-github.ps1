# PowerShell script to push to GitHub and create a new branch
# 上传到 GitHub 并创建新分支的脚本

Set-Location $PSScriptRoot

# 检查 git 是否可用
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到 git 命令。请确保 Git 已安装并添加到 PATH 环境变量中。" -ForegroundColor Red
    Write-Host "请访问 https://git-scm.com/download/win 下载并安装 Git" -ForegroundColor Yellow
    exit 1
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "检测到未提交的更改，正在添加所有文件..." -ForegroundColor Yellow
    git add .
    $commitMessage = Read-Host "请输入提交信息 (直接回车使用默认信息)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update project files"
    }
    git commit -m $commitMessage
}

# 获取新分支名称
$branchName = Read-Host "请输入新分支名称 (直接回车使用 'dev')"
if ([string]::IsNullOrWhiteSpace($branchName)) {
    $branchName = "dev"
}

Write-Host "正在创建并切换到新分支: $branchName" -ForegroundColor Green
git checkout -b $branchName

Write-Host "正在推送到远程仓库..." -ForegroundColor Green
git push -u origin $branchName

if ($LASTEXITCODE -eq 0) {
    Write-Host "成功！代码已推送到 GitHub 分支: $branchName" -ForegroundColor Green
    Write-Host "远程仓库地址: https://github.com/AngerDark01/knowledge_graph.git" -ForegroundColor Cyan
} else {
    Write-Host "推送失败，请检查网络连接和 GitHub 权限" -ForegroundColor Red
}

