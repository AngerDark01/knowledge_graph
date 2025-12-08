# MongoDB vs Elasticsearch 数据存储策略详解

## MongoDB vs Elasticsearch 核心区别

### MongoDB (文档数据库)
**核心优势：**
- **文档结构存储**：天然支持复杂的嵌套结构（群组-节点-群组的关系）
- **灵活的Schema**：可以存储异构的节点类型和属性
- **ACID事务**：保证数据一致性
- **实时读写**：适合频繁的增删改操作
- **复杂嵌套查询**：天然支持深度嵌套的群组结构

**适用场景：**
- 存储完整的画布数据结构
- 处理嵌套的群组关系
- 实时的节点/边操作
- 维护数据一致性

### Elasticsearch (搜索引擎) 
**核心优势：**
- **全文搜索**：快速的文本内容搜索能力
- **复杂查询**：强大的聚合分析能力
- **多字段检索**：支持标签、内容、标题等多维度搜索
- **相关性排序**：按匹配度排序结果

**适用场景：**
- 节点内容的全文搜索
- 标签和属性的复杂查询
- 智能推荐系统
- 数据分析和统计

## 建议的数据存储策略

### MongoDB 存储内容
```
Canvas Document {
  id: string,           // 画布唯一标识
  title: string,        // 画布标题
  description: string,  // 画布描述
  createdAt: Date,      // 创建时间
  updatedAt: Date,      // 更新时间
  nodes: [              // 节点数组
    {
      id: string,       // 节点唯一标识
      type: "node" | "group",  // 节点类型
      title: string,    // 节点标题
      content: string,  // 节点内容（用于数据库存储）
      position: { x: number, y: number },  // 位置坐标
      width: number,    // 宽度
      height: number,   // 高度
      // 嵌套关系
      groupId?: string, // 所属群组ID
      children: [ ... ], // 子节点（嵌套群组）
      nodeIds?: [string], // 群组内的节点ID列表
      // 业务属性
      tags: [string],   // 标签
      attributes: {},   // 自定义属性
      isExpanded: boolean, // 展开状态
      // 关系信息
      connectedNodes: [string], // 连接的节点ID
      createdAt: Date,
      updatedAt: Date
    }
  ],
  edges: [              // 边关系数组
    {
      id: string,
      source: string,   // 源节点ID
      target: string,   // 目标节点ID
      groupId?: string, // 所属群组ID（跨群关系）
      data: {
        isCrossGroup: boolean, // 是否跨群
        weight: number,        // 关系权重
        strength: number,      // 关系强度
        direction: string      // 方向性
      },
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

**为什么 MongoDB 适合存储这些数据：**
1. **嵌套关系**：群组-节点关系可以自然表示为嵌套文档
2. **复杂结构**：支持复杂的节点属性和层级关系
3. **事务一致性**：画布数据的修改需要保证一致性
4. **实时操作**：频繁的增删改查操作

### Elasticsearch 存储内容
```
Node Content Document {
  id: string,           // 节点ID（与MongoDB关联）
  canvasId: string,     // 画布ID
  title: string,        // 节点标题（用于搜索）
  content: string,      // 节点内容（用于全文搜索）
  summary: string,      // 摘要（用于搜索）
  tags: [string],       // 标签数组（用于过滤）
  attributes: {},       // 自定义属性（用于复杂查询）
  createdAt: date,      // 创建时间（用于时间范围搜索）
  updatedAt: date,      // 更新时间
  nodeType: string      // 节点类型（用于分类搜索）
}
```

**为什么 Elasticsearch 适合存储这些数据：**
1. **全文搜索**：对节点内容进行快速搜索
2. **多字段查询**：按标签、标题、内容等多维度搜索
3. **相关性排序**：按匹配度排序搜索结果
4. **聚合分析**：统计标签使用频率、内容分析等

## 典型查询场景对比

### MongoDB 查询场景
```javascript
// 1. 获取某个群组内的所有节点
db.canvases.aggregate([
  { $match: { id: "canvas-1" } },
  { $unwind: "$nodes" },
  { $match: { "nodes.groupId": "group-1" } }
])

