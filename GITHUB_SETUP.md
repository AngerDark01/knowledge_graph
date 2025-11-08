# GitHub 上传和分支创建指南

## 已完成的操作

✅ 已配置远程仓库地址：`https://github.com/AngerDark01/knowledge_graph.git`

## 执行步骤

### 方法一：使用提供的脚本（推荐）

#### PowerShell 脚本
```powershell
.\push-to-github.ps1
```

#### Batch 脚本
```cmd
push-to-github.bat
```

脚本会自动：
1. 检查并提交未保存的更改
2. 创建新分支（默认名称：dev）
3. 推送到 GitHub

### 方法二：手动执行命令

如果 Git 已安装但不在 PATH 中，请先找到 Git 的安装路径，然后执行以下命令：

```bash
# 1. 进入项目目录
cd D:\AOBSIDIAN\knowledge-graph

# 2. 检查当前状态
git status

# 3. 如果有未提交的更改，先提交
git add .
git commit -m "Update project files"

# 4. 创建并切换到新分支（例如：dev）
git checkout -b dev

# 5. 推送到远程仓库
git push -u origin dev
```

### 方法三：如果 Git 未安装

1. 下载并安装 Git for Windows: https://git-scm.com/download/win
2. 安装完成后，重新打开终端
3. 执行方法一或方法二中的步骤

## 注意事项

- 首次推送可能需要 GitHub 身份验证
- 如果仓库是私有的，需要配置 SSH 密钥或使用 Personal Access Token
- 分支名称可以自定义，建议使用有意义的名称（如：dev, feature/xxx, develop 等）

## 验证

推送成功后，可以在以下地址查看：
https://github.com/AngerDark01/knowledge_graph

