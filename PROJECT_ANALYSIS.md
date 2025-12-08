# 知识图谱项目全面分析报告

## 项目概述

这是一个基于 Next.js、ReactFlow 和 Zustand 构建的交互式知识图谱编辑器，支持节点嵌套、群组管理、跨群关系、自动布局等功能。

## 核心组件架构

### 1. 状态管理 (Zustand)
- **stores/graph**: 图数据状态管理
  - canvasViewSlice: 视图状态管理
  - edgesSlice: 边操作管理
  - historySlice: 历史记录管理
  - nodes/: 节点操作管理
    - basicOperations: 基础节点操作
    - constraintOperations: 位置约束操作
    - conversionOperations: 节点转换操作
    - groupBoundaryOperations: 群组边界操作
    - groupOperations: 群组操作

### 2. 数据模型 (TypeScript)
- **types/graph/models.ts**: 定义核心数据结构
  - Node: 普通节点，支持标题、内容、标签、属性等
  - Group: 群组节点，支持嵌套、边界约束
  - Edge: 边关系，支持跨群关系、权重、强度、方向性等

## 核心功能特性

### 1. 节点管理
- **NoteNode**: 支持展开/收缩、编辑、转换为群组
- **GroupNode**: 支持嵌套、节点内嵌、标题编辑
- **转换功能**: 节点与群组之间相互转换，支持数据保存

### 2. 嵌套关系
- 支持多层群组嵌套（最多5层）
- 循环嵌套检测
- 嵌套深度限制
- 相对位置计算

### 3. 关系管理
- **CustomEdge**: 普通边关系
- **CrossGroupEdge**: 跨群关系，虚线样式
- 支持权重、强度、方向性、标签等属性

### 4. 编辑功能
- **NodeEditor**: 节点属性编辑
- **EdgeEditor**: 边属性编辑
- **StructuredAttributeEditor**: 结构化属性编辑
- 内容支持 Markdown 渲染

### 5. 布局系统
- **LayoutManager**: 布局管理器
- **ELKLayoutStrategy**: ELK自动布局算法
- **ELKGroupLayoutStrategy**: 群组内部布局
- **EdgeOptimizer**: 边连接点优化

### 6. 控制功能
- **LayoutControl**: 布局控制
- **EdgeFilterControl**: 边过滤控制
- **HistoryControl**: 撤销/重做
- **ZoomIndicator**: 缩放指示器

## 数据结构分析

### 1. 节点数据结构
```
Node {
  id: string,                    // 唯一标识
  type: "node",                  // 节点类型
  position: { x, y },            // 位置
  title: string,                 // 标题
  content: string,               // 内容
  width, height: number,         // 尺寸
  isExpanded: boolean,           // 展开状态
  customExpandedSize: { w, h },  // 自定义展开尺寸
  groupId: string,               // 所属群组ID
  attributes: Record,            // 结构化属性
  tags: string[],                // 标签数组
  summary: string,               // 摘要
  isEditing: boolean,            // 编辑状态
  validationError: string,       // 验证错误
  createdAt, updatedAt: Date     // 时间戳
}

Group {
  id: string,                    // 唯一标识
  type: "group",                 // 群组类型
  position: { x, y },            // 位置
  title: string,                 // 标题
  content: string,               // 内容
  collapsed: boolean,            // 折叠状态
  nodeIds: string[],             // 子节点ID列表
  groupId: string,               // 父群组ID（嵌套）
  boundary: { minX, minY, maxX, maxY }, // 边界
  width, height: number,         // 尺寸
  createdAt, updatedAt: Date     // 时间戳
}
```

### 2. 边数据结构
```
Edge {
  id: string,                    // 唯一标识
  source, target: string,        // 源目标节点
  sourceHandle, targetHandle: string, // 连接点
  label: string,                 // 边标签
  data: {
    isCrossGroup: boolean,       // 是否跨群
    sourceGroupId, targetGroupId: string, // 群组ID
    weight: number,              // 权重
    strength: number,            // 强度
    direction: enum,             // 方向性
    color, strokeDasharray: string, // 样式
    strokeWidth: number,         // 线宽
    customProperties: Record     // 自定义属性
  },
  createdAt, updatedAt: Date     // 时间戳
}
```

## 核心算法与工具

### 1. 嵌套处理
- **nestingHelpers.ts**: 嵌套关系检测、深度计算、祖先路径
- **recursiveMoveHelpers.ts**: 递归移动、绝对位置计算

### 2. 几何计算
- **GeometryUtils.ts**: 碰撞检测、边界计算、距离计算
- **nodePositionConstraints.ts**: 位置约束
- **groupBoundaryManager.ts**: 群组边界管理

### 3. 布局算法
- **ELKGraphConverter.ts**: ELK图格式转换
- **ELKConfigBuilder.ts**: ELK配置构建
- **NestingTreeBuilder.ts**: 嵌套树构建
- **EdgeOptimizer.ts**: 边优化

## 项目特点

### 1. 技术栈
- **前端**: Next.js 16 + ReactFlow + Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **数据验证**: Zod
- **类型安全**: TypeScript

### 2. 架构特色
- 组件化设计，职责分离
- 状态管理集中化，操作原子化
- 类型定义完整，验证机制健全
- 支持复杂嵌套关系和群组管理

### 3. 数据持久化需求
- **当前状态**: 数据仅在客户端内存中，刷新即丢失
- **需要实现**: 画布管理、节点/边永久存储、跨群关系持久化、嵌套结构保存

## 持久化设计方案

### 1. 数据持久化范围
- **画布管理**: 画布创建、删除、元数据
- **节点数据**: 位置、内容、标签、属性、嵌套关系
- **边数据**: 连接关系、样式、跨群属性
- **群组数据**: 嵌套结构、边界信息、节点集合
- **历史状态**: 操作历史、快照管理

### 2. 数据库选择建议
- **Neo4j**: 图结构、嵌套关系、跨群连接
- **Elasticsearch**: 内容搜索、全文索引
- **Redis**: 会话管理、实时协作、缓存

### 3. 持久化策略
- 自动保存（防抖机制）
- 操作历史快照
- 离线数据同步
- 实时协作支持