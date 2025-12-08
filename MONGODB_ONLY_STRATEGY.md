# 使用 MongoDB 作为单一数据库的实现策略

## 核心结论：完全可以！

**MongoDB 完全可以满足当前项目的全部需求**，无需引入 ES 和 Neo4j。

## MongoDB 完全满足的功能需求

### 1. 画布管理
```javascript
// Canvas 集合 - 完美支持画布管理
{
  id: "canvas-1",
  title: "知识图谱",
  description: "项目描述",
  createdAt: ISODate,
  updatedAt: ISODate,
  status: "active",
  tags: ["标签1", "标签2"]
}
```

### 2. 节点数据存储
```javascript
// Nodes 字段 - 支持所有节点类型和属性
nodes: [
  {
    id: "node-1",
    type: "note",  // 支持 node/group 两种类型
    title: "节点标题",
    content: "节点内容，支持Markdown格式",
    position: { x: 100, y: 200 },
    width: 350,
    height: 280,
    isExpanded: false,
    groupId: "group-1",  // 群组归属
    tags: ["重要", "概念"],
    attributes: {  // 自定义属性
      priority: "high",
      difficulty: "medium"
    },
    createdAt: ISODate,
    updatedAt: ISODate
  }
]
```

### 3. 群组和嵌套结构
```javascript
// MongoDB 的嵌套文档结构完美支持群组嵌套
{
  id: "group-1",
  type: "group",
  title: "主群组",
  position: { x: 0, y: 0 },
  width: 600,
  height: 400,
  children: [  // 嵌套节点
    {
      id: "nested-group-1",
      type: "group",
      title: "子群组",
      children: [
        {
          id: "node-inside-nested",
          type: "node",
          title: "嵌套节点"
        }
      ]
    }
  ],
  nodeIds: ["node-2", "node-3"]  // 群组内节点ID列表
}
```

### 4. 边关系存储
```javascript
// Edges 字段 - 完整支持所有边属性
edges: [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    sourceHandle: "right",
    targetHandle: "left",
    label: "关系标签",
    data: {
      isCrossGroup: true,        // 跨群关系
      sourceGroupId: "group-1",
      targetGroupId: "group-2",
      weight: 1.0,              // 关系权重
      strength: 0.8,            // 关系强度
      direction: "bidirectional", // 方向性
      color: "#FFA500",
      strokeWidth: 2
    },
    createdAt: ISODate,
    updatedAt: ISODate
  }
]
```

## MongoDB 原生支持的功能

### 1. 嵌套查询能力
```javascript
// 查询特定群组内的所有节点
db.canvases.aggregate([
  { $unwind: "$nodes" },
  { $match: { "nodes.groupId": "group-1" } }
])

// 查询节点的所有连接边
db.canvases.findOne(
  { id: "canvas-1" },
  { 
    edges: { 
      $elemMatch: { 
        $or: [
          { source: "node-1" },
          { target: "node-1" }
        ]
      }
    }
  }
)
```

### 2. 位置和边界计算
```javascript
// 更新群组边界以适应内部节点
db.canvases.updateOne(
  { id: "canvas-1", "nodes.id": "group-1" },
  { 
    $set: { 
      "nodes.$.boundary": {
        minX: 100,
        minY: 100, 
        maxX: 500,
        maxY: 400
      }
    }
  }
)
```

### 3. 转换功能支持
```javascript
// 支持节点-群组转换的存储结构
{
  convertedFrom: "group",  // 转换来源
  isConverted: true,       // 转换状态
  savedChildren: [...],    // 保存的子节点
  savedEdges: [...],       // 保存的边关系
  originalPosition: { x: 100, y: 100 },
  originalSize: { width: 300, height: 200 }
}
```

## 项目现有功能的完美适配