// 2. 获取节点的所有连接关系
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

// 3. 更新节点位置和所有子节点
db.canvases.updateOne(
  { "id": "canvas-1", "nodes.id": "group-1" },
  { 
    $set: { 
      "nodes.$.position": { x: 100, y: 100 },
      "nodes.$.children": [ /* 更新子节点 */ ]
    }
  }
)
```

### Elasticsearch 查询场景
```javascript
// 1. 搜索包含特定内容的节点
{
  "query": {
    "multi_match": {
      "query": "机器学习",
      "fields": ["title", "content", "summary"]
    }
  }
}

// 2. 按标签和类型过滤
{
  "query": {
    "bool": {
      "must": [
        { "terms": { "tags": ["AI", "算法"] } },
        { "term": { "nodeType": "note" } }
      ]
    }
  }
}

// 3. 相关性搜索
{
  "query": {
    "more_like_this": {
      "fields": ["content", "title"],
      "like": "当前节点的内容",
      "min_term_freq": 1,
      "max_query_terms": 12
    }
  }
}
```

## 实际应用中的数据同步策略

### 双写策略
```javascript
// 创建节点时同时写入MongoDB和Elasticsearch
async function createNode(nodeData) {
  // 1. 保存到MongoDB
  const mongoResult = await mongoDb.collection('canvases').updateOne(
    { id: nodeData.canvasId },
    { $push: { nodes: nodeData } }
  );
  
  // 2. 同步到Elasticsearch
  if (mongoResult.modifiedCount > 0) {
    await esClient.index({
      index: 'node_contents',
      id: nodeData.id,
      body: {
        id: nodeData.id,
        canvasId: nodeData.canvasId,
        title: nodeData.title,
        content: nodeData.content,
        tags: nodeData.tags,
        // ... 其他搜索相关字段
      }
    });
  }
}
```

### 搜索流程
```javascript
// 用户搜索时的处理流程
async function searchNodes(query) {
  // 1. 在Elasticsearch中搜索
  const esResults = await esClient.search({
    index: 'node_contents',
    query: {
      multi_match: {
        query: query,
        fields: ['title', 'content', 'tags']
      }
    }
  });
  
  // 2. 获取节点ID列表
  const nodeIds = esResults.hits.hits.map(hit => hit._source.id);
  
  // 3. 从MongoDB获取完整节点信息
  const fullNodes = await mongoDb.collection('canvases').aggregate([
    { $unwind: "$nodes" },
    { $match: { "nodes.id": { $in: nodeIds } } },
    { $project: { node: "$nodes" } }
  ]).toArray();
  
  return fullNodes;
}
```

## 性能和扩展性考虑

### MongoDB 优化
- 创建复合索引：`{canvasId: 1, "nodes.groupId": 1}`
- 为位置查询创建索引：`{"nodes.position.x": 1, "nodes.position.y": 1}`
- 为连接关系创建索引：`{"edges.source": 1, "edges.target": 1}`

### Elasticsearch 优化
- 为内容字段设置合适的分析器
- 为标签字段使用keyword类型
- 配置副本数确保高可用

## 总结

**MongoDB 负责**：
- ✅ 完整的数据结构存储
- ✅ 实时的CRUD操作
- ✅ 复杂的嵌套关系
- ✅ 数据一致性保证
- ✅ 画布级别的操作

**Elasticsearch 负责**：
- ✅ 高性能全文搜索
- ✅ 复杂的多字段查询
- ✅ 相关性排序
- ✅ 数据分析和聚合
- ✅ 智能推荐功能

这种分工让每个数据库发挥自己最擅长的功能，MongoDB 处理结构化数据和关系，Elasticsearch 处理搜索和分析，实现最佳性能。