@echo off
REM Batch script to push to GitHub and create a new branch
REM 上传到 GitHub 并创建新分支的脚本

cd /d "%~dp0"

REM 检查 git 是否可用
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 git 命令。请确保 Git 已安装并添加到 PATH 环境变量中。
    echo 请访问 https://git-scm.com/download/win 下载并安装 Git
    pause
    exit /b 1
)

REM 检查是否有未提交的更改
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo 检测到未提交的更改，正在添加所有文件...
    git add .
    set /p commitMessage="请输入提交信息 (直接回车使用默认信息): "
    if "!commitMessage!"=="" set commitMessage=Update project files
    git commit -m "!commitMessage!"
)

REM 获取新分支名称
set /p branchName="请输入新分支名称 (直接回车使用 'dev'): "
if "!branchName!"=="" set branchName=dev

echo 正在创建并切换到新分支: %branchName%
git checkout -b %branchName%

echo 正在推送到远程仓库...
git push -u origin %branchName%

if %errorlevel% equ 0 (
    echo.
    echo 成功！代码已推送到 GitHub 分支: %branchName%
    echo 远程仓库地址: https://github.com/AngerDark01/knowledge_graph.git
) else (
    echo.
    echo 推送失败，请检查网络连接和 GitHub 权限
)

pause

