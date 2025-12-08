# 知识图谱项目数据库架构兼容性分析

## 使用单一数据库替代 Neo4j 的方案

### 方案一：仅使用 MongoDB（推荐）
**兼容性评分：9/10**

#### 优势
- **图结构存储**：MongoDB 的文档结构可以很好地表示图结构
- **嵌套关系**：天然支持嵌套文档，适合存储群组-节点关系
- **查询灵活性**：支持复杂的图遍历查询
- **性能优化**：通过索引和聚合管道优化图查询性能
- **开发简单**：减少技术栈复杂度

#### 实现方式
```
// Canvas 集合
{
  id: "canvas-1",
  title: "画布标题",
  createdAt: ISODate,
  nodes: [
    {
      id: "node-1",
      type: "node",
      title: "节点标题",
      position: { x: 100, y: 200 },
      content: "节点内容",
      // 支持嵌套
      children: [
        // 嵌套节点
      ],
      groupId: "group-1"
    },
    {
      id: "group-1", 
      type: "group",
      title: "群组标题",
      position: { x: 50, y: 50 },
      nodeIds: ["node-2", "node-3"],
      children: [...]
    }
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      data: {
        isCrossGroup: true,
        weight: 1.0,
        strength: 1.0
      }
    }
  ]
}
```

#### 查询示例
```javascript
// 查找节点的所有连接
db.canvases.aggregate([
  { $match: { id: "canvas-1" } },
  { $unwind: "$edges" },
  { $match: { $or: [{ "edges.source": "node-1" }, { "edges.target": "node-1" }] } }
])
```

### 方案二：仅使用 PostgreSQL（中等复杂度）
**兼容性评分：7/10**

#### 优势
- **ACID 事务**：保证数据一致性
- **图扩展**：PostGIS 或图扩展插件
- **成熟度**：技术成熟，社区支持好

#### 实现挑战
- 需要设计复杂的表关系来表示图结构
- 嵌套查询性能可能不如图数据库
- 多对多关系处理复杂

#### 表结构示例
```sql
-- 画布表
CREATE TABLE canvases (
  id VARCHAR PRIMARY KEY,
  title VARCHAR,
  created_at TIMESTAMP
);

-- 节点表（支持节点和群组）
CREATE TABLE nodes (
  id VARCHAR PRIMARY KEY,
  canvas_id VARCHAR REFERENCES canvases(id),
  type VARCHAR, -- 'node' or 'group'
  title VARCHAR,
  content TEXT,
  position JSONB, -- {x: number, y: number}
  parent_id VARCHAR REFERENCES nodes(id), -- 支持嵌套
  group_id VARCHAR REFERENCES nodes(id) -- 所属群组
);

-- 边表
CREATE TABLE edges (
  id VARCHAR PRIMARY KEY,
  canvas_id VARCHAR REFERENCES canvases(id),
  source_id VARCHAR REFERENCES nodes(id),
  target_id VARCHAR REFERENCES nodes(id),
  data JSONB
);
```

### 方案三：仅使用 Elasticsearch（不推荐）
**兼容性评分：5/10**

#### 限制
- 不适合复杂的图遍历操作
- 数据更新频繁可能影响性能
- 嵌套关系查询复杂

## 项目适配方案

### 针对当前项目的调整

#### 1. 状态管理适配
```typescript
// 原来的状态管理结构可以基本保持不变
// 只需调整数据加载和保存的逻辑
export const useGraphStore = create<GraphStore>()((set, get, api) => ({
  // 从 MongoDB 加载数据
  loadCanvas: async (canvasId: string) => {
    const canvasData = await apiService.getCanvas(canvasId);
    set({
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      // ... 其他状态
    });
  },
  
  // 保存到 MongoDB
  saveCanvas: async () => {
    const state = get();
    await apiService.updateCanvas(state.canvasId, {
      nodes: state.nodes,
      edges: state.edges,
      // ... 其他状态
    });
  }
}))
```

#### 2. 嵌套关系处理
MongoDB 的嵌套文档结构可以很好地处理当前项目的嵌套关系:
- 群组-节点关系可以通过 `children` 数组表示
- 群组-群组关系可以通过嵌套结构表示
- 跨群关系可以通过 `groupId` 字段和 `isCrossGroup` 标识处理

#### 3. 查询优化
```javascript
// 为常用查询创建索引
db.canvases.createIndex({ "nodes.groupId": 1 })
db.canvases.createIndex({ "edges.source": 1, "edges.target": 1 })
db.canvases.createIndex({ "nodes.position.x": 1, "nodes.position.y": 1 })
```

## 性能考虑

### MongoDB 方案性能特点
- **读取性能**：单文档读取非常快，适合加载完整画布
- **写入性能**：批量更新可能较慢，但可以通过优化文档结构改善
- **图遍历**：通过聚合管道可以实现复杂的图查询
- **扩展性**：MongoDB 分片支持大规模数据

### 查询性能优化建议
1. 预计算常用的图遍历路径
2. 使用合适的索引（复合索引、文本索引）
3. 缓存频繁查询的结果
4. 分页处理大数据量场景

## 实施建议

### 推荐方案：MongoDB
**理由**:
1. 与当前数据结构高度兼容
2. 支持复杂的嵌套关系
3. 查询灵活性高
4. 开发复杂度适中
5. 性能表现良好

### 实施步骤
1. **第一步**: 设计 MongoDB 文档结构
2. **第二步**: 实现数据访问层 (DAO)
3. **第三步**: 调整前端状态管理
4. **第四步**: 实现 API 接口
5. **第五步**: 测试和优化

### 迁移路径
1. 保持现有前端界面不变
2. 修改数据存储和加载逻辑
3. 逐步替换原有的临时数据生成
4. 添加数据持久化功能

## 总结

**完全可行**：不使用 Neo4j，仅用 MongoDB 完全可以实现当前项目的所有功能，包括：
- ✅ 画布管理
- ✅ 节点/群组/边的创建和管理
- ✅ 嵌套群组关系
- ✅ 跨群关系
- ✅ 节点转换功能
- ✅ 布局功能
- ✅ 搜索功能

**兼容性良好**：MongoDB 的文档模型与当前项目的数据结构高度匹配，可以提供几乎相同的功能和性能表现。