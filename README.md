# 知识图谱编辑器

一个前后端分离的知识图谱编辑器项目，基于 Next.js 和 Flask 构建。

## 项目结构

```
knowledge-graph/
├── frontend/           # 前端 Next.js 应用
│   ├── app/           # Next.js App Router
│   ├── components/    # React 组件
│   ├── stores/        # Zustand 状态管理
│   ├── services/      # API 服务
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   └── public/        # 静态资源
├── backend/            # 后端 Flask API
│   ├── app/           # Flask 应用入口
│   ├── controllers/   # API 控制器
│   ├── models/        # 数据模型
│   ├── services/      # 业务逻辑服务
│   ├── extensions/    # 扩展组件
│   ├── configs/       # 配置文件
│   └── migrations/    # 数据库迁移
└── docker-compose.yml # 容器化部署配置
```

## 快速开始

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 后端开发

```bash
cd backend
# 安装 Python 依赖
pip install -r requirements.txt
# 启动后端服务
python app.py
```

后端 API 将运行在 [http://localhost:5001](http://localhost:5001)

### 使用 Docker Compose

```bash
docker-compose up -d
```

## 技术栈

- **前端**: Next.js 16, React, TypeScript, ReactFlow, Zustand
- **后端**: Python, Flask, SQLAlchemy, PostgreSQL
- **其他**: Redis, Docker, Docker Compose