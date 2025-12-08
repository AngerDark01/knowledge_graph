# 知识图谱项目数据库表结构设计方案

## 1. Neo4j 表结构设计

### 1.1 节点标签定义
- Canvas (画布节点)
- Node (知识节点) 
- Group (群组节点)
- Edge (边节点)
- User (用户节点)

### 1.2 关系类型定义
- :CONTAINS - 画布包含节点/群组/边
- :CONNECTED_TO - 节点间的连接关系
- :BELONGS_TO - 节点/群组属于群组
- :NESTED_IN - 群组嵌套关系
- :CREATED_BY - 画布创建关系

### 1.3 数据结构定义

#### Canvas 节点
```
{
  id: "canvas-1",
  title: "知识图谱标题",
  description: "画布描述",
  status: "active/archived/deleted",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  config: {
    zoom: 1.0,
    position: {x: 0, y: 0},
    theme: "light/dark",
    gridSize: 12
  }
}
```

#### Node 节点
```
{
  id: "node-1",
  title: "节点标题",
  type: "node/group",
  isExpanded: false,
  width: 200,
  height: 100,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z"
}
```

#### Group 节点
```
{
  id: "group-1", 
  title: "群组标题",
  collapsed: false,
  minX: 0,
  minY: 0,
  maxX: 200,
  maxY: 100,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z"
}
```

#### Edge 节点
```
{
  id: "edge-1",
  label: "关系标签",
  weight: 1.0,
  strength: 1.0,
  direction: "unidirectional/bidirectional/undirected",
  isCrossGroup: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z"
}
```

### 1.4 Cypher 查询接口

#### 画布操作接口
```
// 创建画布
CREATE (c:Canvas {id: $id, title: $title, ...}) RETURN c

// 获取画布及其全部内容
MATCH (c:Canvas {id: $canvasId})-[r:CONTAINS]->(n)
OPTIONAL MATCH (n)-[:CONNECTED_TO]->(target)
RETURN c, collect(n), collect(r), collect(target)

// 删除画布
MATCH (c:Canvas {id: $canvasId}) DETACH DELETE c
```

#### 节点操作接口
```
// 添加节点到画布
MATCH (c:Canvas {id: $canvasId})
CREATE (c)-[:CONTAINS]->(n:Node {id: $nodeId, ...})

// 更新节点位置（通过属性）
MATCH (n:Node {id: $nodeId})
SET n.x = $x, n.y = $y
```

## 2. Elasticsearch 表结构设计

### 2.1 索引定义

#### canvas_contents 索引（画布内容）
```
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "canvasId": {"type": "keyword"},
      "type": {"type": "keyword"},  // node/group/edge
      "title": {"type": "text",
                "analyzer": "standard"},
      "content": {"type": "text",
                  "analyzer": "standard"},
      "position": {
        "properties": {
          "x": {"type": "float"},
          "y": {"type": "float"}
        }
      },
      "size": {
        "properties": {
          "width": {"type": "integer"},
          "height": {"type": "integer"}
        }
      },
      "attributes": {"type": "object"},
      "tags": {"type": "keyword"},
      "summary": {"type": "text"},
      "rdf": {"type": "object"},
      "createdAt": {"type": "date"},
      "updatedAt": {"type": "date"}
    }
  }
}
```

#### canvas_meta 索引（画布元信息）
```
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "title": {"type": "text",
                "analyzer": "standard"},
      "description": {"type": "text",
                     "analyzer": "standard"},
      "userId": {"type": "keyword"},
      "tags": {"type": "keyword"},
      "status": {"type": "keyword"},
      "createdAt": {"type": "date"},
      "updatedAt": {"type": "date"},
      "lastAccessedAt": {"type": "date"}
    }
  }
}
```

### 2.2 REST API 接口

#### 画布管理接口
```
// 创建画布
POST /canvas_meta/_doc
{
  "id": "canvas-1",
  "title": "新画布",
  "description": "画布描述",
  "userId": "user-1",
  "tags": ["标签1", "标签2"],
  "status": "active",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}

// 搜索画布
POST /canvas_meta/_search
{
  "query": {
    "multi_match": {
      "query": "搜索关键词",
      "fields": ["title", "description"]
    }
  }
}
```

#### 内容管理接口
```
// 添加节点内容
POST /canvas_contents/_doc
{
  "id": "node-1",
  "canvasId": "canvas-1", 
  "type": "node",
  "title": "节点标题",
  "content": "节点详细内容...",
  "position": {"x": 100, "y": 100},
  "size": {"width": 200, "height": 100},
  "attributes": {},
  "tags": ["tag1"],
  "summary": "摘要",
  "rdf": {},
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}

// 搜索节点内容
POST /canvas_contents/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"canvasId": "canvas-1"}},
        {"multi_match": {
          "query": "搜索内容",
          "fields": ["title", "content", "summary"]
        }}
      ]
    }
  }
}
```

