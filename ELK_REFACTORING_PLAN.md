# 方案A：ELK 完全改造实施计划

## 📋 执行摘要

**目标：** 用 ELK 完全替代当前的自定义布局系统
**时间估算：** 2-3 周（80-100 小时）
**代码变化：** 删除 ~700 行 → 新增 ~300 行 = 净减少 ~400 行
**核心收益：** 代码简洁，性能提升 50%+，维护成本降低

---

## 🎯 阶段1：准备和框架设计（2-3 天）

### 1.1 安装和验证
```bash
npm install elkjs --save
npm install @types/elkjs --save-dev
```

### 1.2 新增文件结构
```
src/services/layout/
├─ algorithms/
│  ├─ ElkLayoutAdapter.ts         (新建, ~200行)
│  └─ ElkLayoutAlgorithm.ts       (新建, ~100行)
│
├─ LayoutManager.ts               (修改, ~15行)
├─ LayoutManagerV2.ts             (新建, ~150行, 两个接口的实现)
│
├─ strategies/                    (删除或简化)
│  ├─ GroupLayoutStrategy.ts       (删除)
│  ├─ CanvasLayoutStrategy.ts      (删除)
│  └─ RecursiveLayoutStrategy.ts   (删除)
│
└─ utils/
   ├─ EdgeOptimizer.ts            (保留, 简化)
   ├─ CollisionResolver.ts        (删除)
   ├─ GridAlgorithm.ts            (删除)
   ├─ GridCenterAlgorithm.ts       (删除)
   ├─ GroupSizeAdjuster.ts        (删除)
   ├─ NestedNodePositionUpdater.ts (删除)
   └─ ... (其他保留)
```

### 1.3 核心类设计

```typescript
// 新的管理器接口
export interface ILayoutManagerV2 {
  // 接口1：全局布局
  applyGlobalLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GlobalLayoutOptions
  ): Promise<LayoutResult>;

  // 接口2：局部布局
  applyLocalLayout(
    selectedNodeIds: string[],
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    options?: LocalLayoutOptions
  ): Promise<LayoutResult>;
}
```

---

## 🎯 阶段2：核心代码实现（1 周）

### 2.1 ElkLayoutAdapter（数据转换）
**职责：** 你的数据结构 ↔ ELK 格式转换

**方向1：** `toElkGraph` - 你的格式 → ELK 格式
```typescript
toElkGraph(nodes: (Node | Group)[], edges: Edge[]) {
  // 1. 根据 node.groupId 构建树结构
  // 2. 处理递归嵌套
  // 3. 转换边关系
  // 4. 设置 ELK 配置选项
  return elkGraph;
}
```

**方向2：** `fromElkGraph` - ELK 结果 → 你的格式
```typescript
fromElkGraph(elkResult: any, originalNodes: (Node | Group)[], originalEdges: Edge[]) {
  // 1. 提取 ELK 输出的坐标
  // 2. 转换回你的 Node/Group 结构
  // 3. 保留所有不相关的属性
  // 4. 构建 LayoutResult
  return layoutResult;
}
```

### 2.2 ElkLayoutAlgorithm（算法包装）
**职责：** 实现 ILayoutAlgorithm 接口，调用 ELK

```typescript
export class ElkLayoutAlgorithm implements ILayoutAlgorithm {
  readonly name = 'ELK Layered Algorithm';
  readonly id = 'elk-layered';

  async calculate(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutAlgorithmOptions
  ): Promise<LayoutResult> {
    // 调用 ElkLayoutAdapter 进行转换
    // 调用 ELK 进行布局
    // 转换回结果
  }
}
```

### 2.3 LayoutManagerV2（核心接口）
**职责：** 提供两个高层接口

**实现 applyGlobalLayout：**
```typescript
async applyGlobalLayout(nodes, edges, options) {
  // 配置 ELK 全局选项
  // 调用 elk.layout()
  // 返回包含所有节点的结果
}
```

**实现 applyLocalLayout：**
```typescript
async applyLocalLayout(selectedNodeIds, allNodes, allEdges, options) {
  // 1. 提取子图
  // 2. 调用 elk.layout()
  // 3. 合并结果（选中节点更新，其他保持原样）
  // 4. 返回结果
}
```

**特殊处理 - 群组内部布局：**
```typescript
async applyGroupInternalLayout(groupId, allNodes, allEdges, options) {
  // 1. 只布局该群组的子节点
  // 2. 自动计算群组大小
  // 3. 保持其他节点位置不变
}
```

---

## 🎯 阶段3：集成和测试（1 周）

### 3.1 修改 LayoutManager
- 注册 ElkLayoutAlgorithm 替代旧算法
- 保留 ILayoutManager 接口兼容性
- 可选：同时支持两套系统（灰度测试）

