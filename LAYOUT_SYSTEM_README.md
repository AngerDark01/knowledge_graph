# 知识图谱自动布局系统

## 概述

知识图谱自动布局系统是一个为知识图谱编辑器设计的布局算法库，旨在解决节点重叠、布局混乱等问题，提供多种布局策略以满足不同的可视化需求。

## 功能特性

### 1. 多种布局策略
- **网格中心布局**: 将高权重节点放置在中心，其他节点环绕排列
- **组感知布局**: 优先处理组内节点布局，保持组结构清晰
- **边优化**: 优化边的连接点和路径，减少交叉
- **综合布局**: 结合节点布局、组布局和边优化的综合方案

### 2. 智能权重计算
- 基于节点面积、连接边数等因素计算节点权重
- 高权重节点优先放置在显眼位置

### 3. 碰撞检测与解决
- 实时检测节点间碰撞
- 使用排斥力算法解决重叠问题

### 4. 嵌套结构支持
- 支持任意层级的嵌套组结构
- 理解并保持组的层级关系

### 5. API接口
- 提供后端API接口，支持远程调用
- 返回标准格式的布局结果

## 系统架构

```
┌─────────────────────────────────┐
│           UI组件                │
├─────────────────────────────────┤
│        布局管理器               │
├─────────────────────────────────┤
│  ┌─────────────┐ ┌──────────┐   │
│  │网格中心布局 │ │组感知布局│   │
│  └─────────────┘ └──────────┘   │
│  ┌─────────────┐ ┌──────────┐   │
│  │边优化策略   │ │综合布局  │   │
│  └─────────────┘ └──────────┘   │
├─────────────────────────────────┤
│         工具函数库              │
│  ┌─────────────┐ ┌──────────┐   │
│  │几何计算工具 │ │配置管理 │   │
│  └─────────────┘ └──────────┘   │
└─────────────────────────────────┘
```

## 使用方法

### 1. UI触发
在知识图谱编辑器中，点击"应用布局"按钮，选择合适的布局策略。

### 2. API调用
```javascript
// POST请求到 /api/layout
fetch('/api/layout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nodes: [...],  // 节点数组
    edges: [...],  // 边数组
    strategy: 'composite-layout',  // 布局策略
    options: {}    // 可选参数
  })
})
```

### 3. 后端集成
```typescript
import { LayoutManager, CompositeLayoutStrategy } from './services/layout';

const layoutManager = new LayoutManager();
layoutManager.registerStrategy('composite-layout', new CompositeLayoutStrategy());

const result = await layoutManager.applyLayout(nodes, edges, {
  strategy: 'composite-layout'
});
```

## API接口

### POST /api/layout
应用布局算法

**请求体**:
```json
{
  "nodes": [...],
  "edges": [...],
  "strategy": "composite-layout",
  "options": {}
}
```

**响应**:
```json
{
  "success": true,
  "positions": {
    "node1": {"x": 100, "y": 200},
    "node2": {"x": 150, "y": 250}
  },
  "stats": {
    "duration": 120,
    "iterations": 3,
    "collisions": 0
  }
}
```

### GET /api/layout?action=strategies
获取支持的布局策略

**响应**:
```json
{
  "success": true,
  "strategies": [
    {
      "id": "composite-layout",
      "name": "Composite Layout",
      "description": "A comprehensive layout strategy..."
    }
  ]
}
```

## 策略说明

### 网格中心布局 (grid-center-layout)
- 将高权重节点放置在布局中心
- 其他节点按网格模式环绕排列
- 适用于强调重要节点的场景

### 组感知布局 (group-aware-layout)
- 优先处理组内节点的布局
- 保持组的边界和层级结构清晰
- 适用于有明显分组结构的图谱

### 边优化 (edge-optimization)
- 优化边的连接点选择
- 减少边的交叉和重叠
- 改善整体视觉效果

### 综合布局 (composite-layout)
- 结合以上多种策略
- 全面优化节点位置和边路径
- 适用于复杂图谱的完整布局

## 性能优化

- **智能缓存**: 对相同输入缓存布局结果
- **渐进式布局**: 支持分步处理大型图谱
- **内存管理**: 及时释放不再需要的数据

## 错误处理

系统包含完善的错误处理机制:
- 输入数据验证
- 算法异常捕获
- 降级策略支持

## 扩展性

系统设计具有良好的扩展性:
- 支持自定义布局策略
- 可配置的参数设置
- 模块化架构设计

## 技术栈

- **前端框架**: React, Next.js
- **图形库**: ReactFlow
- **状态管理**: Zustand
- **构建工具**: TypeScript