## 3. Redis 数据结构设计

### 3.1 键值结构

#### 画布缓存
```
canvas:{canvasId} -> JSON (画布元信息)
canvas:{canvasId}:nodes -> Set (节点ID列表) 
canvas:{canvasId}:edges -> Set (边ID列表)
```

#### 用户会话
```
session:{sessionId} -> JSON (会话信息)
user:{userId}:active -> Set (用户活跃画布)
```

#### 实时协作状态
```
collaboration:{canvasId} -> Hash (协作用户状态)
collaboration:{canvasId}:operations -> List (操作队列)
```

#### 缓存策略键
```
cache:canvas:{canvasId}:ttl -> Integer (缓存过期时间)
cache:node:{nodeId}:ttl -> Integer (缓存过期时间)
```

## 4. 数据库接口调用时机

### 4.1 画布操作时机
- **创建画布**：用户点击"新建画布"按钮时
  - 同时写入 Neo4j（Canvas节点）
  - 同时写入 Elasticsearch（canvas_meta 索引）
  - 设置 Redis 缓存

- **打开画布**：用户选择画布时
  - 优先从 Redis 缓存读取
  - 缓存未命中时从 Neo4j 和 Elasticsearch 并行读取
  - 将数据写入 Redis 缓存

- **保存画布**：用户操作后（防抖后）
  - 同步更新 Neo4j 和 Elasticsearch
  - 更新 Redis 缓存

### 4.2 节点操作时机
- **添加节点**：用户拖拽或点击添加时
  - Neo4j: 创建 Node 节点，建立 :CONTAINS 关系
  - Elasticsearch: 添加 canvas_contents 文档
  - Redis: 更新缓存

- **移动节点**：用户拖拽结束后
  - Neo4j: 更新节点属性中的位置信息
  - Elasticsearch: 更新 position 字段
  - Redis: 更新缓存

- **修改节点内容**：编辑完毕时
  - Elasticsearch: 更新 content、title 等字段
  - Neo4j: 更新相应属性
  - Redis: 更新缓存

### 4.3 边操作时机
- **创建边**：用户连接节点时
  - Neo4j: 创建 Edge 节点，建立 :CONNECTED_TO 关系
  - Elasticsearch: 添加边的内容信息（如有）
  - Redis: 更新缓存

- **删除边**：用户删除连接时
  - Neo4j: 删除 Edge 节点和 :CONNECTED_TO 关系
  - Elasticsearch: 删除对应文档
  - Redis: 更新缓存

### 4.4 群组操作时机
- **创建群组**：用户创建群组时
  - Neo4j: 创建 Group 节点，建立 :CONTAINS 关系
  - Elasticsearch: 添加群组内容文档
  - Redis: 更新缓存

- **节点加入群组**：节点拖入群组时
  - Neo4j: 建立节点到群组的 :BELONGS_TO 关系
  - Elasticsearch: 更新节点所属群组信息
  - Redis: 更新缓存

### 4.5 实时协作时机
- **用户加入协作**：连接 WebSocket 时
  - Redis: 添加到协作用户集合
  - 订阅操作变更频道

- **操作同步**：用户执行操作时
  - Redis: 发布操作到频道
  - 其他用户通过订阅接收操作

- **操作应用**：接收同步操作时
  - 根据操作类型更新相应数据库
  - 应用到本地状态

## 5. 与现有 Store 的接口映射

### 5.1 画布管理（对应 CanvasViewSlice）
- `createCanvas()` -> Neo4j: CREATE Canvas, ES: POST canvas_meta
- `getCanvas()` -> Redis: GET cache, Fallback: Neo4j+ES queries  
- `updateCanvas()` -> Neo4j: SET properties, ES: UPDATE

### 5.2 节点管理（对应 NodesSlice）
- `addNode()` -> Neo4j: CREATE Node + :CONTAINS, ES: POST canvas_contents
- `updateNode()` -> Neo4j: SET properties, ES: UPDATE canvas_contents
- `deleteNode()` -> Neo4j: DETACH DELETE, ES: DELETE
- `moveNode()` -> Neo4j: SET position, ES: UPDATE position

### 5.3 边管理（对应 EdgesSlice） 
- `addEdge()` -> Neo4j: CREATE Edge + :CONNECTED_TO
- `updateEdge()` -> Neo4j: SET Edge properties
- `deleteEdge()` -> Neo4j: DETACH DELETE

### 5.4 群组管理（对应 GroupOperations）
- `addGroup()` -> Neo4j: CREATE Group + :CONTAINS
- `addNodeToGroup()` -> Neo4j: CREATE :BELONGS_TO relationship
- `removeNodeFromGroup()` -> Neo4j: DELETE :BELONGS_TO relationship