### 3.2 单元测试
**测试 ElkLayoutAdapter：**
- `toElkGraph()` 正确性
- `fromElkGraph()` 正确性
- 嵌套场景
- 边界情况（空图、单节点等）

**测试 ElkLayoutAlgorithm：**
- 基础布局
- 嵌套容器
- 大量边
- 跨层边

**测试 LayoutManagerV2：**
- applyGlobalLayout 功能
- applyLocalLayout 功能
- applyGroupInternalLayout 功能
- 结果的正确性

### 3.3 集成测试
- UI 集成（LayoutControl）
- Store 集成（数据流）
- API 集成（HTTP 端点）

### 3.4 性能测试
- 100 节点布局速度
- 1000 节点布局速度
- 与旧系统的对比

---

## 🎯 阶段4：清理和优化（3-4 天）

### 4.1 删除旧代码
```
删除清单：
✅ src/services/layout/algorithms/GridAlgorithm.ts
✅ src/services/layout/algorithms/GridCenterAlgorithm.ts
✅ src/services/layout/utils/CollisionResolver.ts
✅ src/services/layout/utils/GroupSizeAdjuster.ts
✅ src/services/layout/utils/NestedNodePositionUpdater.ts
✅ src/services/layout/utils/CoordinateTransformer.ts (可选)
✅ src/services/layout/strategies/GroupLayoutStrategy.ts
✅ src/services/layout/strategies/CanvasLayoutStrategy.ts
✅ src/services/layout/strategies/RecursiveLayoutStrategy.ts
✅ 相关配置删除 (GRID_LAYOUT 等)
```

### 4.2 简化 EdgeOptimizer
- 删除与节点位置相关的代码
- 专注于连接点计算

### 4.3 配置简化
**删除：**
- GRID_LAYOUT
- layoutAlgorithm 相关配置
- collision 相关配置

**新增：**
- ELK_CONFIG（140+ 选项的默认配置）
- 全局布局和局部布局的配置预设

---

## 📊 详细的代码量对比

### 删除代码
```
GridAlgorithm.ts                    100 行 ❌
GridCenterAlgorithm.ts              150 行 ❌
CollisionResolver.ts                150 行 ❌
GroupSizeAdjuster.ts                100 行 ❌
NestedNodePositionUpdater.ts        120 行 ❌
GroupLayoutStrategy.ts              150 行 ❌
CanvasLayoutStrategy.ts             200 行 ❌
RecursiveLayoutStrategy.ts          300 行 ❌
配置删除 (GRID_LAYOUT 等)           50 行 ❌
────────────────────────────────────────
总计删除                            1320 行 ❌
```

### 新增代码
```
ElkLayoutAdapter.ts                 200 行 ✅
ElkLayoutAlgorithm.ts               100 行 ✅
LayoutManagerV2.ts                  250 行 ✅
ELK_CONFIG                          100 行 ✅
类型定义和接口                       50 行 ✅
────────────────────────────────────────
总计新增                            700 行 ✅
```

### 修改代码
```
LayoutManager.ts                    20 行 (保持兼容)
EdgeOptimizer.ts                    50 行 (简化)
LayoutControl.tsx                   0 行 (完全兼容，不改)
route.ts                            0 行 (完全兼容，不改)
────────────────────────────────────────
总计修改                            70 行 ✅
```

**净代码变化：** -700 行（删除1320 - 新增700）

---

## 🔑 关键实现细节

### 核心1：ELK 配置预设

```typescript
// 全局布局配置
const GLOBAL_LAYOUT_CONFIG = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': 100,
  'elk.spacing.edgeEdge': 50,
  'elk.spacing.edgeNode': 30,
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.padding': '[top=40, left=20, bottom=20, right=20]'
};

// 群组内部布局配置
const GROUP_INTERNAL_CONFIG = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.padding': '[top=50, left=30, bottom=30, right=30]',
  'elk.spacing.nodeNode': 80
};
```

### 核心2：嵌套处理

```typescript
// 自动递归处理嵌套
toElkGraph(nodes, edges) {
  const elkChildren = nodes.map(node => {
    if (node.type === 'group') {
      return {
        id: node.id,
        width: node.width || 300,
        height: node.height || 200,
        layoutOptions: GROUP_INTERNAL_CONFIG,
        children: this.getGroupChildren(node.id, nodes),
        // ← 递归嵌套
      };
    } else {
      return {
        id: node.id,
        width: node.width || 100,
        height: node.height || 80
      };
    }
  });

  return {
    id: 'root',
    layoutOptions: GLOBAL_LAYOUT_CONFIG,
    children: elkChildren,
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target]
    }))
  };
}
```