### 1. 状态管理适配
```typescript
// 只需修改数据加载和保存逻辑，状态管理结构不变
export const useGraphStore = create<GraphStore>()((set, get) => ({
  loadCanvas: async (canvasId: string) => {
    // 从 MongoDB 加载完整画布数据
    const canvas = await mongoDb.collection('canvases').findOne({ id: canvasId });
    set({
      nodes: canvas.nodes,
      edges: canvas.edges,
      viewport: canvas.viewport,
      // ... 其他状态
    });
  },
  
  saveCanvas: async () => {
    const state = get();
    await mongoDb.collection('canvases').updateOne(
      { id: state.canvasId },
      { 
        $set: { 
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
          updatedAt: new Date()
        }
      },
      { upsert: true }  // 不存在则插入
    );
  }
}))
```

### 2. 嵌套关系处理
```javascript
// MongoDB 原生支持的嵌套查询
// 获取所有后代节点
db.canvases.aggregate([
  { $unwind: "$nodes" },
  { $match: { 
    "id": "canvas-1",
    $expr: { 
      $or: [
        { $eq: ["$nodes.id", "target-group"] },
        { $regexMatch: { input: "$nodes.groupId", regex: "^.*" } }
      ]
    }
  }}
])
```

## 未来扩展策略

### 1. 后期添加 Elasticsearch
```javascript
// 当需要搜索功能时，可以单独添加 ES
// 数据同步策略：
// - MongoDB 作为主数据库
// - 变更时同步到 ES
// - 搜索时查询 ES，获取详细信息时查 MongoDB

async function syncToES(nodeData) {
  await esClient.index({
    index: 'nodes',
    id: nodeData.id,
    body: {
      title: nodeData.title,
      content: nodeData.content,
      tags: nodeData.tags,
      canvasId: nodeData.canvasId
    }
  });
}
```

### 2. 后期添加 Neo4j
```javascript
// 如果需要复杂的图算法，可以将关系数据同步到 Neo4j
// 但当前项目的核心功能 MongoDB 已经足够
```

## 索引优化策略

### 1. 基础索引
```javascript
// 画布查询优化
db.canvases.createIndex({ id: 1 })

// 群组内节点查询优化  
db.canvases.createIndex({ "nodes.groupId": 1 })

// 连接关系查询优化
db.canvases.createIndex({ "edges.source": 1, "edges.target": 1 })

// 位置查询优化
db.canvases.createIndex({ "nodes.position.x": 1, "nodes.position.y": 1 })
```

### 2. 复合索引
```javascript
// 画布+群组组合查询
db.canvases.createIndex({ id: 1, "nodes.groupId": 1 })

// 画布+节点类型组合查询
db.canvases.createIndex({ id: 1, "nodes.type": 1 })
```

## 部署和维护简化

### 1. 单一数据库优势
- ✅ 部署简单：只需维护一个数据库
- ✅ 运维成本低：监控、备份、扩展都更简单
- ✅ 数据一致性：无需考虑多库同步问题
- ✅ 开发复杂度低：只需一个连接池

### 2. 性能考虑
- ✅ 读取性能：单文档读取非常快
- ✅ 写入性能：批量操作优化
- ✅ 内存使用：避免多库内存占用

## 实施建议

### 第一阶段：MongoDB 原型
1. **设计文档结构**（已完成）
2. **实现数据访问层** 
3. **整合到现有前端**（修改状态管理）
4. **测试核心功能**

### 第二阶段（可选）：功能增强
1. **添加 Elasticsearch**（需要搜索时）
2. **添加 Neo4j**（需要复杂图算法时）

## 总结

**MongoDB 完全足够**！当前知识图谱项目的所有功能需求都能通过 MongoDB 一个数据库实现：

- ✅ 画布创建和管理
- ✅ 节点/边/群组的完整 CRUD
- ✅ 多层嵌套群组关系
- ✅ 跨群关系处理
- ✅ 节点转换功能
- ✅ 布局和位置管理
- ✅ 自动保存和历史记录
- ✅ 实时协作基础功能

后期需要时再添加 ES 和 Neo4j 即可，但现在 MongoDB 一个数据库就能完美满足所有需求。