# 知识图谱编辑器

一个基于 Next.js、ReactFlow 和 Zustand 构建的交互式知识图谱编辑器。

## 功能特性

### 节点管理
- 添加、编辑、删除节点
- 节点标题和内容的双击编辑
- 节点验证（标题不能为空）
- 节点选择和多选

### 边管理
- 创建节点间的连接关系
- 边的标签、颜色和宽度自定义
- 边的删除功能
- 连接验证（防止自连接和重复连接）

### 画布功能
- 平移和缩放（10% 到 200%）
- 实时缩放比例指示器
- 键盘快捷键支持：
  - Ctrl+0: 重置视图
  - Ctrl+/-: 缩放
  - Delete/Backspace: 删除选中的节点或边
- 网格背景显示
- 小地图导航

### UI/UX
- 响应式布局
- 暗色/亮色主题支持
- 侧边栏节点/边编辑器
- 拖拽支持

## 技术栈

- **Next.js 15** - React 框架
- **ReactFlow** - 图可视化库
- **Zustand** - 状态管理
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式设计
- **shadcn/ui** - UI 组件库
- **Zod** - 数据验证

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── components/     # React 组件
│   └── graph/      # 图相关组件
├── stores/         # Zustand 状态管理
│   └── graph/      # 图相关状态
├── types/          # TypeScript 类型定义
│   └── graph/      # 图相关类型
├── utils/          # 工具函数
└── app/            # Next.js 页面
```

## 测试

运行状态管理测试：
```bash
# 在浏览器控制台中执行
import { runAllTests } from '@/utils/graph/test-utils';
runAllTests();
```