### 核心3：局部布局的子图提取

```typescript
extractSubgraph(selectedNodeIds, allNodes, allEdges, includeChildren) {
  let subgraphNodes = new Set();
  let subgraphEdges = [];

  // 1. 添加选中节点
  selectedNodeIds.forEach(id => {
    const node = allNodes.find(n => n.id === id);
    subgraphNodes.add(node);
  });

  // 2. 如果包含子节点，递归添加
  if (includeChildren) {
    const toProcess = [...selectedNodeIds];
    while (toProcess.length > 0) {
      const nodeId = toProcess.pop();
      const children = allNodes.filter(n => n.groupId === nodeId);
      children.forEach(child => {
        if (!subgraphNodes.has(child)) {
          subgraphNodes.add(child);
          if (child.type === 'group') {
            toProcess.push(child.id);
          }
        }
      });
    }
  }

  // 3. 添加相关边（源和目标都在子图中）
  subgraphEdges = allEdges.filter(edge =>
    subgraphNodes.has(allNodes.find(n => n.id === edge.source)) &&
    subgraphNodes.has(allNodes.find(n => n.id === edge.target))
  );

  return {
    subgraphNodes: Array.from(subgraphNodes),
    subgraphEdges
  };
}
```

---

## 🧪 测试计划

### 单元测试用例

**测试1：基础全局布局**
```
输入：10 个顶层节点
期望：所有节点自动分层排列
验证：x, y, width, height 都正确
```

**测试2：嵌套容器**
```
输入：3 个容器，每个容器 3-5 个子节点
期望：容器自动调整大小，子节点自动排列
验证：容器大小 >= 所有子节点 + padding
```

**测试3：复杂边关系**
```
输入：20 节点，30 条边，包括跨容器边
期望：边自动优化路由，避免交叉
验证：边没有穿过节点，路由合理
```

**测试4：局部布局**
```
输入：选中 3 个节点，保持其他节点位置
期望：只更新选中节点及其相关节点
验证：未选中节点位置不变
```

### 性能基准测试

```typescript
// 测试不同规模的图
const scenarios = [
  { nodes: 50, edges: 80 },
  { nodes: 100, edges: 200 },
  { nodes: 500, edges: 1000 },
  { nodes: 1000, edges: 2000 }
];

for (const scenario of scenarios) {
  const startTime = performance.now();
  const result = await layoutManager.applyGlobalLayout(nodes, edges);
  const duration = performance.now() - startTime;

  console.log(`${scenario.nodes} 节点: ${duration}ms`);
}
```

---

## 📈 里程碑检查清单

### Week 1
- [ ] 安装 ELK，确认库的大小和兼容性
- [ ] 设计两个接口的详细规格
- [ ] 编写 ElkLayoutAdapter（85% 完成度）
- [ ] 编写 ElkLayoutAlgorithm（80% 完成度）
- [ ] 基础单元测试通过

### Week 2
- [ ] 编写 LayoutManagerV2（90% 完成度）
- [ ] 实现 applyGlobalLayout（完成）
- [ ] 实现 applyLocalLayout（完成）
- [ ] 实现 applyGroupInternalLayout（完成）
- [ ] 集成测试通过（90%)
- [ ] 性能测试完成

### Week 3
- [ ] 删除旧代码（CollisionResolver 等）
- [ ] 清理配置文件
- [ ] 所有测试通过（100%）
- [ ] 文档更新完成
- [ ] 代码提交和 PR

---

## ⚠️ 风险和缓解

| 风险 | 概率 | 缓解 |
|-----|------|------|
| 坐标系转换错误 | 中 | 充分的单元测试 |
| 性能回归 | 低 | 基准测试对比 |
| 嵌套处理问题 | 低 | ELK 成熟支持 |
| 边界情况遗漏 | 中 | 广泛的测试场景 |

---

## 📚 参考资源

- [ELK 官方文档](https://eclipse.dev/elk/)
- [elkjs 源代码](https://github.com/kieler/elkjs)
- [Mermaid ELK 实现](https://github.com/mermaid-js/mermaid)
- [ELK 配置选项大全](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered.html)

---

## 🎬 开始行动

**下一步：** 开始编写代码

1. ✅ ElkLayoutAdapter（核心数据转换）
2. ✅ ElkLayoutAlgorithm（ELK 包装）
3. ✅ LayoutManagerV2（两个接口实现）
4. ✅ 修改 LayoutManager（兼容性）
5. ✅ 单元测试
6. ✅ 删除旧代码
7. ✅ 提交和测试

---

**预计总时间：** 15-20 个工作日（含测试和验证）
